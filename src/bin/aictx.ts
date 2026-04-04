#!/usr/bin/env node
import { cac } from 'cac';
import { consola } from 'consola';
import pc from 'picocolors';
import { initCommand } from '../commands/init.js';
import { syncCommand } from '../commands/sync.js';

const cli = cac('aictx');

cli
  .command('init', 'Initialize aictx configuration')
  .action(initCommand);

cli
  .command('sync', 'Fetch, assemble and inject AI context rules')
  .action(syncCommand);

cli
  .command('doctor', 'Diagnose local rules and token health')
  .action(async () => {
    consola.info(pc.cyan('🩺 正在诊断本地规则健康度...'));
    // TODO: 实现 doctor 命令逻辑 (检测 Drift 漂移)
    consola.success(pc.green('诊断完成：未发现规则篡改 (Mock)'));
  });

cli
  .command('info', 'Display aictx core metrics dashboard')
  .action(async () => {
    consola.info(pc.cyan('📊 组织级 AI 规范渗透数据面板...'));
    // TODO: 实现 info 面板逻辑 (读取本地统计数据)
  });

cli.help();
cli.version('0.1.0');

try {
  cli.parse();
} catch (err: any) {
  consola.error(pc.red(`❌ 执行失败: ${err.message}`));
  process.exit(1);
}