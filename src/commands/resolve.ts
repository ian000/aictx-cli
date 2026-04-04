import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import { ConfigParser } from '../config/index.js';
import { scanConflicts } from '../core/resolver/index.js';
import { cliUX } from '../utils/cli-ux.js';

export const resolveCommand = (cli: any) => {
  cli.command('resolve', '交互式解决业务上下文冲突')
    .action(async () => {
      cliUX.intro('开始扫描业务红线与上下文重叠区 (Context Resolver)');
      
      try {
        const parser = new ConfigParser();
        await parser.read(); // 确保已初始化
        
        const cacheDir = path.join(process.cwd(), '.aictx-cache');
        
        const s = cliUX.createSpinner();
        s.start('正在深度扫描实体 (Entities) 交集...');
        
        const conflicts = await scanConflicts(cacheDir);
        s.stop('扫描完成。');

        if (conflicts.length === 0) {
          console.log('\n======================================================================');
          console.log(`${pc.green('🎉 恭喜！当前团队的规则库非常健康，没有发现任何业务边界冲突。')}`);
          console.log(`💡 SSOT (单点真实源) 状态: ${pc.cyan('Perfect')}`);
          console.log('======================================================================\n');
          cliUX.outro('Stop fighting the AI. Start engineering its context.');
          return;
        }

        consola.warn(pc.yellow(`发现 ${conflicts.length} 处潜在的规则冲突:\n`));
        
        for (let i = 0; i < conflicts.length; i++) {
          const conflict = conflicts[i];
          console.log(`${pc.red(`冲突 #${i + 1}`)}: 实体 ${pc.bgRed(pc.white(` [${conflict.entity}] `))} 被以下多个文件同时描述：`);
          conflict.files.forEach(f => console.log(`  - ${pc.cyan(f)}`));
          console.log('');
        }

        console.log('----------------------------------------------------------------------');
        console.log(`提示: 目前为预览模式。请团队架构师介入，将上述重叠的 Entity 合并到同一个 Markdown 文件中，以保证大模型拥有唯一的业务基准 (SSOT)。`);
        console.log('----------------------------------------------------------------------\n');
        
        cliUX.outro('Please resolve the conflicts manually in your Meta-Repo.');
        
      } catch (error: any) {
        consola.error(pc.red(`❌ 扫描失败: ${error.message}`));
        process.exit(1);
      }
    });
};
