import type { CAC } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'node:path';
import { ConfigParser, type AictxConfig } from '../config/index.js';
import { buildContextBundle, fetchRules } from '../development/index.js';
import { loadContextBundle, prepareRuntimeContext, verifyContextBundleFreshness } from '../runtime/index.js';
import { renderCodexContextPacket } from '../runtime/adapters/codex.js';

interface ContextPaths {
  cacheDir: string;
  docsDir: string;
  graphPath: string;
  bundlePath: string;
  runsDir: string;
}

function resolveContextPaths(cwd: string, config: AictxConfig, options: Record<string, unknown> = {}): ContextPaths {
  const optionString = (name: string): string | undefined => typeof options[name] === 'string' ? String(options[name]) : undefined;
  return {
    cacheDir: path.resolve(cwd, optionString('cacheDir') ?? config.context?.cacheDir ?? '.aictx-cache'),
    docsDir: path.resolve(cwd, optionString('docsDir') ?? config.context?.docsDir ?? 'aictx-docs'),
    graphPath: path.resolve(cwd, optionString('graphPath') ?? config.context?.graphPath ?? 'graphify-out/graph.json'),
    bundlePath: path.resolve(cwd, optionString('bundle') ?? optionString('out') ?? config.context?.bundlePath ?? '.aictx/context-bundle.json'),
    runsDir: path.resolve(cwd, optionString('runsDir') ?? config.runtime?.runsDir ?? '.aictx/runs')
  };
}

export const contextCommand = (cli: CAC) => {
  cli.command('context <action> [...args]', '构建、检查或准备 Agent Runtime 上下文')
    .option('--cache-dir <dir>', '规则缓存目录')
    .option('--docs-dir <dir>', 'MOC 文档目录')
    .option('--graph-path <path>', '图谱文件路径')
    .option('-o, --out <path>', 'Context Bundle 输出路径')
    .option('--bundle <path>', 'Context Bundle 路径')
    .option('--runs-dir <dir>', 'Run Manifest 目录')
    .option('-b, --budget <tokens>', 'Context Token 预算')
    .option('-n, --limit <count>', '最多选择多少份文档')
    .option('--json', '输出机器可读 JSON')
    .option('--codex', '输出适合 Codex 阅读的 Markdown')
    .option('--allow-stale', '允许输出已过期上下文')
    .option('--no-manifest', '不写入 Run Manifest')
    .action(async (action: string, args: string[], options) => {
      const cwd = process.cwd();
      try {
        const config = await new ConfigParser(cwd).read();
        const paths = resolveContextPaths(cwd, config, options);

        if (action === 'build') {
          await fetchRules(config.repository, paths.cacheDir, { silent: Boolean(options.json) });
          const bundle = await buildContextBundle({
            projectDir: cwd,
            cacheDir: paths.cacheDir,
            docsDir: paths.docsDir,
            graphPath: paths.graphPath,
            outputPath: paths.bundlePath,
            tags: config.tags
          });
          const result = {
            bundlePath: path.relative(cwd, paths.bundlePath),
            version: bundle.version,
            rules: bundle.rules.length,
            documents: bundle.documents.length,
            graph: bundle.graph ? { nodes: bundle.graph.nodes, edges: bundle.graph.edges } : null
          };
          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            consola.success(`Context Bundle 已生成: ${result.bundlePath}`);
            console.log(`version: ${result.version}`);
            console.log(`rules: ${result.rules}, documents: ${result.documents}`);
          }
          return;
        }

        if (action === 'verify') {
          const bundle = await loadContextBundle(paths.bundlePath);
          const freshness = await verifyContextBundleFreshness(cwd, bundle);
          const result = {
            bundlePath: path.relative(cwd, paths.bundlePath),
            bundleVersion: bundle.version,
            ...freshness
          };
          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
          } else if (freshness.status === 'fresh') {
            consola.success(`Context Bundle 与源文件一致: ${result.bundlePath}`);
          } else {
            consola.error(`Context Bundle 已过期: ${freshness.issues.length} 个源文件发生变化。`);
            for (const issue of freshness.issues) console.log(`- ${issue.reason}: ${issue.path}`);
          }
          if (freshness.status === 'stale') process.exitCode = 2;
          return;
        }

        if (action !== 'prepare') {
          throw new Error(`不支持的 context 操作: ${action}。可用操作: build, verify, prepare。`);
        }
        const task = args.join(' ').trim();
        if (!task) throw new Error('context prepare 需要任务描述。');
        const budget = Math.max(1, Number.parseInt(String(options.budget ?? config.runtime?.defaultBudget ?? 8000), 10) || 8000);
        const documentLimit = Math.max(0, Number.parseInt(String(options.limit ?? config.runtime?.documentLimit ?? 3), 10) || 0);
        const result = await prepareRuntimeContext({
          projectDir: cwd,
          bundlePath: paths.bundlePath,
          runsDir: paths.runsDir,
          task,
          budget,
          documentLimit,
          writeManifest: options.manifest !== false
        });

        if (options.json) {
          console.log(JSON.stringify({
            packet: result.packet,
            manifest: result.manifest,
            manifestPath: result.manifestPath ? path.relative(cwd, result.manifestPath) : null
          }, null, 2));
        } else if (options.codex) {
          console.log(renderCodexContextPacket(result.packet));
          if (result.manifestPath) console.log(`\nRun Manifest: ${path.relative(cwd, result.manifestPath)}`);
        } else {
          console.log(`Context Packet: ${result.packet.packetId}`);
          console.log(`status: ${result.packet.status}`);
          console.log(`budget: ${result.packet.usedTokens}/${result.packet.budget}`);
          console.log(`rules: ${result.packet.rules.length}, documents: ${result.packet.documents.length}`);
          if (result.manifestPath) console.log(`manifest: ${path.relative(cwd, result.manifestPath)}`);
        }

        if (result.packet.status === 'context_stale' && !options.allowStale) {
          if (!options.json) {
            consola.error('Context Bundle 已过期，请运行 aictx context build 后重试。');
          }
          process.exitCode = 2;
        }
      } catch (error: any) {
        consola.error(`Context 操作失败: ${error.message}`);
        process.exitCode = 1;
      }
    });
};
