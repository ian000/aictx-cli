#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

function createReleaseHelper(repoCwd = process.cwd()) {
  const packageJsonPath = path.join(repoCwd, "package.json");
  const releaseNotesDir = path.join(repoCwd, ".release-notes");
  const trustedPublisherWorkflowPath = path.join(repoCwd, ".github", "workflows", "ci.yml");
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  function run(commandText, options = {}) {
    return cp.execSync(commandText, {
      cwd: repoCwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    }).trim();
  }

  function tryRun(commandText) {
    try {
      return run(commandText);
    } catch {
      return "";
    }
  }

  function getCurrentBranch() {
    return tryRun("git branch --show-current");
  }

  function isCleanWorktree() {
    return tryRun("git status --short") === "";
  }

  function getCurrentVersion() {
    return pkg.version;
  }

  function getCurrentTag() {
    return `v${getCurrentVersion()}`;
  }

  function tagExists(tag) {
    const local = tryRun(`git tag -l "${tag}"`);
    const remote = tryRun(`git ls-remote --tags origin "refs/tags/${tag}"`);
    return Boolean(local || remote);
  }

  function getPreviousTag(currentTag) {
    const headTag = tryRun('git describe --tags --abbrev=0 --match "v*" HEAD');
    if (headTag && headTag !== currentTag) {
      return headTag;
    }

    return tryRun('git describe --tags --abbrev=0 --match "v*" HEAD^') || "";
  }

  function getCommitSubjects(previousTag) {
    const range = previousTag ? `${previousTag}..HEAD` : "HEAD";
    return tryRun(`git log ${range} --pretty=format:%s`)
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function ensureReleaseNotesDir() {
    fs.mkdirSync(releaseNotesDir, { recursive: true });
  }

  function buildReleaseNotes(currentTag, previousTag, commits) {
    const changes = commits.length > 0
      ? commits.map((subject) => `- ${subject}`).join("\n")
      : "- No commits found in the selected range.";

    return `# ${pkg.name} ${currentTag}

## Summary

- Package: \`${pkg.name}\`
- Version: \`${pkg.version}\`
- Previous tag: \`${previousTag || "none"}\`

## Changes

${changes}
`;
  }

  function writeReleaseNotes(currentTag, content) {
    ensureReleaseNotesDir();
    const filePath = path.join(releaseNotesDir, `${currentTag}.md`);
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  }

  function getTrustedPublisherChecks() {
    const workflowRelativePath = path.relative(repoCwd, trustedPublisherWorkflowPath);
    if (!fs.existsSync(trustedPublisherWorkflowPath)) {
      return {
        ready: false,
        workflow: workflowRelativePath,
        checks: [
          { name: "workflow exists", ok: false }
        ]
      };
    }

    const workflow = fs.readFileSync(trustedPublisherWorkflowPath, "utf-8");
    const checks = [
      { name: "tag trigger v*", ok: /tags:\s*\n\s*-\s*['"]?v\*/.test(workflow) },
      { name: "publish job has id-token: write", ok: /id-token:\s*write/.test(workflow) },
      { name: "npm registry configured", ok: /registry-url:\s*['"]?https:\/\/registry\.npmjs\.org['"]?/.test(workflow) },
      { name: "tag matches package version", ok: /GITHUB_REF_NAME#v/.test(workflow) && /package\.json/.test(workflow) },
      { name: "npm publish uses provenance", ok: /npm publish\b[\s\S]*--provenance/.test(workflow) }
    ];

    return {
      ready: checks.every((check) => check.ok),
      workflow: workflowRelativePath,
      checks
    };
  }

  function ensureTrustedPublisherReady() {
    const result = getTrustedPublisherChecks();

    if (result.ready) {
      return;
    }

    const missing = result.checks
      .filter((check) => !check.ok)
      .map((check) => check.name)
      .join(", ");

    throw new Error(`Trusted Publisher workflow is not ready (${result.workflow}): ${missing}`);
  }

  function printPlan() {
    const currentTag = getCurrentTag();
    const previousTag = getPreviousTag(currentTag);
    const commits = getCommitSubjects(previousTag);
    const releaseNotes = buildReleaseNotes(currentTag, previousTag, commits);
    const notesPath = writeReleaseNotes(currentTag, releaseNotes);
    const trustedPublisher = getTrustedPublisherChecks();

    console.log(`Package: ${pkg.name}`);
    console.log(`Version: ${pkg.version}`);
    console.log(`Tag: ${currentTag}`);
    console.log(`Branch: ${getCurrentBranch() || "(detached)"}`);
    console.log(`Clean worktree: ${isCleanWorktree() ? "yes" : "no"}`);
    console.log(`Previous tag: ${previousTag || "none"}`);
    console.log(`Tag already exists: ${tagExists(currentTag) ? "yes" : "no"}`);
    console.log(`Release notes: ${path.relative(repoCwd, notesPath)}`);
    console.log(`Trusted Publisher workflow: ${trustedPublisher.workflow}`);
    console.log(`Trusted Publisher ready: ${trustedPublisher.ready ? "yes" : "no"}`);
    for (const check of trustedPublisher.checks) {
      console.log(`  - ${check.ok ? "ok" : "missing"}: ${check.name}`);
    }
    console.log("");
    console.log(releaseNotes);
  }

  function createTag() {
    const currentTag = getCurrentTag();
    const branch = getCurrentBranch();

    if (branch !== "main") {
      throw new Error(`releases must be tagged from main. current branch: ${branch || "(detached)"}`);
    }

    if (!isCleanWorktree()) {
      throw new Error("working tree is not clean. commit or stash changes before tagging.");
    }

    if (tagExists(currentTag)) {
      throw new Error(`tag already exists: ${currentTag}`);
    }

    ensureTrustedPublisherReady();

    const previousTag = getPreviousTag(currentTag);
    const commits = getCommitSubjects(previousTag);
    const releaseNotes = buildReleaseNotes(currentTag, previousTag, commits);
    const notesPath = writeReleaseNotes(currentTag, releaseNotes);

    cp.execFileSync("git", ["tag", "-a", currentTag, "-F", notesPath], {
      cwd: repoCwd,
      stdio: "inherit"
    });

    console.log(`Created tag ${currentTag}`);
    console.log(`Next step: git push origin ${currentTag}`);
  }

  return {
    pkg,
    run,
    tryRun,
    getCurrentBranch,
    isCleanWorktree,
    getCurrentVersion,
    getCurrentTag,
    tagExists,
    getPreviousTag,
    getCommitSubjects,
    buildReleaseNotes,
    writeReleaseNotes,
    getTrustedPublisherChecks,
    ensureTrustedPublisherReady,
    printPlan,
    createTag
  };
}

function main() {
  const command = process.argv[2] || "plan";
  const helper = createReleaseHelper();

  if (command === "plan" || command === "notes") {
    helper.printPlan();
  } else if (command === "tag") {
    helper.createTag();
  } else {
    throw new Error(`unknown command: ${command}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`release-helper failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  createReleaseHelper
};
