import fs from 'fs-extra';
import path from 'path';

export interface InitBootstrapOptions {
  cwd: string;
  projectName: string;
  fromPrd?: string;
  fromArch?: string;
  archSummary?: string;
  enableNpmTrustedPublisher?: boolean;
}

export interface ImportedArtifact {
  kind: 'prd' | 'architecture';
  sourcePath: string;
  targetPath: string;
  targetRelativePath: string;
  type: 'file' | 'directory';
  status: 'copied' | 'preserved';
}

export interface BootstrapArtifacts {
  importedArtifacts: ImportedArtifact[];
  generatedArtifacts: string[];
  warnings: string[];
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
): Promise<{ artifact: ImportedArtifact; warning?: string }> {
  const sourcePath = normalizeSourcePath(cwd, sourceInput);
  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    throw new Error(`未找到 ${kind === 'prd' ? 'PRD' : '技术架构'} 源路径: ${sourceInput}`);
  }

  const stat = await fs.stat(sourcePath);
  const baseName = path.basename(sourcePath);
  const targetPath = path.join(targetDir, baseName);
  const targetExists = await fs.pathExists(targetPath);

  if (targetExists) {
    const targetRelativePath = toPosixRelative(cwd, targetPath);
    const warning = `保留现有 ${kind === 'prd' ? 'PRD' : '技术架构'} 文档，未覆盖已存在目标: ${targetRelativePath}`;
    return {
      artifact: {
        kind,
        sourcePath,
        targetPath,
        targetRelativePath,
        type: stat.isDirectory() ? 'directory' : 'file',
        status: 'preserved'
      },
      warning
    };
  }

  if (stat.isDirectory()) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    return {
      artifact: {
        kind,
        sourcePath,
        targetPath,
        targetRelativePath: toPosixRelative(cwd, targetPath),
        type: 'directory',
        status: 'copied'
      }
    };
  }

  await fs.ensureDir(targetDir);
  await fs.copyFile(sourcePath, targetPath);
  return {
    artifact: {
      kind,
      sourcePath,
      targetPath,
      targetRelativePath: toPosixRelative(cwd, targetPath),
      type: 'file',
      status: 'copied'
    }
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
    ? importedArtifacts.map((artifact) => {
      const suffix = artifact.status === 'preserved' ? ' (existing target preserved)' : '';
      return `- \`${artifact.targetRelativePath}\` <= \`${artifact.sourcePath}\`${suffix}`;
    }).join('\n')
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

function createNpmTrustedPublisherWorkflow(): string {
  return `name: npm Trusted Publisher Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Verify tag matches package version
        run: |
          TAG_VERSION="\${GITHUB_REF_NAME#v}"
          PACKAGE_VERSION="$(node -p "require('./package.json').version")"
          test "$TAG_VERSION" = "$PACKAGE_VERSION"

      - name: Run tests
        run: npm run test --if-present

      - name: Build
        run: npm run build --if-present

      - name: Publish to npm
        run: npm publish --access public --provenance
`;
}

function createNpmTrustedPublisherGuide(projectName: string): string {
  return `---
tags:
  - project
  - release
  - npm
  - trusted-publisher
  - ${projectName}
---
# npm Trusted Publisher Release

## Default Release Path

- Publish source: GitHub Actions only.
- npm auth: Trusted Publisher / OIDC.
- Token policy: do not add \`NPM_TOKEN\` for normal releases.
- Workflow file: \`.github/workflows/npm-publish.yml\`.
- Tag format: \`vX.Y.Z\`.
- Package version must exactly match the pushed tag.

## npm Package Settings

Configure the package on npm:

- Publisher: GitHub Actions.
- Organization or user: your GitHub owner.
- Repository: this repository name.
- Workflow filename: \`npm-publish.yml\`.
- Environment name: leave empty unless the workflow uses a GitHub Actions environment.
- Allowed action: \`npm publish\`.
- Publishing access: allow Trusted Publisher or granular access tokens with 2FA bypass.

## Release Steps

1. Update \`package.json\` version.
2. Run \`npm test\` and \`npm run build --if-present\`.
3. Commit and push to \`main\`.
4. Create and push the matching tag, for example \`git tag -a v1.0.1 -m "v1.0.1"\`.
5. Push the tag with \`git push origin v1.0.1\`.
6. Verify the GitHub Actions run and npm package version.

## Guardrails

- Do not rename \`.github/workflows/npm-publish.yml\` after npm Trusted Publisher is configured.
- Keep \`id-token: write\` on the publish job.
- Keep \`registry-url: https://registry.npmjs.org\` in \`actions/setup-node\`.
- Keep \`npm publish --provenance\` so npm records build provenance.
- If publish fails after the tag is pushed, ship a new patch version instead of rewriting a published version.
`;
}

async function scaffoldNpmTrustedPublisherArtifacts(
  cwd: string,
  projectName: string,
  generatedArtifacts: string[],
  warnings: string[]
): Promise<void> {
  const workflowPath = path.join(cwd, '.github', 'workflows', 'npm-publish.yml');
  const guidePath = path.join(cwd, 'aictx-docs', 'project', 'npm-trusted-publisher-release.md');

  await fs.ensureDir(path.dirname(workflowPath));
  await fs.ensureDir(path.dirname(guidePath));

  if (await fs.pathExists(workflowPath)) {
    warnings.push(`保留现有 npm 发布 workflow，未覆盖: ${toPosixRelative(cwd, workflowPath)}`);
  } else {
    await fs.writeFile(workflowPath, createNpmTrustedPublisherWorkflow(), 'utf-8');
    generatedArtifacts.push(toPosixRelative(cwd, workflowPath));
  }

  if (await fs.pathExists(guidePath)) {
    warnings.push(`保留现有 npm Trusted Publisher 发布说明，未覆盖: ${toPosixRelative(cwd, guidePath)}`);
  } else {
    await fs.writeFile(guidePath, createNpmTrustedPublisherGuide(projectName), 'utf-8');
    generatedArtifacts.push(toPosixRelative(cwd, guidePath));
  }
}

export async function scaffoldBootstrapArtifacts(options: InitBootstrapOptions): Promise<BootstrapArtifacts> {
  const docBase = path.resolve(options.cwd, 'aictx-docs');
  const productDir = path.join(docBase, 'product');
  const architectureDir = path.join(docBase, 'architecture');
  const projectDir = path.join(docBase, 'project');
  const importedArtifacts: ImportedArtifact[] = [];
  const generatedArtifacts: string[] = [];
  const warnings: string[] = [];

  await fs.ensureDir(productDir);
  await fs.ensureDir(architectureDir);
  await fs.ensureDir(projectDir);

  if (options.fromPrd) {
    const result = await importPath(options.cwd, 'prd', options.fromPrd, productDir);
    importedArtifacts.push(result.artifact);
    if (result.warning) warnings.push(result.warning);
  }

  if (options.fromArch) {
    const result = await importPath(options.cwd, 'architecture', options.fromArch, architectureDir);
    importedArtifacts.push(result.artifact);
    if (result.warning) warnings.push(result.warning);
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

  if (options.enableNpmTrustedPublisher !== false) {
    await scaffoldNpmTrustedPublisherArtifacts(
      options.cwd,
      options.projectName,
      generatedArtifacts,
      warnings
    );
  }

  return { importedArtifacts, generatedArtifacts, warnings };
}
