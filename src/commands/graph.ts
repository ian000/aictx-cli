import { defineCommand } from 'cac';
import { consola } from 'consola';
import { analyzeWithGraphify, printGraphifyArtifact, runGraphify } from '../utils/graphify.js';

function getFlagValue(args: string[], flag: string, fallback: string) {
  const index = args.indexOf(flag);
  if (index === -1 || index === args.length - 1) {
    return fallback;
  }

  return args[index + 1];
}

export const graphCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('graph [...args]', 'Proxy command for local graphify-go AST engine')
    .allowUnknownOptions()
    .action(async () => {
      try {
        const rawArgs = process.argv.slice(3);
        consola.debug('Using graphify-go engine with args:', rawArgs);

        if (rawArgs[0] === 'analyze') {
          const dir = getFlagValue(rawArgs, '--dir', '.');
          const outDir = getFlagValue(rawArgs, '--out', './graphify-out');
          await analyzeWithGraphify(dir, outDir, { stdio: 'inherit' });
          return;
        }

        if (rawArgs[0] === 'print') {
          const dir = getFlagValue(rawArgs, '--dir', '.');
          const formatArg = getFlagValue(rawArgs, '--format', 'markdown');
          const format = formatArg === 'json' ? 'json' : 'markdown';
          const output = await printGraphifyArtifact(dir, format);
          process.stdout.write(output);
          return;
        }

        await runGraphify(rawArgs, { stdio: 'inherit' });
      } catch (err: any) {
        consola.error(`Graphify-Go engine failed: ${err.message}`);
        process.exit(err.exitCode || 1);
      }
    });
};
