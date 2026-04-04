import { consola } from 'consola';
import pc from 'picocolors';

export const infoCommand = (cli: any) => {
  cli.command('info', '展示 aictx 核心指标大盘')
    .action(async () => {
      console.log('\n======================================================================');
      console.log(`🧠 ${pc.bgCyan(pc.black(' aictx-cli Dashboard '))}  (Version: 1.0.0)\n`);
      
      console.log(`📊 ${pc.bold('团队渗透情况')}`);
      console.log(`   - 接入项目数:   ${pc.green('1')} (当前项目)`);
      console.log(`   - 核心规则版本: ${pc.cyan('v1.0.0 (Local)')}`);
      console.log(`   - 支持 IDE 数:  ${pc.cyan('4')} (Trae, Cursor, Claude, Windsurf)\n`);

      console.log(`🛡️ ${pc.bold('价值感知 (Value Perception)')}`);
      console.log(`   - 规则健康度:   ${pc.green('100%')} (Zero Drift)`);
      console.log(`   - 累计节约 Token: ${pc.yellow('~12,450')} (预估值)`);
      console.log(`   - 消除冲突次数: ${pc.green('2')} 次\n`);

      console.log(`💡 ${pc.italic(pc.gray('注: 累计数据目前为本地 Mock 展示，后续将接入云端控制台统计。'))}`);
      console.log('======================================================================\n');
    });
};
