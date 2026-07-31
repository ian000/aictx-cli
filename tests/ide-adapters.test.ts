import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  ClaudeAdapter,
  CodexAdapter,
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
    rules: [{ filename: 'common-global.md', sourcePath: 'common-global.md', content: '# Common\n', tags: ['common'], tokens: 3 }],
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

  it('delivers the communication rule to every supported AI tool', async () => {
    const communicationResult: AssembleResult = {
      rules: [{
        filename: 'common-user-communication.md',
        sourcePath: 'common-user-communication.md',
        content: '# 用户沟通与交付标准\n\n第一段直接给出结果。\n',
        tags: ['common', 'global'],
        tokens: 12
      }],
      stats: { totalScanned: 1, matchedRules: 1, ignoredRules: 0, matchedTokens: 12, ignoredTokens: 0 }
    };

    await new CodexAdapter().inject(testDir, communicationResult);
    await new ClaudeAdapter().inject(testDir, communicationResult);
    await new CursorAdapter().inject(testDir, communicationResult);
    await new WindsurfAdapter().inject(testDir, communicationResult);
    await new TraeAdapter().inject(testDir, communicationResult);

    const targets = [
      path.join(testDir, '.agents/workflows/aictx-common-user-communication.md'),
      path.join(testDir, '.claude/rules/aictx-common-user-communication.md'),
      path.join(testDir, '.cursor/rules/aictx-common-user-communication.mdc'),
      path.join(testDir, '.windsurf/rules/aictx-common-user-communication.md'),
      path.join(testDir, '.trae/rules/aictx-common-user-communication.md')
    ];

    for (const target of targets) {
      expect(await fs.readFile(target, 'utf-8')).toContain('第一段直接给出结果');
    }
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

  it('removes stale aictx generated rules without touching user rules', async () => {
    await fs.ensureDir(path.join(testDir, '.claude', 'rules'));
    await fs.writeFile(path.join(testDir, '.claude', 'rules', 'aictx-old.md'), '# Old\n');
    await fs.writeFile(path.join(testDir, '.claude', 'rules', 'custom.md'), '# Custom\n');

    await new ClaudeAdapter().inject(testDir, result);

    expect(await fs.pathExists(path.join(testDir, '.claude', 'rules', 'aictx-old.md'))).toBe(false);
    expect(await fs.pathExists(path.join(testDir, '.claude', 'rules', 'custom.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.claude', 'rules', 'aictx-common-global.md'))).toBe(true);
  });

  it('doctor reports stale generated rules', async () => {
    await new ClaudeAdapter().inject(testDir, result);
    await fs.writeFile(path.join(testDir, '.claude', 'rules', 'aictx-old.md'), '# Old\n');

    const issues = await diagnoseDrift(testDir, result, ['claude']);

    expect(issues).toEqual([
      { ide: 'claude', file: path.join('.claude', 'rules', 'aictx-old.md'), reason: 'stale' }
    ]);
  });

  it('cleans stale generated rules when no rules match', async () => {
    await fs.ensureDir(path.join(testDir, '.claude', 'rules'));
    await fs.writeFile(path.join(testDir, '.claude', 'rules', 'aictx-old.md'), '# Old\n');

    await new ClaudeAdapter().inject(testDir, {
      rules: [],
      stats: { totalScanned: 1, matchedRules: 0, ignoredRules: 1, matchedTokens: 0, ignoredTokens: 3 }
    });

    expect(await fs.pathExists(path.join(testDir, '.claude', 'rules', 'aictx-old.md'))).toBe(false);
  });
});
