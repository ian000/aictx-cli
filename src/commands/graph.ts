import { defineCommand } from 'cac';
import { execa } from 'execa';
import { consola } from 'consola';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

export const graphCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('graph [...args]', 'Proxy command for local/vendored graphify AST engine')
    .allowUnknownOptions()
    .action(async (args: string[], options) => {
      try {
        // Step 1: Detect if a global/public `graphify` is installed and works
        let useGlobal = false;
        try {
          const { stdout } = await execa('graphify', ['--version']);
          // Check if it's the real graphifyy package (by Safi Shamsi)
          if (stdout && stdout.includes('graphifyy')) {
             useGlobal = true;
          }
        } catch (e) {
          // Global not found or failed
          useGlobal = false;
        }

        // We need to re-construct the raw arguments passed to `aictx graph`
        // cac parses flags into `options`, we need to stringify them back for the python script
        const rawArgs = process.argv.slice(3); // ['graph', ...rawArgs]

        if (useGlobal) {
          // If global public version exists, proxy to it to enjoy the "upgrade dividend"
          consola.debug('Using globally installed graphify engine');
          await execa('graphify', rawArgs, { stdio: 'inherit' });
        } else {
          // Step 2: Fallback to the vendored, modified version (Blackbox)
          consola.debug('Using vendored internal graphify engine');
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const vendorPath = path.resolve(__dirname, '../vendor/graphify');
          const mainPyPath = path.resolve(vendorPath, 'graphify', '__main__.py');

          if (!fs.existsSync(mainPyPath)) {
             consola.error('内置的 Graphify 引擎文件丢失，且未检测到全局安装的 graphify。');
             process.exit(1);
          }

          // Execute python <path_to_main.py> [args...]
          await execa('python', [mainPyPath, ...rawArgs], { stdio: 'inherit' });
        }
      } catch (err: any) {
        consola.error(`Graphify engine failed: ${err.message}`);
        process.exit(err.exitCode || 1);
      }
    });
};
