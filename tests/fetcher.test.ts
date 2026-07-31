import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fetchRules } from '../src/core/fetcher/index.js';

describe('rule fetcher', () => {
  const testDir = path.join(process.cwd(), '.test-aictx-fetcher');
  const cacheDir = path.join(testDir, 'project', '.aictx-cache');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('preserves the existing cache when remote clone fails', async () => {
    await fs.ensureDir(cacheDir);
    await fs.writeFile(path.join(cacheDir, 'keep.md'), '# Keep\n');

    await expect(fetchRules('file:///private/tmp/aictx-cli-no-such-repo.git', cacheDir)).rejects.toThrow('Git Clone 失败');

    expect(await fs.pathExists(path.join(cacheDir, 'keep.md'))).toBe(true);
  });

  it('replaces local rule snapshots only after a successful copy', async () => {
    const sourceDir = path.join(testDir, 'rules');
    await fs.ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, 'new.md'), '# New\n');
    await fs.ensureDir(cacheDir);
    await fs.writeFile(path.join(cacheDir, 'old.md'), '# Old\n');

    await fetchRules(sourceDir, cacheDir);

    expect(await fs.pathExists(path.join(cacheDir, 'new.md'))).toBe(true);
    expect(await fs.pathExists(path.join(cacheDir, 'old.md'))).toBe(false);
  });
});
