import { consola } from 'consola';
import pc from 'picocolors';
import { t } from '../locales/index.js';

export const infoCommand = (cli: any) => {
  cli.command('info', 'Display aictx core metrics dashboard')
    .action(() => {
      console.log('\n======================================================================');
      console.log(pc.bgCyan(pc.black(` ${t('info.title')} `)) + '\n');
      
      // Mock data for Phase 1
      console.log(`🚀 ${pc.bold(t('info.stat.projects'))}: ${pc.green('12')}`);
      console.log(`🔄 ${pc.bold(t('info.stat.syncs'))}: ${pc.green('1,204')}`);
      console.log(`💰 ${pc.bold(t('info.stat.tokens'))}: ${pc.green('~4.2M')}`);
      console.log(`🛡️ ${pc.bold(t('info.stat.conflicts'))}: ${pc.green('38')}\n`);
      
      console.log(`💡 ${pc.italic(pc.gray(t('info.mock_note')))}`);
      console.log('======================================================================\n');
    });
};
