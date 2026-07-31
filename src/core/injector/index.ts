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

export function getIdeRuleDir(cwd: string, ide: SupportedIde): string {
  if (ide === 'codex') return path.join(cwd, '.agents', 'workflows');
  if (ide === 'claude') return path.join(cwd, '.claude', 'rules');
  if (ide === 'cursor') return path.join(cwd, '.cursor', 'rules');
  if (ide === 'windsurf') return path.join(cwd, '.windsurf', 'rules');
  return path.join(cwd, '.trae', 'rules');
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

  protected async reconcileGeneratedRules(cwd: string, ide: SupportedIde, result: AssembleResult): Promise<void> {
    const ruleDir = getIdeRuleDir(cwd, ide);
    await fs.ensureDir(ruleDir);

    const expected = new Set(result.rules.map((rule) => getIdeRuleTargetPath(cwd, ide, rule.filename)));
    const existing = await fs.readdir(ruleDir);
    for (const entry of existing) {
      if (!entry.startsWith('aictx-')) continue;
      const targetPath = path.join(ruleDir, entry);
      const stat = await fs.stat(targetPath);
      if (stat.isFile() && !expected.has(targetPath)) {
        await fs.remove(targetPath);
      }
    }
  }
}

export class TraeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await this.reconcileGeneratedRules(cwd, 'trae', result);
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'trae', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('trae', rule.filename, rule.content));
    }
  }
}

export class CursorAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await this.reconcileGeneratedRules(cwd, 'cursor', result);
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'cursor', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('cursor', rule.filename, rule.content));
    }
  }
}

export class ClaudeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await this.reconcileGeneratedRules(cwd, 'claude', result);
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'claude', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('claude', rule.filename, rule.content));
    }
  }
}

export class WindsurfAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await this.reconcileGeneratedRules(cwd, 'windsurf', result);
    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'windsurf', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('windsurf', rule.filename, rule.content));
    }
  }
}

export class CodexAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    await ensureCodexWorkspace(cwd);
    await this.reconcileGeneratedRules(cwd, 'codex', result);

    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, 'codex', rule.filename);
      await this.writeRule(targetPath, renderRuleForIde('codex', rule.filename, rule.content));
    }
  }
}
