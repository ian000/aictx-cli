import { ConfigParser } from '../config/index.js';
import { fetchRules } from '../core/fetcher/index.js';
import { assembleRules } from '../core/assembler/index.js';
import { TraeAdapter, CursorAdapter, WindsurfAdapter, ClaudeAdapter } from '../core/injector/index.js';
import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import { t } from '../locales/index.js';

const adapters: Record<string, any> = {
  trae: new TraeAdapter(),
  cursor: new CursorAdapter(),
  windsurf: new WindsurfAdapter(),
  claude: new ClaudeAdapter()
};

export const syncCommand = (cli: any) => {
  cli.command('sync', 'Sync and assemble AI context rules')
    .action(async () => {
      try {
        const parser = new ConfigParser();
        const config = await parser.read();
        
        const cwd = process.cwd();
        // 确保 cacheDir 存在于项目根目录下
        const cacheDir = path.join(cwd, '.aictx-cache');
        
        consola.start(t('sync.start'));
        
        // 1. Fetch
        if (config.repository === './' || config.repository === '.' || !config.repository.startsWith('http') && !config.repository.startsWith('git@')) {
           consola.info(t('sync.fetch.local'));
        } else {
           consola.info(t('sync.fetch.remote'));
        }
        await fetchRules(config.repository, cacheDir);

        // 2. Assemble
        consola.start(t('sync.assemble'));
        const result = await assembleRules(cacheDir, config.tags);
        
        if (result.rules.length === 0) {
          consola.warn('No rules matched. Check tags or empty repo.');
          return;
        }

        if (result.stats.matchedTokens > 12000) {
          consola.warn(
            pc.yellow(t('sync.warning.bloat'))
          );
        }

        // 3. Inject
        consola.start(t('sync.inject'));
        for (const ide of config.ides) {
          const adapter = adapters[ide];
          if (adapter) {
            await adapter.inject(cwd, result);
          }
        }

        // 4. Value Dashboard (Value Perception)
        console.log('\n======================================================================');
        console.log(`${pc.green(`✨ ${t('sync.dashboard.title')}`)}\n`);
        console.log(`🛡️ ${t('sync.dashboard.ignored')}: ${pc.yellow(result.stats.ignoredRules.toString())}`);
        console.log(`💰 ${t('sync.dashboard.tokens')} (Saved): ${pc.yellow('~' + result.stats.ignoredTokens.toString())}`);
        console.log(`✅ ${t('sync.dashboard.tokens')} (Injected): ${pc.cyan('~' + result.stats.matchedTokens.toString())}`);
        console.log('======================================================================\n');

      } catch (error: any) {
        consola.error(pc.red(t('common.error', error.message)));
        process.exit(1);
      }
    });
};
