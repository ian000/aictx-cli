import { defineCommand } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import matter from 'gray-matter';
import { cliUX } from '../utils/cli-ux.js';
import { t } from '../locales/index.js';

export const indexCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('index', '编译并更新 MOC (Map of Content) 路由表')
    .option('-d, --dir <dir>', '指定要扫描的文档根目录', { default: 'documents' })
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

      // 递归寻找所有的 00-Index.md
      const findIndexFiles = async (dir: string): Promise<string[]> => {
        let results: string[] = [];
        const list = await fs.readdir(dir);
        for (const file of list) {
          const fullPath = path.join(dir, file);
          const stat = await fs.stat(fullPath);
          if (stat.isDirectory()) {
            results = results.concat(await findIndexFiles(fullPath));
          } else if (file === '00-Index.md' || file.toLowerCase() === 'readme.md') {
            // Check if it has the anchors
            const content = await fs.readFile(fullPath, 'utf-8');
            if (content.includes('<!-- aictx-index-start -->')) {
              results.push(fullPath);
            }
          }
        }
        return results;
      };

      const indexFiles = await findIndexFiles(targetDir);

      if (indexFiles.length === 0) {
        s.stop('Done');
        consola.info(t('index.no_template', options.dir));
        return;
      }

      // 递归获取目录下所有的 md 文件
      const getMarkdownFiles = async (dir: string): Promise<string[]> => {
        let results: string[] = [];
        const list = await fs.readdir(dir);
        for (const file of list) {
          const fullPath = path.join(dir, file);
          const stat = await fs.stat(fullPath);
          if (stat.isDirectory()) {
            results = results.concat(await getMarkdownFiles(fullPath));
          } else if (file.endsWith('.md')) {
            results.push(fullPath);
          }
        }
        return results;
      };

      let updatedCount = 0;

      for (const indexPath of indexFiles) {
        const indexDir = path.dirname(indexPath);
        const mdFiles = await getMarkdownFiles(indexDir);
        
        const tableRows: string[] = [];
        tableRows.push(`| ${t('index.col.link')} | ${t('index.col.entities')} | ${t('index.col.aliases')} | ${t('index.col.desc')} |`);
        tableRows.push('| --- | --- | --- | --- |');

        let indexedFilesCount = 0;

        for (const mdFile of mdFiles) {
          // 跳过索引文件自身
          if (mdFile === indexPath) continue;

          // 若子目录中还有别的 00-Index.md，是否要跳过？
          // 为了简单，我们暂且把该目录及所有子目录的 md 文件都收集在这个路由表中。
          // 或者如果子目录有自己的 Index，我们就跳过。这里先全扫。
          
          const content = await fs.readFile(mdFile, 'utf-8');
          const parsed = matter(content);
          
          const data = parsed.data || {};
          const entities = Array.isArray(data.entities) ? data.entities.join(', ') : (data.entities || '-');
          const aliases = Array.isArray(data.aliases) ? data.aliases.join(', ') : (data.aliases || '-');
          let desc = data.description || '';

          // 如果没有描述，尝试从正文提取第一个 H1 或 H2
          if (!desc) {
            const match = parsed.content.match(/^#+\s+(.*)$/m);
            if (match) {
              desc = match[1].trim();
            } else {
              desc = '-';
            }
          }

          // 提取无后缀文件名用于双向链接
          const fileName = path.basename(mdFile, '.md');
          // 相对路径用于兼容不同 Markdown 编辑器
          // const relPath = path.relative(indexDir, mdFile).replace(/\\/g, '/');

          // Obsidian 双链格式 [[文件名]]
          tableRows.push(`| [[${fileName}]] | \`${entities}\` | \`${aliases}\` | ${desc} |`);
          indexedFilesCount++;
        }

        if (indexedFilesCount > 0) {
          const indexContent = await fs.readFile(indexPath, 'utf-8');
          const newTable = tableRows.join('\n');
          
          const startMarker = '<!-- aictx-index-start -->';
          const endMarker = '<!-- aictx-index-end -->';
          
          const regex = new RegExp(`(${startMarker})[\\s\\S]*?(${endMarker})`, 'g');
          
          if (regex.test(indexContent)) {
            const updatedContent = indexContent.replace(regex, `$1\n\n${newTable}\n\n$2`);
            await fs.writeFile(indexPath, updatedContent, 'utf-8');
            updatedCount++;
          }
        }
      }

      s.stop('MOC Index generated');
      
      console.log('\n======================================================================');
      console.log(t('index.success_count', pc.green(updatedCount)));
      console.log(t('index.success_desc'));
      console.log('======================================================================\n');
      
      cliUX.outro(t('index.outro'));
    });
};
