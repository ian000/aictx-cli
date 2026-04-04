import { ConfigParser } from '../config/index.js';
import { consola } from 'consola';
import path from 'path';
import fs from 'fs-extra';

export const syncCommand = (cli: any) => {
  cli.command('sync', 'Fetch, assemble and inject AI context rules')
    .action(async () => {
      try {
        const parser = new ConfigParser();
        const config = await parser.read();
        consola.info(`读取配置成功: repository=${config.repository}, ides=[${config.ides.join(', ')}]`);

        const cwd = process.cwd();
        
        // 1. Fetch (Mock)
        // await fetchRules(config.repository, cacheDir);

        // 2. Assemble (Mock)
        // const assembledContent = await assembleRules(cacheDir, config.tags);

        // 3. Inject (Mock)
        consola.start(`正在通过适配器注入至目标 IDE: ${config.ides.join(', ')}...`);
        consola.success('AI context rules synchronized successfully. (Mock)');
      } catch (error: any) {
        consola.error(error.message);
        process.exit(1);
      }
    });
};
