import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import { ConfigParser } from '../config/index.js';
import { scanConflicts } from '../core/resolver/index.js';
import { cliUX } from '../utils/cli-ux.js';
import { t } from '../locales/index.js';

export const resolveCommand = (cli: any) => {
  cli.command('resolve', 'Interactively resolve context conflicts')
    .action(async () => {
      cliUX.intro(t('resolve.start'));
      
      try {
        const parser = new ConfigParser();
        await parser.read(); // 确保已初始化
        
        const cacheDir = path.join(process.cwd(), '.aictx-cache');
        
        const s = cliUX.createSpinner();
        s.start(t('resolve.scan'));
        
        const conflicts = await scanConflicts(cacheDir);
        s.stop(t('resolve.success'));

        if (conflicts.length === 0) {
          console.log('\n======================================================================');
          console.log(pc.green(t('resolve.perfect')));
          console.log('======================================================================\n');
          return;
        }

        consola.warn(pc.yellow(t('resolve.found', conflicts.length)));
        
        for (let i = 0; i < conflicts.length; i++) {
          const conflict = conflicts[i];
          console.log(t('resolve.conflict.entity', pc.red(`#${i + 1}`), pc.bgRed(pc.white(` [${conflict.entity}] `))));
          conflict.files.forEach(f => console.log(`  - ${pc.cyan(f)}`));
          console.log('');
        }

        console.log('----------------------------------------------------------------------');
        console.log(t('resolve.hint'));
        console.log('----------------------------------------------------------------------\n');
        
        cliUX.outro(t('resolve.outro'));
        
      } catch (error: any) {
        consola.error(pc.red(t('common.error', error.message)));
        process.exit(1);
      }
    });
};
