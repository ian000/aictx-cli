import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { createRequire } from 'node:module';
import { execa } from 'execa';

const dependencyRequire = createRequire(import.meta.url);

export function resolveGraphifyCliPath(): string {
  try {
    return dependencyRequire.resolve('graphify-go/cli.js');
  } catch {
    throw new Error('无法解析 aictx-cli 内置的 graphify-go 入口，请重新安装 aictx-cli。');
  }
}

interface RunGraphifyOptions {
  cwd?: string;
  stdio?: 'inherit' | 'pipe';
  env?: NodeJS.ProcessEnv;
}

export async function runGraphify(
  args: string[],
  options: RunGraphifyOptions = {}
) {
  const cliPath = resolveGraphifyCliPath();
  return execa(process.execPath, [cliPath, ...args], {
    cwd: options.cwd,
    env: options.env,
    stdio: options.stdio ?? 'inherit'
  });
}

export async function analyzeWithGraphify(
  dir: string,
  outDir: string,
  options: RunGraphifyOptions = {}
) {
  return runGraphify(['-dir', dir, '-out', outDir], options);
}

export async function printGraphifyArtifact(
  dir: string,
  format: 'json' | 'markdown',
  options: { cwd?: string } = {}
) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aictx-graphify-'));

  try {
    await analyzeWithGraphify(dir, tempDir, {
      cwd: options.cwd,
      stdio: 'pipe'
    });

    const targetFile = format === 'json' ? 'graph.json' : 'system-graph.md';
    return fs.readFile(path.join(tempDir, targetFile), 'utf-8');
  } finally {
    await fs.remove(tempDir);
  }
}
