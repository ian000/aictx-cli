import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { analyzeWithGraphify, resolveGraphifyCliPath } from '../src/utils/graphify.js';

describe('bundled graphify-go runtime', () => {
  const testDir = path.join(process.cwd(), '.test-graphify-runtime');
  const sourceDir = path.join(testDir, 'source');
  const outputDir = path.join(testDir, 'graphify-out');

  beforeEach(async () => {
    await fs.ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, 'main.ts'), 'export const main = true;\n');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('resolves graphify-go from the aictx-cli dependency tree', async () => {
    const cliPath = resolveGraphifyCliPath();

    expect(cliPath).toContain(`${path.sep}graphify-go${path.sep}cli.js`);
    await expect(fs.pathExists(cliPath)).resolves.toBe(true);
  });

  it('runs graphify-go when its command is absent from PATH', async () => {
    await analyzeWithGraphify(sourceDir, outputDir, {
      cwd: testDir,
      stdio: 'pipe',
      env: { ...process.env, PATH: '' }
    });

    await expect(fs.pathExists(path.join(outputDir, 'graph.json'))).resolves.toBe(true);
    await expect(fs.pathExists(path.join(outputDir, 'system-graph.md'))).resolves.toBe(true);
  });
});
