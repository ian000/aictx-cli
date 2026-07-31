import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureCodexWorkspace } from '../codex/index.js';

export const SUPPORTED_IDES = ['codex', 'claude', 'cursor', 'windsurf', 'trae'] as const;
export type SupportedIde = typeof SUPPORTED_IDES[number];

export const DEFAULT_IDES: SupportedIde[] = ['codex'];

export const IDE_OPTIONS: { value: SupportedIde; label: string; hint: string }[] = [
  { value: 'codex', label: 'Codex', hint: 'AGENTS.md + .agents/* [默认]' },
  { value: 'claude', label: 'Claude Code', hint: 'CLAUDE.md + .claude/*' },
  { value: 'cursor', label: 'Cursor', hint: '.cursor/rules/*' },
  { value: 'windsurf', label: 'Windsurf', hint: '.windsurf/rules/*' },
  { value: 'trae', label: 'Trae', hint: '.trae/rules/* + .trae/skills/*' }
];

const CLAUDE_START = '<!-- aictx-claude-start -->';
const CLAUDE_END = '<!-- aictx-claude-end -->';

function getTemplatesRoot(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const isDist = dirname.endsWith('dist');
  return path.resolve(dirname, isDist ? 'templates' : '../../templates');
}

export function parseIdeOption(value: unknown): SupportedIde[] {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`--ide 不能为空。可选值: ${SUPPORTED_IDES.join(', ')}`);
  }

  const values = [...new Set(value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean))];
  const invalid = values.filter(value => !SUPPORTED_IDES.includes(value as SupportedIde));
  if (invalid.length > 0) {
    throw new Error(`不支持的 AI 工具: ${invalid.join(', ')}。可选值: ${SUPPORTED_IDES.join(', ')}`);
  }
  return values as SupportedIde[];
}

export async function readConfiguredIdes(cwd: string): Promise<SupportedIde[] | undefined> {
  const configPath = path.join(cwd, 'aictx.json');
  if (!(await fs.pathExists(configPath))) return undefined;

  try {
    const config = await fs.readJson(configPath);
    if (!Array.isArray(config.ides) || config.ides.length === 0) return undefined;
    const values = config.ides.map((value: unknown) => String(value).toLowerCase());
    const invalid = values.filter((value: string) => !SUPPORTED_IDES.includes(value as SupportedIde));
    if (invalid.length > 0) {
      throw new Error(`aictx.json 包含不支持的 AI 工具: ${invalid.join(', ')}`);
    }
    return [...new Set(values)] as SupportedIde[];
  } catch (error) {
    throw new Error(`读取现有 aictx.json 的 ides 失败: ${(error as Error).message}`);
  }
}

async function ensureManagedSection(filePath: string, start: string, end: string, content: string): Promise<void> {
  const section = `${start}\n${content}\n${end}`;
  if (!(await fs.pathExists(filePath))) {
    await fs.writeFile(filePath, `${section}\n`, 'utf-8');
    return;
  }

  const current = await fs.readFile(filePath, 'utf-8');
  if (current.includes(start) && current.includes(end)) {
    await fs.writeFile(filePath, current.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'g'), section), 'utf-8');
    return;
  }

  const separator = current.endsWith('\n') ? '\n' : '\n\n';
  await fs.writeFile(filePath, `${current}${separator}${section}\n`, 'utf-8');
}

async function copySkills(sourceRelativePath: string, targetPath: string): Promise<void> {
  const source = path.join(getTemplatesRoot(), sourceRelativePath);
  if (await fs.pathExists(source)) {
    await fs.copy(source, targetPath, { overwrite: false });
  }
}

async function ensureClaudeWorkspace(cwd: string): Promise<void> {
  await fs.ensureDir(path.join(cwd, '.claude', 'rules'));
  await copySkills(path.join('.agents', 'skills'), path.join(cwd, '.claude', 'skills'));
  await ensureManagedSection(
    path.join(cwd, 'CLAUDE.md'),
    CLAUDE_START,
    CLAUDE_END,
    `# aictx Claude Code Instructions

This repository uses aictx rules as its shared source of truth.

- Read relevant \`.claude/rules/aictx-*.md\` files before business-sensitive changes.
- Project skills are available under \`.claude/skills\`.
- Before reading product, architecture, or project docs for a request, run \`aictx route "<question>"\` and read the returned documents in order.
- If routing has no match, read the relevant \`aictx-docs/**/00-Index.md\` before broad search.
- Run \`aictx index\` after changing product or architecture documents.`
  );
}

async function ensureCursorWorkspace(cwd: string): Promise<void> {
  await fs.ensureDir(path.join(cwd, '.cursor', 'rules'));
  await fs.ensureDir(path.join(cwd, '.cursor', 'commands'));
  const skillPath = path.join(getTemplatesRoot(), '.agents', 'skills', 'aictx-graphify', 'SKILL.md');
  if (await fs.pathExists(skillPath)) {
    const content = await fs.readFile(skillPath, 'utf-8');
    await fs.writeFile(path.join(cwd, '.cursor', 'commands', 'aictx-graphify.md'), content, 'utf-8');
  }
}

async function ensureWindsurfWorkspace(cwd: string): Promise<void> {
  await fs.ensureDir(path.join(cwd, '.windsurf', 'rules'));
}

async function ensureTraeWorkspace(cwd: string): Promise<void> {
  await fs.ensureDir(path.join(cwd, '.trae', 'rules'));
  await copySkills(path.join('.trae', 'skills'), path.join(cwd, '.trae', 'skills'));
}

export async function ensureIdeWorkspaces(cwd: string, ides: SupportedIde[]): Promise<void> {
  for (const ide of ides) {
    if (ide === 'codex') await ensureCodexWorkspace(cwd);
    if (ide === 'claude') await ensureClaudeWorkspace(cwd);
    if (ide === 'cursor') await ensureCursorWorkspace(cwd);
    if (ide === 'windsurf') await ensureWindsurfWorkspace(cwd);
    if (ide === 'trae') await ensureTraeWorkspace(cwd);
  }
}
