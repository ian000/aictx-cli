import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import { ConfigParser } from '../config/index.js';
import { diagnoseDrift } from '../core/doctor/index.js';
import { t } from '../locales/index.js';

export const doctorCommand = (cli: any) => {
  cli.command('doctor', 'Diagnose local rules and token health')
    .action(async () => {
      try {
        const parser = new ConfigParser();
        const config = await parser.read();
        
        const cwd = process.cwd();
        const cacheDir = path.join(cwd, '.aictx-cache');
        
        consola.start(t('doctor.diagnose'));
        
        const issues = await diagnoseDrift(cwd, cacheDir, config.ides);
        
        if (issues.length === 0) {
          consola.success(t('doctor.healthy'));
          return;
        }

        consola.warn(pc.yellow(t('doctor.drift_found')));
        
        issues.forEach((issue) => {
          const typeStr = issue.reason === 'missing' ? pc.red(t('doctor.issue.missing')) : pc.yellow(t('doctor.issue.modified'));
          console.log(`  - [${pc.cyan(issue.ide)}] ${pc.gray(issue.file)}: ${typeStr}`);
        });

        console.log('\n' + t('doctor.hint'));
        console.log(t('doctor.fix').replace('`aictx sync`', pc.green('aictx sync')));
        
      } catch (error: any) {
        consola.error(pc.red(t('common.error', error.message)));
      }
    });
};
