import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const AGENTS_START = '<!-- aictx-codex-start -->';
const AGENTS_END = '<!-- aictx-codex-end -->';

function getTemplatesRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const isDist = __dirname.endsWith('dist');
  return path.resolve(__dirname, isDist ? 'templates' : '../../templates');
}

function renderAgentsSection(): string {
  return `${AGENTS_START}
# aictx Codex Instructions

This repository uses aictx workflows as the shared source of truth for Codex.

Before doing business-sensitive work in this project, read:

- \`.agents/workflows/common-global.md\` (if present)
- relevant \`.agents/workflows/aictx-*.md\` workflow files
- relevant \`.agents/workflows/project-*.md\` workflow files

## Skills

Codex should use local project skills from:

- \`.agents/skills\`

If the requested skill exists in both \`.agents/skills\` and another IDE-specific directory, prefer \`.agents/skills\`.

## Documents

When you create or update project, product, or architecture documents, rebuild the routing table with:

- \`aictx index\`
${AGENTS_END}`;
}

export async function ensureCodexAgentsFile(cwd: string): Promise<void> {
  const targetPath = path.join(cwd, 'AGENTS.md');
  const generatedSection = renderAgentsSection();

  if (!(await fs.pathExists(targetPath))) {
    await fs.writeFile(targetPath, `${generatedSection}\n`, 'utf-8');
    return;
  }

  const current = await fs.readFile(targetPath, 'utf-8');
  if (current.includes(AGENTS_START) && current.includes(AGENTS_END)) {
    const updated = current.replace(
      new RegExp(`${AGENTS_START}[\\s\\S]*?${AGENTS_END}`, 'g'),
      generatedSection
    );
    await fs.writeFile(targetPath, updated, 'utf-8');
    return;
  }

  const separator = current.endsWith('\n') ? '\n' : '\n\n';
  await fs.writeFile(targetPath, `${current}${separator}${generatedSection}\n`, 'utf-8');
}

export async function ensureCodexSkills(cwd: string): Promise<void> {
  const templatesDir = path.join(getTemplatesRoot(), '.agents', 'skills');
  const targetDir = path.join(cwd, '.agents', 'skills');

  if (await fs.pathExists(templatesDir)) {
    await fs.copy(templatesDir, targetDir, { overwrite: false });
  }
}

export async function ensureCodexWorkspace(cwd: string): Promise<void> {
  await fs.ensureDir(path.join(cwd, '.agents', 'workflows'));
  await ensureCodexAgentsFile(cwd);
  await ensureCodexSkills(cwd);
}
