import fs from 'fs-extra';
import path from 'path';

export interface InitBootstrapOptions {
  cwd: string;
  projectName: string;
  fromPrd?: string;
  fromArch?: string;
  archSummary?: string;
}

export interface ImportedArtifact {
  kind: 'prd' | 'architecture';
  sourcePath: string;
  targetPath: string;
  targetRelativePath: string;
  type: 'file' | 'directory';
}

export interface BootstrapArtifacts {
  importedArtifacts: ImportedArtifact[];
  generatedArtifacts: string[];
}

function normalizeSourcePath(cwd: string, inputPath: string): string {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);
}

function toPosixRelative(cwd: string, filePath: string): string {
  return path.relative(cwd, filePath).split(path.sep).join('/');
}

async function importPath(
  cwd: string,
  kind: ImportedArtifact['kind'],
  sourceInput: string,
  targetDir: string
): Promise<ImportedArtifact> {
  const sourcePath = normalizeSourcePath(cwd, sourceInput);
  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    throw new Error(`未找到 ${kind === 'prd' ? 'PRD' : '技术架构'} 源路径: ${sourceInput}`);
  }

  const stat = await fs.stat(sourcePath);
  const baseName = path.basename(sourcePath);
  const targetPath = path.join(targetDir, baseName);

  if (stat.isDirectory()) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    return {
      kind,
      sourcePath,
      targetPath,
      targetRelativePath: toPosixRelative(cwd, targetPath),
      type: 'directory'
    };
  }

  await fs.ensureDir(targetDir);
  await fs.copyFile(sourcePath, targetPath);
  return {
    kind,
    sourcePath,
    targetPath,
    targetRelativePath: toPosixRelative(cwd, targetPath),
    type: 'file'
  };
}

function createArchitectureSeed(projectName: string, archSummary: string): string {
  return `---
tags:
  - architecture
  - bootstrap
  - ${projectName}
---
# ${projectName} Technical Architecture Seed

## Architecture Summary

${archSummary.trim()}

## Initial Constraints

- Use this document as the implementation baseline until a fuller architecture decision record is produced.
- Expand it with module boundaries, deployment topology, data model, and non-functional constraints before major feature work starts.
`;
}

function createBootstrapTodo(
  projectName: string,
  importedArtifacts: ImportedArtifact[],
  generatedArtifacts: string[],
  hasArchitectureInput: boolean
): string {
  const importedLines = importedArtifacts.length > 0
    ? importedArtifacts.map((artifact) => `- \`${artifact.targetRelativePath}\` <= \`${artifact.sourcePath}\``).join('\n')
    : '- 当前未导入外部文档，使用空白脚手架初始化。';

  const generatedLines = generatedArtifacts.length > 0
    ? generatedArtifacts.map((artifact) => `- \`${artifact}\``).join('\n')
    : '- 无额外生成文档。';

  return `---
tags:
  - project
  - bootstrap
  - ${projectName}
---
# ${projectName} Bootstrap TODO

## Imported Inputs

${importedLines}

## Generated Inputs

${generatedLines}

## Immediate Actions

- [x] 建立 \`aictx-docs/product\`、\`aictx-docs/architecture\`、\`aictx-docs/project\` 三层目录与索引。
- [x] 将现有产品文档与技术架构输入纳入 \`aictx-docs\` 路由体系。
- [ ] 基于 PRD 提炼领域模型、关键角色、核心流程与业务红线。
- [ ] 将技术架构约束拆解为前端、后端、数据库、部署与可观测性决策。
- [ ] 生成首轮“基础骨架实施计划”，再进入代码搭建阶段。

## Architecture Status

${hasArchitectureInput
    ? '- 已提供技术架构输入，可以直接进入模块拆分和骨架搭建。'
    : '- 尚未提供技术架构输入。建议补充 `--from-arch` 文档或使用 `--arch` 传入技术架构摘要，否则 AI 只能基于 PRD 做业务拆解，无法稳定约束实现方案。'}
`;
}

export async function scaffoldBootstrapArtifacts(options: InitBootstrapOptions): Promise<BootstrapArtifacts> {
  const docBase = path.resolve(options.cwd, 'aictx-docs');
  const productDir = path.join(docBase, 'product');
  const architectureDir = path.join(docBase, 'architecture');
  const projectDir = path.join(docBase, 'project');
  const importedArtifacts: ImportedArtifact[] = [];
  const generatedArtifacts: string[] = [];

  if (options.fromPrd) {
    importedArtifacts.push(await importPath(options.cwd, 'prd', options.fromPrd, productDir));
  }

  if (options.fromArch) {
    importedArtifacts.push(await importPath(options.cwd, 'architecture', options.fromArch, architectureDir));
  }

  if (options.archSummary && options.archSummary.trim().length > 0) {
    const architectureSeedPath = path.join(architectureDir, `${options.projectName}-technical-architecture.md`);
    await fs.writeFile(architectureSeedPath, createArchitectureSeed(options.projectName, options.archSummary), 'utf-8');
    generatedArtifacts.push(toPosixRelative(options.cwd, architectureSeedPath));
  }

  if (importedArtifacts.length > 0 || generatedArtifacts.length > 0) {
    const todoPath = path.join(projectDir, `${options.projectName}-bootstrap-todo.md`);
    const todoContent = createBootstrapTodo(
      options.projectName,
      importedArtifacts,
      generatedArtifacts,
      importedArtifacts.some((artifact) => artifact.kind === 'architecture') || generatedArtifacts.length > 0
    );
    await fs.writeFile(todoPath, todoContent, 'utf-8');
    generatedArtifacts.push(toPosixRelative(options.cwd, todoPath));
  }

  return { importedArtifacts, generatedArtifacts };
}
