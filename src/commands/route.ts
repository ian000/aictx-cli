import type { CAC } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { buildMocRouteIndex, rankMocDocuments, type MocRouteMatch } from '../context/index.js';
import {
  runCodexRouteFallback,
  type CodexCliAvailabilityReason
} from '../runtime/adapters/codex-cli.js';

export function shouldUseCodexRouteFallback(matches: MocRouteMatch[]): boolean {
  if (matches.length === 0) return true;
  if (matches[0].score < 4) return true;
  return matches.length > 1 && matches[1].score === matches[0].score;
}

function printLocalMatches(question: string, matches: MocRouteMatch[]) {
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
}

function codexUnavailableMessage(reason: CodexCliAvailabilityReason): string {
  if (reason === 'not_found') return 'Codex CLI 未安装或不在 PATH 中';
  if (reason === 'not_authenticated') return 'Codex CLI 尚未登录，请先运行 codex login';
  return 'Codex CLI 当前不可用';
}

export const routeCommand = (cli: CAC) => {
  cli.command('route <question>', '基于 MOC 路由表为问题推荐应优先阅读的原子文档')
    .option('-d, --dir <dir>', '指定要扫描的文档根目录', { default: 'aictx-docs' })
    .option('-n, --limit <limit>', '最多返回多少个候选文档', { default: '5' })
    .option('--ai-fallback', '本地路由结果不足时，调用本机 Codex CLI 只读分析')
    .option('--codex-command <command>', '指定 Codex CLI 命令或绝对路径')
    .option('--ai-timeout <seconds>', 'Codex 分析超时时间（秒）', { default: '60' })
    .action(async (question: string, options) => {
      const targetDir = path.resolve(process.cwd(), options.dir);
      const limit = Math.max(1, Number.parseInt(String(options.limit), 10) || 5);
      const timeoutMs = Math.max(1, Number.parseInt(String(options.aiTimeout), 10) || 60) * 1_000;

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
      if (options.aiFallback && shouldUseCodexRouteFallback(matches)) {
        const result = await runCodexRouteFallback({
          question,
          projectDir: process.cwd(),
          docsRoot: targetDir,
          documents,
          limit,
          command: options.codexCommand ? String(options.codexCommand) : undefined,
          timeoutMs
        });

        if (result.status === 'success' && result.matches.length > 0) {
          console.log('\n======================================================================');
          console.log(`${pc.green('Codex Route Suggestions')} ${pc.gray(`for: ${question}`)}\n`);
          result.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${pc.cyan(match.path)} ${pc.gray(`confidence=${match.confidence.toFixed(2)}`)}`);
            console.log(`   reason: ${match.reason}`);
          });
          console.log('======================================================================\n');
          return;
        }

        if (result.status === 'success') {
          consola.warn('Codex 未返回有效的 MOC 候选，已降级为本地 MOC 路由。');
        } else if (result.status === 'unavailable') {
          consola.warn(`${codexUnavailableMessage(result.availability.reason)}，已降级为本地 MOC 路由。`);
        } else if (result.status === 'timed_out') {
          consola.warn(`Codex 分析超过 ${Math.round(timeoutMs / 1_000)} 秒，已降级为本地 MOC 路由。`);
        } else if (result.status === 'failed') {
          consola.warn('Codex 分析失败，已降级为本地 MOC 路由。');
        }
      }

      if (matches.length > 0) printLocalMatches(question, matches);
      else consola.warn('未找到明确匹配的 MOC 路由。请先阅读最接近领域的 00-Index.md，再决定是否需要更广泛检索。');
    });
};
