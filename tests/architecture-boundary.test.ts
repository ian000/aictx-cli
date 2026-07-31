import { describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const pending = [directory];
  while (pending.length > 0) {
    const current = pending.pop()!;
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(entryPath);
    }
  }
  return files;
}

describe('architecture boundaries', () => {
  it('keeps Runtime Plane independent from Development Plane and interactive CLI code', async () => {
    for (const file of await sourceFiles(path.join(process.cwd(), 'src/runtime'))) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content, file).not.toMatch(/from ['"].*development/);
      expect(content, file).not.toMatch(/from ['"].*commands/);
      expect(content, file).not.toMatch(/from ['"](?:consola|@clack\/prompts)/);
      expect(content, file).not.toContain('process.exit');
    }
  });

  it('keeps Shared Context Core free of Runtime, Development and CLI dependencies', async () => {
    for (const file of await sourceFiles(path.join(process.cwd(), 'src/context'))) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content, file).not.toMatch(/from ['"].*(?:runtime|development|commands)/);
      expect(content, file).not.toMatch(/from ['"](?:consola|@clack\/prompts)/);
      expect(content, file).not.toContain('process.exit');
    }
  });
});
