import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  ClaudeAdapter,
  CursorAdapter,
  TraeAdapter,
  WindsurfAdapter
} from '../src/core/injector/index.js';
import { diagnoseDrift } from '../src/core/doctor/index.js';
import type { AssembleResult } from '../src/core/assembler/index.js';
import { parseIdeOption } from '../src/core/ide/index.js';

describe('AI tool rule adapters', () => {
  const testDir = path.join(process.cwd(), '.test-ide-adapters');
  const result: AssembleResult = {
    rules: [{ filename: 'common-global.md', content: '# Common\n', tags: ['common'], tokens: 3 }],
    stats: { totalScanned: 1, matchedRules: 1, ignoredRules: 0, matchedTokens: 3, ignoredTokens: 0 }
  };

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('validates and de-duplicates comma-separated tool options', () => {
    expect(parseIdeOption('codex,claude,codex')).toEqual(['codex', 'claude']);
    expect(() => parseIdeOption('vscode')).toThrow('不支持的 AI 工具: vscode');
  });

  it('writes each rule to the current tool-specific directory', async () => {
    await new ClaudeAdapter().inject(testDir, result);
    await new CursorAdapter().inject(testDir, result);
    await new WindsurfAdapter().inject(testDir, result);
    await new TraeAdapter().inject(testDir, result);

    expect(await fs.pathExists(path.join(testDir, '.claude/rules/aictx-common-global.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.cursor/rules/aictx-common-global.mdc'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.windsurf/rules/aictx-common-global.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.trae/rules/aictx-common-global.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.windsurfrules'))).toBe(false);

    const cursorRule = await fs.readFile(path.join(testDir, '.cursor/rules/aictx-common-global.mdc'), 'utf-8');
    expect(cursorRule).toContain('globs: ["**/*"]');
    expect(cursorRule).toContain('alwaysApply: true');
  });

  it('doctor reports missing and modified files for every configured tool', async () => {
    await new ClaudeAdapter().inject(testDir, result);
    await fs.writeFile(path.join(testDir, '.claude/rules/aictx-common-global.md'), 'tampered\n');

    const issues = await diagnoseDrift(testDir, result, ['claude', 'cursor', 'windsurf']);
    expect(issues).toEqual([
      { ide: 'claude', file: path.join('.claude', 'rules', 'aictx-common-global.md'), reason: 'modified' },
      { ide: 'cursor', file: path.join('.cursor', 'rules', 'aictx-common-global.mdc'), reason: 'missing' },
      { ide: 'windsurf', file: path.join('.windsurf', 'rules', 'aictx-common-global.md'), reason: 'missing' }
    ]);
  });
});
