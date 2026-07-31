import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { ConfigParser } from '../src/config/index.js';
import { refreshContextBundleAfterSync } from '../src/commands/sync.js';

describe('v1 sync compatibility', () => {
  const projectDir = path.join(process.cwd(), '.test-aictx-sync-compat');
  const cacheDir = path.join(projectDir, '.aictx-cache');

  beforeEach(async () => {
    await fs.ensureDir(cacheDir);
    await fs.writeFile(path.join(cacheDir, 'common.md'), `---\ntags: [common]\n---\n# Common\n`);
    await fs.writeJson(path.join(projectDir, 'aictx.json'), {
      version: '1.0',
      repository: 'builtin',
      ides: ['codex'],
      tags: ['common']
    });
  });

  afterEach(async () => {
    await fs.remove(projectDir);
  });

  it('accepts an unchanged v1 configuration and applies Runtime defaults', async () => {
    const config = await new ConfigParser(projectDir).read();
    const result = await refreshContextBundleAfterSync(projectDir, config, cacheDir);

    expect(result.error).toBeUndefined();
    expect(result.version).toBeTruthy();
    expect(result.bundlePath).toBe(path.join(projectDir, '.aictx', 'context-bundle.json'));
    await expect(fs.pathExists(result.bundlePath)).resolves.toBe(true);
  });

  it('does not turn a new Bundle failure into a legacy sync failure', async () => {
    await fs.ensureDir(path.join(projectDir, 'graphify-out'));
    await fs.writeFile(path.join(projectDir, 'graphify-out', 'graph.json'), '{ invalid json');
    const config = await new ConfigParser(projectDir).read();
    const result = await refreshContextBundleAfterSync(projectDir, config, cacheDir);

    expect(result.version).toBeUndefined();
    expect(result.error).toBeTruthy();
    await expect(fs.pathExists(result.bundlePath)).resolves.toBe(false);
  });
});
