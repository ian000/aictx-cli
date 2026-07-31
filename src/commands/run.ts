import type { CAC } from 'cac';
import path from 'node:path';
import { consola } from 'consola';
import { ConfigParser } from '../config/index.js';
import { readRunManifest } from '../runtime/index.js';

export const runCommand = (cli: CAC) => {
  cli.command('run <action> [run-id]', '查看 aictx Runtime 运行记录')
    .option('--runs-dir <dir>', 'Run Manifest 目录')
    .option('--json', '输出机器可读 JSON')
    .action(async (action: string, runId: string | undefined, options) => {
      try {
        if (action !== 'inspect') throw new Error(`不支持的 run 操作: ${action}。可用操作: inspect。`);
        if (!runId) throw new Error('run inspect 需要 Run ID。');
        const cwd = process.cwd();
        const config = await new ConfigParser(cwd).read();
        const runsDir = path.resolve(cwd, options.runsDir ?? config.runtime?.runsDir ?? '.aictx/runs');
        const manifest = await readRunManifest(runsDir, runId);
        if (options.json) {
          console.log(JSON.stringify(manifest, null, 2));
          return;
        }
        console.log(`Run: ${manifest.runId}`);
        console.log(`status: ${manifest.status}`);
        console.log(`task: ${manifest.task}`);
        console.log(`bundle: ${manifest.bundleVersion}`);
        console.log(`rules: ${manifest.selectedRules.length}, documents: ${manifest.selectedDocuments.length}`);
      } catch (error: any) {
        consola.error(`Run Manifest 读取失败: ${error.message}`);
        process.exitCode = 1;
      }
    });
};
