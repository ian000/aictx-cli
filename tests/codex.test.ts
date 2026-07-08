import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { CodexAdapter } from '../src/core/injector/index.js';
import { diagnoseDrift } from '../src/core/doctor/index.js';

describe('Codex integration', () => {
  const TEST_DIR = path.join(process.cwd(), '.test-codex-project');
  const CACHE_DIR = path.join(TEST_DIR, '.aictx-cache');

  beforeEach(async () => {
    await fs.ensureDir(CACHE_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('injects workflows and generates AGENTS.md plus skills for Codex', async () => {
    const adapter = new CodexAdapter();
    await adapter.inject(TEST_DIR, {
      rules: [
        {
          filename: 'common-global.md',
          content: '1. 请全程与用中文沟通\n',
          tags: ['common'],
          tokens: 10
        }
      ],
      stats: {
        totalScanned: 1,
        matchedRules: 1,
        ignoredRules: 0,
        matchedTokens: 10,
        ignoredTokens: 0
      }
    });

    const workflowPath = path.join(TEST_DIR, '.agents', 'workflows', 'aictx-common-global.md');
    const agentsPath = path.join(TEST_DIR, 'AGENTS.md');
    const skillPath = path.join(TEST_DIR, '.agents', 'skills', 'aictx-graphify', 'SKILL.md');

    expect(await fs.pathExists(workflowPath)).toBe(true);
    expect(await fs.readFile(workflowPath, 'utf-8')).toContain('请全程与用中文沟通');
    expect(await fs.readFile(agentsPath, 'utf-8')).toContain('.agents/workflows');
    expect(await fs.pathExists(skillPath)).toBe(true);
  });

  it('doctor can detect Codex workflow drift', async () => {
    await fs.writeFile(path.join(CACHE_DIR, 'common-global.md'), 'source rule\n', 'utf-8');
    await fs.ensureDir(path.join(TEST_DIR, '.agents', 'workflows'));
    await fs.writeFile(
      path.join(TEST_DIR, '.agents', 'workflows', 'aictx-common-global.md'),
      'tampered rule\n',
      'utf-8'
    );

    const issues = await diagnoseDrift(TEST_DIR, CACHE_DIR, ['codex']);
    expect(issues).toEqual([
      {
        ide: 'codex',
        file: 'aictx-common-global.md',
        reason: 'modified'
      }
    ]);
  });
});
