import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fetchRules } from '../src/core/fetcher/index.js';

describe('rule fetcher', () => {
  const testDir = path.join(process.cwd(), '.test-aictx-fetcher');
  const cacheDir = path.join(testDir, 'project', '.aictx-cache');

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('preserves the existing cache when remote clone fails', async () => {
    await fs.ensureDir(cacheDir);
    await fs.writeFile(path.join(cacheDir, 'keep.md'), '# Keep\n');

    await expect(fetchRules('file:///private/tmp/aictx-cli-no-such-repo.git', cacheDir)).rejects.toThrow('Git Clone 失败');

    expect(await fs.pathExists(path.join(cacheDir, 'keep.md'))).toBe(true);
  });

  it('replaces local rule snapshots only after a successful copy', async () => {
    const sourceDir = path.join(testDir, 'rules');
    await fs.ensureDir(sourceDir);
    await fs.writeFile(path.join(sourceDir, 'new.md'), '# New\n');
    await fs.ensureDir(cacheDir);
    await fs.writeFile(path.join(cacheDir, 'old.md'), '# Old\n');

    await fetchRules(sourceDir, cacheDir);

    expect(await fs.pathExists(path.join(cacheDir, 'new.md'))).toBe(true);
    expect(await fs.pathExists(path.join(cacheDir, 'old.md'))).toBe(false);
  });

  it('ships the graph freshness rule in builtin rules', async () => {
    await fetchRules('builtin', cacheDir);

    const rulePath = path.join(cacheDir, 'common-graph-freshness.md');
    const content = await fs.readFile(rulePath, 'utf-8');

    expect(content).toContain('图谱滞后必须先重建');
    expect(content).toContain('aictx graph analyze --dir . --out ./graphify-out');
  });

  it('ships the MOC routing rule in builtin rules', async () => {
    await fetchRules('builtin', cacheDir);

    const rulePath = path.join(cacheDir, 'common-moc-routing.md');
    const content = await fs.readFile(rulePath, 'utf-8');

    expect(content).toContain('aictx route "<用户问题>"');
    expect(content).toContain('aictx index');
  });

  it('ships concise communication and conditional sub-agent rules', async () => {
    await fetchRules('builtin', cacheDir);

    const communication = await fs.readFile(path.join(cacheDir, 'common-user-communication.md'), 'utf-8');
    const orchestration = await fs.readFile(path.join(cacheDir, 'common-agent-orchestration.md'), 'utf-8');
    const global = await fs.readFile(path.join(cacheDir, 'common-global.md'), 'utf-8');

    expect(communication).toContain('第一段直接给出结果');
    expect(communication).toContain('简单任务使用 1-3 句话');
    expect(communication).toContain('只有实际验证通过后才能声称完成或通过');
    expect(orchestration).toContain('分工收益高于协调成本');
    expect(orchestration).toContain('任务简单、范围很小');
    expect(orchestration).toContain('主智能体负责整合结果');
    expect(global).toContain('使用用户当前使用的语言');
  });
});
