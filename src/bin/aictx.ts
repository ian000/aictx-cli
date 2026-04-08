#!/usr/bin/env node
import cac from 'cac';
import { consola } from 'consola';
import pc from 'picocolors';
import { initCommand } from '../commands/init.js';
import { syncCommand } from '../commands/sync.js';
import { resolveCommand } from '../commands/resolve.js';
import { doctorCommand } from '../commands/doctor.js';
import { infoCommand } from '../commands/info.js';
import { indexCommand } from '../commands/index.js';
import { graphCommand } from '../commands/graph.js';
import { initI18n } from '../locales/index.js';

// 强制设置 Node.js 在控制台输出的默认编码为 UTF-8
if (process.stdout.setDefaultEncoding) {
  process.stdout.setDefaultEncoding('utf-8');
}
if (process.stderr.setDefaultEncoding) {
  process.stderr.setDefaultEncoding('utf-8');
}

// --- Windows 终端乱码修复 ---
if (process.platform === 'win32') {
  // 尝试设置 Windows 控制台输出为 UTF-8，以防中文乱码
  // 使用 execSync 会带来一定延迟，这里我们可以依赖现代终端（如 Trae）自身的 UTF-8 支持
  // 如果遇到 readline 或 @clack/prompts 的字符集问题，通常是终端默认代码页不是 65001
  // 这里在入口处简单声明一下。
  process.env.LANG = 'zh_CN.UTF-8';
}

const cli = cac('aictx');

// 注册命令
initCommand(cli as any);
syncCommand(cli as any);
resolveCommand(cli as any);
doctorCommand(cli as any);
infoCommand(cli as any);
indexCommand(cli as any);
graphCommand(cli as any);

cli.help();
cli.version('1.0.0');

(async () => {
  await initI18n();
  try {
    cli.parse();
  } catch (error: any) {
    consola.error(error.message);
    process.exit(1);
  }
})();