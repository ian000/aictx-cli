import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { OnboardEngine } from '../src/core/onboard/index.js';

describe('Brownfield onboarding', () => {
  const testDir = path.join(process.cwd(), '.test-onboard-project');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
    vi.restoreAllMocks();
  });

  it('continues past malformed package.json and initializes only Claude Code', async () => {
    await fs.writeFile(path.join(testDir, 'package.json'), '{ invalid json');
    await fs.writeFile(path.join(testDir, 'main.ts'), 'export const main = true;\n');
    await fs.writeJson(path.join(testDir, 'aictx.json'), {
      version: '1.0',
      ides: ['codex'],
      tags: ['common']
    });

    const analyze = vi.fn(async (_source: string, output: string) => {
      await fs.ensureDir(output);
      await fs.writeJson(path.join(output, 'graph.json'), {
        nodes: [{ id: 'main', label: 'main', type: 'function', degree: 4 }],
        links: []
      });
      await fs.writeFile(path.join(output, 'system-graph.md'), '# Graph report\n');
    });
    const runCommand = vi.fn(async () => {});

    await new OnboardEngine({
      cwd: testDir,
      yes: true,
      ides: ['claude'],
      analyze: analyze as any,
      runCommand: runCommand as any
    }).run();

    expect(analyze).toHaveBeenCalledOnce();
    expect(runCommand).toHaveBeenCalledWith(['sync'], testDir);
    expect((await fs.readJson(path.join(testDir, 'aictx.json'))).ides).toEqual(['claude']);
    expect(await fs.pathExists(path.join(testDir, 'CLAUDE.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, '.claude/skills/aictx-graphify/SKILL.md'))).toBe(true);
    expect(await fs.pathExists(path.join(testDir, 'AGENTS.md'))).toBe(false);
    expect(await fs.pathExists(path.join(testDir, '.agents'))).toBe(false);
  });

  it('fails early with an actionable message for unsupported source languages', async () => {
    await fs.writeFile(path.join(testDir, 'Main.java'), 'class Main {}\n');
    const analyze = vi.fn();

    await expect(new OnboardEngine({
      cwd: testDir,
      yes: true,
      ides: ['codex'],
      analyze: analyze as any
    }).run()).rejects.toThrow('当前自动接管支持 JavaScript、TypeScript、Python 和 Go');
    expect(analyze).not.toHaveBeenCalled();
  });

  it('propagates Graphify failures instead of reporting success', async () => {
    await fs.writeFile(path.join(testDir, 'main.go'), 'package main\n');
    const analyze = vi.fn(async () => {
      throw new Error('scanner crashed');
    });

    await expect(new OnboardEngine({
      cwd: testDir,
      yes: true,
      ides: ['codex'],
      analyze: analyze as any
    }).run()).rejects.toThrow('Graphify AST 图谱生成失败: scanner crashed');
  });
});
