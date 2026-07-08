import { execa } from 'execa';

export async function runCurrentAictxCommand(args: string[], cwd: string) {
  const cliEntry = process.argv[1];
  if (!cliEntry) {
    throw new Error('无法定位当前 aictx CLI 入口，请手动执行对应命令。');
  }

  await execa(process.execPath, [cliEntry, ...args], {
    cwd,
    stdio: 'inherit'
  });
}
