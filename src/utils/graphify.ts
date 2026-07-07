import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { execa } from 'execa';

export async function runGraphify(
  args: string[],
  options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}
) {
  return execa('graphify-go', args, {
    cwd: options.cwd,
    preferLocal: true,
    stdio: options.stdio ?? 'inherit'
  });
}

export async function analyzeWithGraphify(
  dir: string,
  outDir: string,
  options: { cwd?: string; stdio?: 'inherit' | 'pipe' } = {}
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
