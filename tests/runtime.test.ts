import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { CONTEXT_SCHEMA_VERSION, sha256Text, type ContextBundle } from '../src/context/index.js';
import { prepareRuntimeContext, readRunManifest } from '../src/runtime/index.js';

describe('agent runtime context preparation', () => {
  const projectDir = path.join(process.cwd(), '.test-aictx-runtime');
  const sourceDir = path.join(projectDir, '.aictx-cache');
  const sourcePath = path.join(sourceDir, 'common.md');
  const bundlePath = path.join(projectDir, '.aictx', 'context-bundle.json');
  const runsDir = path.join(projectDir, '.aictx', 'runs');
  const sourceContent = '# Common Rule\n';

  beforeEach(async () => {
    await fs.ensureDir(sourceDir);
    await fs.ensureDir(path.dirname(bundlePath));
    await fs.writeFile(sourcePath, sourceContent);
    const bundle: ContextBundle = {
      schemaVersion: CONTEXT_SCHEMA_VERSION,
      version: 'bundle-v1',
      generatedAt: '2026-08-01T00:00:00.000Z',
      rules: [{
        id: 'common.md',
        sourcePath: '.aictx-cache/common.md',
        alwaysApply: true,
        content: sourceContent,
        tokens: 10,
        tags: ['common'],
        hash: sha256Text(sourceContent)
      }],
      documents: [],
      sources: [{ path: '.aictx-cache/common.md', hash: sha256Text(sourceContent) }],
      sourceRoots: [{ path: '.aictx-cache', extension: '.md' }]
    };
    await fs.writeJson(bundlePath, bundle);
  });

  afterEach(async () => {
    await fs.remove(projectDir);
  });

  it('prepares a packet and writes an auditable run manifest', async () => {
    const result = await prepareRuntimeContext({
      projectDir,
      bundlePath,
      runsDir,
      task: 'Implement a feature',
      budget: 100,
      documentLimit: 3
    });

    expect(result.packet.status).toBe('ready');
    expect(result.manifestPath).toBeTruthy();
    await expect(readRunManifest(runsDir, result.manifest.runId)).resolves.toMatchObject({
      bundleVersion: 'bundle-v1',
      status: 'ready'
    });
  });

  it('marks modified and newly added sources as stale without mutating them', async () => {
    await fs.writeFile(sourcePath, '# Changed\n');
    await fs.writeFile(path.join(sourceDir, 'new.md'), '# New\n');
    const result = await prepareRuntimeContext({
      projectDir,
      bundlePath,
      runsDir,
      task: 'Inspect context',
      budget: 100,
      documentLimit: 3,
      writeManifest: false
    });

    expect(result.packet.status).toBe('context_stale');
    expect(result.packet.freshness.issues).toEqual(expect.arrayContaining([
      { path: '.aictx-cache/common.md', reason: 'modified' },
      { path: '.aictx-cache/new.md', reason: 'added' }
    ]));
    await expect(fs.readFile(sourcePath, 'utf-8')).resolves.toBe('# Changed\n');
  });

  it('rejects unsafe run identifiers', async () => {
    await expect(readRunManifest(runsDir, '../manifest')).rejects.toThrow('Run ID 格式无效');
  });
});
