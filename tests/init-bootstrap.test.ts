import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { scaffoldBootstrapArtifacts } from '../src/core/init/bootstrap.js';

describe('init bootstrap artifacts', () => {
  const TEST_DIR = path.join(process.cwd(), '.test-init-bootstrap');
  const SOURCE_DIR = path.join(TEST_DIR, 'source');

  beforeEach(async () => {
    await fs.ensureDir(path.join(SOURCE_DIR, 'prd-assets'));
    await fs.ensureDir(path.join(TEST_DIR, 'aictx-docs', 'product'));
    await fs.ensureDir(path.join(TEST_DIR, 'aictx-docs', 'architecture'));
    await fs.ensureDir(path.join(TEST_DIR, 'aictx-docs', 'project'));

    await fs.writeFile(path.join(SOURCE_DIR, 'prd.md'), '# PRD\n');
    await fs.writeFile(path.join(SOURCE_DIR, 'tech-stack.md'), '# Tech Stack\n');
    await fs.writeFile(path.join(SOURCE_DIR, 'prd-assets', 'flow.png'), 'fake-image');
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('imports existing PRD and architecture docs and creates bootstrap todo', async () => {
    const result = await scaffoldBootstrapArtifacts({
      cwd: TEST_DIR,
      projectName: 'demo-app',
      fromPrd: path.join(SOURCE_DIR, 'prd.md'),
      fromArch: path.join(SOURCE_DIR, 'tech-stack.md')
    });

    expect(result.importedArtifacts).toHaveLength(2);
    expect(result.generatedArtifacts).toContain('aictx-docs/project/demo-app-bootstrap-todo.md');
    expect(await fs.readFile(path.join(TEST_DIR, 'aictx-docs/product/prd.md'), 'utf-8')).toContain('# PRD');
    expect(await fs.readFile(path.join(TEST_DIR, 'aictx-docs/architecture/tech-stack.md'), 'utf-8')).toContain('# Tech Stack');

    const todo = await fs.readFile(path.join(TEST_DIR, 'aictx-docs/project/demo-app-bootstrap-todo.md'), 'utf-8');
    expect(todo).toContain('aictx-docs/product/prd.md');
    expect(todo).toContain('aictx-docs/architecture/tech-stack.md');
    expect(todo).toContain('已提供技术架构输入');
  });

  it('creates an architecture seed doc when only summary is provided', async () => {
    const result = await scaffoldBootstrapArtifacts({
      cwd: TEST_DIR,
      projectName: 'demo-app',
      fromPrd: path.join(SOURCE_DIR, 'prd.md'),
      archSummary: 'Frontend Vue 3, Backend NestJS, DB PostgreSQL'
    });

    expect(result.generatedArtifacts).toContain('aictx-docs/architecture/demo-app-technical-architecture.md');
    const seedDoc = await fs.readFile(
      path.join(TEST_DIR, 'aictx-docs/architecture/demo-app-technical-architecture.md'),
      'utf-8'
    );
    expect(seedDoc).toContain('Frontend Vue 3, Backend NestJS, DB PostgreSQL');

    const todo = await fs.readFile(path.join(TEST_DIR, 'aictx-docs/project/demo-app-bootstrap-todo.md'), 'utf-8');
    expect(todo).toContain('demo-app-technical-architecture.md');
  });

  it('copies directories recursively when a source directory is provided', async () => {
    const result = await scaffoldBootstrapArtifacts({
      cwd: TEST_DIR,
      projectName: 'demo-app',
      fromPrd: path.join(SOURCE_DIR, 'prd-assets')
    });

    expect(result.importedArtifacts[0]?.type).toBe('directory');
    expect(await fs.pathExists(path.join(TEST_DIR, 'aictx-docs/product/prd-assets/flow.png'))).toBe(true);
  });
});
