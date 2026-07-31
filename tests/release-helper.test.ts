import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const { createReleaseHelper } = require('../scripts/release-helper.cjs');

describe('release helper', () => {
  const TEST_DIR = path.join(process.cwd(), '.test-release-helper');

  async function writeTrustedPublisherWorkflow(content?: string) {
    const workflowPath = path.join(TEST_DIR, '.github', 'workflows', 'ci.yml');
    await fs.ensureDir(path.dirname(workflowPath));
    await fs.writeFile(workflowPath, content ?? `name: CI/CD

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/setup-node@v4
        with:
          registry-url: 'https://registry.npmjs.org'
      - name: Verify tag matches package version
        run: |
          TAG_VERSION="\${GITHUB_REF_NAME#v}"
          PACKAGE_VERSION="$(node -p "require('./package.json').version")"
      - name: Publish to npm
        run: npm publish --access public --provenance
`);
  }

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    execSync('git init -b main', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: TEST_DIR, stdio: 'ignore' });
    await fs.writeJson(path.join(TEST_DIR, 'package.json'), {
      name: 'release-helper-test',
      version: '3.0.0'
    }, { spaces: 2 });
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('uses the nearest reachable ancestor tag instead of the highest global semver tag', async () => {
    await fs.writeFile(path.join(TEST_DIR, 'README.md'), 'base\n');
    execSync('git add . && git commit -m "base"', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git tag v1.0.0', { cwd: TEST_DIR, stdio: 'ignore' });

    await fs.writeFile(path.join(TEST_DIR, 'README.md'), 'main-tag\n');
    execSync('git add . && git commit -m "main release"', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git tag v2.0.0', { cwd: TEST_DIR, stdio: 'ignore' });

    await fs.writeFile(path.join(TEST_DIR, 'README.md'), 'main-head\n');
    execSync('git add . && git commit -m "main head"', { cwd: TEST_DIR, stdio: 'ignore' });

    execSync('git checkout -b maintenance v1.0.0', { cwd: TEST_DIR, stdio: 'ignore' });
    await fs.writeFile(path.join(TEST_DIR, 'HOTFIX.md'), 'hotfix\n');
    execSync('git add . && git commit -m "maintenance release"', { cwd: TEST_DIR, stdio: 'ignore' });
    execSync('git tag v2.1.0', { cwd: TEST_DIR, stdio: 'ignore' });

    execSync('git checkout main', { cwd: TEST_DIR, stdio: 'ignore' });

    const helper = createReleaseHelper(TEST_DIR);
    expect(helper.getPreviousTag('v3.0.0')).toBe('v2.0.0');
  });

  it('detects a trusted publisher ready workflow', async () => {
    await writeTrustedPublisherWorkflow();

    const helper = createReleaseHelper(TEST_DIR);
    const checks = helper.getTrustedPublisherChecks();

    expect(checks.ready).toBe(true);
    expect(checks.workflow).toBe('.github/workflows/ci.yml');
    expect(checks.checks.every((check: { ok: boolean }) => check.ok)).toBe(true);
  });

  it('blocks tagging when the trusted publisher workflow is incomplete', async () => {
    await writeTrustedPublisherWorkflow(`name: CI/CD

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    steps:
      - run: npm publish
`);

    const helper = createReleaseHelper(TEST_DIR);
    expect(() => helper.ensureTrustedPublisherReady()).toThrow(/Trusted Publisher workflow is not ready/);
  });
});
