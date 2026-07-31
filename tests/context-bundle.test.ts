import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { buildContextBundle } from '../src/development/index.js';

describe('development context bundle', () => {
  const projectDir = path.join(process.cwd(), '.test-aictx-context-bundle');
  const cacheDir = path.join(projectDir, '.aictx-cache');
  const docsDir = path.join(projectDir, 'aictx-docs');
  const graphPath = path.join(projectDir, 'graphify-out', 'graph.json');
  const outputPath = path.join(projectDir, '.aictx', 'context-bundle.json');

  beforeEach(async () => {
    await fs.ensureDir(cacheDir);
    await fs.ensureDir(path.join(docsDir, 'architecture'));
    await fs.ensureDir(path.dirname(graphPath));
    await fs.writeJson(path.join(projectDir, 'aictx.json'), {
      version: '1.0',
      ides: ['codex'],
      tags: ['common']
    });
    await fs.writeFile(path.join(cacheDir, 'common.md'), `---\ntags: [common]\n---\n# Common Rule\n`);
    await fs.writeFile(path.join(docsDir, 'architecture', '00-Index.md'), `# Architecture\n\n<!-- aictx-index-start -->\n<!-- aictx-index-end -->\n`);
    await fs.writeFile(path.join(docsDir, 'architecture', 'runtime.md'), `---\ntags: [runtime]\nentities: [Context Packet]\ndescription: Runtime boundary\n---\n# Runtime\n`);
    await fs.writeJson(graphPath, { nodes: [{ id: 'runtime' }], links: [{ source: 'runtime', target: 'context' }] });
  });

  afterEach(async () => {
    await fs.remove(projectDir);
  });

  it('builds a deterministic bundle from rules, MOC documents and graph metadata', async () => {
    const options = { projectDir, cacheDir, docsDir, graphPath, outputPath, tags: ['common'] };
    const first = await buildContextBundle(options);
    const second = await buildContextBundle(options);

    expect(first.version).toBe(second.version);
    expect(first.rules).toHaveLength(1);
    expect(first.documents.map(document => document.path)).toContain('aictx-docs/architecture/runtime.md');
    expect(first.graph).toMatchObject({ nodes: 1, edges: 1 });
    expect(first.sources.map(source => source.path)).toEqual(expect.arrayContaining([
      '.aictx-cache/common.md',
      'aictx-docs/architecture/runtime.md',
      'graphify-out/graph.json',
      'aictx.json'
    ]));
    await expect(fs.pathExists(outputPath)).resolves.toBe(true);
  });
});
