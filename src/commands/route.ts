import type { CAC } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { buildMocRouteIndex, rankMocDocuments } from '../context/index.js';

export const routeCommand = (cli: CAC) => {
  cli.command('route <question>', '基于 MOC 路由表为问题推荐应优先阅读的原子文档')
    .option('-d, --dir <dir>', '指定要扫描的文档根目录', { default: 'aictx-docs' })
    .option('-n, --limit <limit>', '最多返回多少个候选文档', { default: '5' })
    .action(async (question: string, options) => {
      const targetDir = path.resolve(process.cwd(), options.dir);
      const limit = Math.max(1, Number.parseInt(String(options.limit), 10) || 5);

      if (!(await fs.pathExists(targetDir))) {
        consola.error(`MOC 文档目录不存在: ${targetDir}`);
        process.exitCode = 1;
        return;
      }

      const documents = await buildMocRouteIndex(targetDir);
      if (documents.length === 0) {
        consola.warn(`未找到可路由文档。请确认 ${options.dir} 下存在包含 aictx-index-start 锚点的 00-Index.md，并先运行 aictx index。`);
        return;
      }

      const matches = rankMocDocuments(question, documents).slice(0, limit);
      if (matches.length === 0) {
        consola.warn('未找到明确匹配的 MOC 路由。请先阅读最接近领域的 00-Index.md，再决定是否需要更广泛检索。');
        return;
      }

      console.log('\n======================================================================');
      console.log(`${pc.green('MOC Route Suggestions')} ${pc.gray(`for: ${question}`)}\n`);

      matches.forEach((match, index) => {
        const doc = match.document;
        console.log(`${index + 1}. ${pc.cyan(doc.relativePath)} ${pc.gray(`score=${match.score}`)}`);
        console.log(`   desc: ${doc.description}`);
        console.log(`   tags: ${(doc.tags.length > 0 ? doc.tags.join(', ') : '-')}`);
        console.log(`   entities: ${(doc.entities.length > 0 ? doc.entities.join(', ') : '-')}`);
        console.log(`   aliases: ${(doc.aliases.length > 0 ? doc.aliases.join(', ') : '-')}`);
        console.log(`   matched: ${(match.matchedTerms.length > 0 ? match.matchedTerms.join(', ') : '-')}`);
      });

      console.log('\nRead these documents in order before falling back to global search.');
      console.log('======================================================================\n');
    });
};
