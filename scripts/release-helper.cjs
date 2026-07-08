#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const cwd = process.cwd();
const command = process.argv[2] || "plan";
const packageJsonPath = path.join(cwd, "package.json");
const releaseNotesDir = path.join(cwd, ".release-notes");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

function run(commandText, options = {}) {
  return cp.execSync(commandText, {
    cwd,
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
  const tags = tryRun("git tag --list 'v*' --sort=-version:refname")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((tag) => tag !== currentTag);
  return tags[0] || "";
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

function printPlan() {
  const currentTag = getCurrentTag();
  const previousTag = getPreviousTag(currentTag);
  const commits = getCommitSubjects(previousTag);
  const releaseNotes = buildReleaseNotes(currentTag, previousTag, commits);
  const notesPath = writeReleaseNotes(currentTag, releaseNotes);

  console.log(`Package: ${pkg.name}`);
  console.log(`Version: ${pkg.version}`);
  console.log(`Tag: ${currentTag}`);
  console.log(`Branch: ${getCurrentBranch() || "(detached)"}`);
  console.log(`Clean worktree: ${isCleanWorktree() ? "yes" : "no"}`);
  console.log(`Previous tag: ${previousTag || "none"}`);
  console.log(`Tag already exists: ${tagExists(currentTag) ? "yes" : "no"}`);
  console.log(`Release notes: ${path.relative(cwd, notesPath)}`);
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

  const previousTag = getPreviousTag(currentTag);
  const commits = getCommitSubjects(previousTag);
  const releaseNotes = buildReleaseNotes(currentTag, previousTag, commits);
  const notesPath = writeReleaseNotes(currentTag, releaseNotes);

  cp.execFileSync("git", ["tag", "-a", currentTag, "-F", notesPath], {
    cwd,
    stdio: "inherit"
  });

  console.log(`Created tag ${currentTag}`);
  console.log(`Next step: git push origin ${currentTag}`);
}

try {
  if (command === "plan" || command === "notes") {
    printPlan();
  } else if (command === "tag") {
    createTag();
  } else {
    throw new Error(`unknown command: ${command}`);
  }
} catch (error) {
  console.error(`release-helper failed: ${error.message}`);
  process.exit(1);
}
