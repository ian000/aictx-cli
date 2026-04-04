#!/usr/bin/env node
import cac from 'cac';
import { consola } from 'consola';
import pc from 'picocolors';
import { initCommand } from '../commands/init.js';
import { syncCommand } from '../commands/sync.js';
import { resolveCommand } from '../commands/resolve.js';
import { doctorCommand } from '../commands/doctor.js';
import { infoCommand } from '../commands/info.js';

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
doctorCommand(cli as any);
infoCommand(cli as any);

cli.help();
cli.version('1.0.0');

try {
  cli.parse();
} catch (error: any) {
  consola.error(error.message);
  process.exit(1);
}