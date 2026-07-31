import type { CAC } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { cliUX } from '../utils/cli-ux.js';
import { t } from '../locales/index.js';
import { findMocIndexFiles, updateMocIndexFile } from '../context/index.js';

export const indexCommand = (cli: CAC) => {
  cli.command('index', '编译并更新 MOC (Map of Content) 路由表')
    .option('-d, --dir <dir>', '指定要扫描的文档根目录', { default: 'aictx-docs' })
    .action(async (options) => {
      cliUX.intro(t('index.intro'));

      const s = cliUX.createSpinner();
      s.start(t('index.start'));

      const targetDir = path.resolve(process.cwd(), options.dir);
      
      if (!fs.existsSync(targetDir)) {
        s.stop('Failed');
        consola.error(t('index.error_dir', targetDir));
        return;
      }

      const indexFiles = await findMocIndexFiles(targetDir);

      if (indexFiles.length === 0) {
        s.stop('Done');
        consola.info(t('index.no_template', options.dir));
        return;
      }

      let updatedCount = 0;
      let indexedDocumentsCount = 0;

      for (const indexPath of indexFiles) {
        const indexedCount = await updateMocIndexFile(indexPath, targetDir, {
          link: t('index.col.link'),
          path: t('index.col.path'),
          tags: t('index.col.tags'),
          entities: t('index.col.entities'),
          aliases: t('index.col.aliases'),
          updated: t('index.col.updated'),
          description: t('index.col.desc')
        });
        indexedDocumentsCount += indexedCount;
        updatedCount++;
      }

      s.stop('MOC Index generated');
      
      console.log('\n======================================================================');
      console.log(t('index.success_count', pc.green(updatedCount)));
      console.log(`📌 Indexed ${pc.cyan(indexedDocumentsCount.toString())} routed documents.`);
      console.log(t('index.success_desc'));
      console.log('======================================================================\n');
      
      cliUX.outro(t('index.outro'));
    });
};
