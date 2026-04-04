import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import { ConfigParser } from '../config/index.js';
import { diagnoseDrift } from '../core/doctor/index.js';

export const doctorCommand = (cli: any) => {
  cli.command('doctor', '诊断本地规则与 Token 健康度')
    .action(async () => {
      consola.start('正在诊断本地规则健康度与漂移情况...');
      try {
        const parser = new ConfigParser();
        const config = await parser.read();
        
        const cwd = process.cwd();
        const cacheDir = path.join(cwd, '.aictx-cache');
        
        const issues = await diagnoseDrift(cwd, cacheDir, config.ides);
        
        if (issues.length === 0) {
          consola.success(pc.green('诊断完成：未发现任何规则漂移或篡改。'));
          return;
        }

        consola.warn(pc.yellow(`发现 ${issues.length} 处本地规则漂移:\n`));
        issues.forEach((issue, index) => {
          const status = issue.reason === 'missing' ? pc.bgRed(' 缺失 ') : pc.bgYellow(' 被篡改 ');
          console.log(`  ${index + 1}. [${pc.cyan(issue.ide)}] ${status} ${issue.file}`);
        });

        console.log('\n提示: 本地修改规则文件会被下一次 sync 覆盖。请在远端 Meta-Repo 中修改并重新下发。');
        console.log(`运行 ${pc.green('aictx sync')} 修复上述问题。`);
        
      } catch (error: any) {
        consola.error(pc.red(`诊断失败: ${error.message}`));
      }
    });
};
