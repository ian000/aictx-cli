import fs from 'fs-extra';
import path from 'path';
import type { AssembleResult } from '../assembler/index.js';
import { ensureCodexWorkspace } from '../codex/index.js';
import type { SupportedIde } from '../ide/index.js';

export function getIdeRuleTargetPath(cwd: string, ide: SupportedIde, filename: string): string {
  const safeFilename = path.basename(filename);
  const baseName = path.basename(safeFilename, path.extname(safeFilename));

  if (ide === 'codex') return path.join(cwd, '.agents', 'workflows', `aictx-${safeFilename}`);
  if (ide === 'claude') return path.join(cwd, '.claude', 'rules', `aictx-${safeFilename}`);
  if (ide === 'cursor') return path.join(cwd, '.cursor', 'rules', `aictx-${baseName}.mdc`);
  if (ide === 'windsurf') return path.join(cwd, '.windsurf', 'rules', `aictx-${safeFilename}`);
  return path.join(cwd, '.trae', 'rules', `aictx-${safeFilename}`);
}

export function renderRuleForIde(ide: SupportedIde, filename: string, content: string): string {
  if (ide !== 'cursor') return content;
  const baseName = path.basename(filename, path.extname(filename));
  return `---\ndescription: "aictx ${baseName}"\nglobs: ["**/*"]\nalwaysApply: true\n---\n\n${content}`;
}

export abstract class IdeAdapter {
  abstract inject(cwd: string, result: AssembleResult): Promise<void>;

  protected async writeRule(targetPath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content, 'utf-8');
  }

  // 默认情况下不再粗暴清空整个目录，因为可能会误删用户原有的自定义规则
  // 相反，我们只追踪并覆盖 aictx 生成的文件
}

export class TraeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'trae', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('trae', rule.filename, rule.content));
    }
  }
}

export class CursorAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'cursor', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('cursor', rule.filename, rule.content));
    }
  }
}

export class ClaudeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'claude', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('claude', rule.filename, rule.content));
    }
  }
}

export class WindsurfAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'windsurf', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('windsurf', rule.filename, rule.content));
    }
  }
}

export class CodexAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await ensureCodexWorkspace(cwd);

    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'codex', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('codex', rule.filename, rule.content));
    }
  }
}
