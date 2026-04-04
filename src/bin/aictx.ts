#!/usr/bin/env node
import cac from 'cac';
import { consola } from 'consola';
import pc from 'picocolors';
import { initCommand } from '../commands/init.js';
import { syncCommand } from '../commands/sync.js';
import { resolveCommand } from '../commands/resolve.js';

// 强制设置 Node.js 在控制台输出的默认编码为 UTF-8
if (process.stdout.setDefaultEncoding) {
  process.stdout.setDefaultEncoding('utf-8');
}
if (process.stderr.setDefaultEncoding) {
  process.stderr.setDefaultEncoding('utf-8');
}

const cli = cac('aictx');

// 注册命令
initCommand(cli as any);
syncCommand(cli as any);
resolveCommand(cli as any);

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