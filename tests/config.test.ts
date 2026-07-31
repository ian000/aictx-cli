import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { ConfigParser } from '../src/config/index.js';

describe('aictx config parser', () => {
  const testDir = path.join(process.cwd(), '.test-aictx-config');
  const configPath = path.join(testDir, 'aictx.json');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('defaults missing tags to an empty array and de-duplicates ides', async () => {
    await fs.writeJson(configPath, {
      version: '1.0.0',
      ides: ['codex', 'claude', 'codex']
    });

    const config = await new ConfigParser(testDir).read();

    expect(config.tags).toEqual([]);
    expect(config.ides).toEqual(['codex', 'claude']);
  });

  it('rejects invalid tags with an actionable error', async () => {
    await fs.writeJson(configPath, {
      version: '1.0.0',
      ides: ['codex'],
      tags: 'common'
    });

    await expect(new ConfigParser(testDir).read()).rejects.toThrow('tags 必须是字符串数组');
  });

  it('rejects unsupported ides before sync work starts', async () => {
    await fs.writeJson(configPath, {
      version: '1.0.0',
      ides: ['vscode'],
      tags: []
    });

    await expect(new ConfigParser(testDir).read()).rejects.toThrow('不支持的 AI 工具: vscode');
  });

  it('validates context and runtime settings before commands use them', async () => {
    await fs.writeJson(configPath, {
      version: '1.0.0',
      ides: ['codex'],
      tags: [],
      context: { bundlePath: 42 },
      runtime: { defaultBudget: -1 }
    });

    await expect(new ConfigParser(testDir).read()).rejects.toThrow('context.bundlePath 必须是字符串');
  });
});
