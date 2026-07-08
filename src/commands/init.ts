import { defineCommand } from 'cac';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import { cliUX } from '../utils/cli-ux.js';
import { ensureCodexWorkspace } from '../core/codex/index.js';
import { scaffoldBootstrapArtifacts } from '../core/init/bootstrap.js';
import { runCurrentAictxCommand } from '../utils/self-cli.js';

export const initCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('init', '初始化 aictx 配置')
    .option('--onboard', '直接进入存量项目逆向接管流程')
    .option('-y, --yes', '跳过所有确认提示')
    .option('--repo <url>', '指定 Meta-Repo 地址 (跳过交互)')
    .option('--ide <ide>', '指定 IDE (如 codex/trae, 跳过交互)')
    .option('--from-prd <path>', '导入现有 PRD / 产品文档文件或目录')
    .option('--from-arch <path>', '导入现有技术架构 / 技术栈文档文件或目录')
    .option('--arch <text>', '直接提供技术架构摘要，生成架构种子文档')
    .action(async (options) => {
      cliUX.intro('初始化 Context as Code 基础设施');
      const defaultIdes = ['codex'];

      let projectType = 'greenfield';
      
      if (options.onboard) {
        projectType = 'brownfield';
      } else if (options.repo !== undefined || options.ide !== undefined) {
        projectType = 'greenfield';
      } else {
        // 1. 询问项目类型 (绿地 or 棕地)
        projectType = await cliUX.askSelect(
          '请选择您的项目类型 (Smart Gateway)',
          [
            { value: 'greenfield', label: '新项目 (Greenfield)', hint: '生成空目录与配置模板' },
            { value: 'brownfield', label: '存量老项目 (Brownfield)', hint: '执行逆向工程接管 (Onboard)' }
          ]
        ) as string;
      }

      if (projectType === 'brownfield') {
        cliUX.outro('🚀 即将启动 aictx onboard 逆向工程流程...');
        const { OnboardEngine } = await import('../core/onboard/index.js');
        const onboard = new OnboardEngine({ cwd: process.cwd(), yes: options.yes });
        await onboard.run();
        return;
      }

      // 2. 询问 IDE 类型 (仅新项目)
      let ides: string[] = [];
      if (options.ide) {
        ides = [options.ide];
      } else if (options.yes) {
        ides = defaultIdes;
      } else {
        ides = await cliUX.askMultiSelect(
          '请选择当前团队使用的 AI IDE 或编程助手 (多选)',
          [
            { value: 'codex', label: 'Codex', hint: 'OpenAI Codex (AGENTS.md + .agents/*) [默认]' },
            { value: 'trae', label: 'Trae', hint: '字节跳动 AI IDE (.trae/rules/)' },
            { value: 'cursor', label: 'Cursor', hint: 'Cursor (.cursor/rules/)' },
            { value: 'windsurf', label: 'Windsurf', hint: 'Codeium Windsurf' },
            { value: 'claude', label: 'Claude Code', hint: 'Anthropic CLI (.clauderc)' },
          ],
          true,
          defaultIdes
        ) as string[];
      }

      // 2. 询问 Meta-Repo 地址
      let repoUrl = '';
      if (options.repo !== undefined) {
        repoUrl = options.repo === 'builtin' ? '' : options.repo;
      } else {
        repoUrl = await cliUX.askText(
          '请输入团队的中央规范仓库地址 (留空则使用 aictx 内置最佳实践规则)',
          'git@github.com:your-org/aictx-meta-repo.git',
          ''
        ) as string;
      }

      let fromPrd = options.fromPrd as string | undefined;
      let fromArch = options.fromArch as string | undefined;
      let archSummary = options.arch as string | undefined;

      if (!options.yes && !fromPrd && !fromArch && !archSummary) {
        const shouldImportExistingDocs = await cliUX.askConfirm(
          '是否基于现有 PRD / 技术架构文档快速初始化项目？',
          false
        );

        if (shouldImportExistingDocs) {
          fromPrd = (await cliUX.askText(
            '请输入现有 PRD 或产品文档路径 (可留空跳过)',
            './docs/prd.md',
            ''
          )) as string;
          fromPrd = fromPrd.trim() || undefined;

          const archSourceMode = await cliUX.askSelect(
            '请选择技术架构输入方式',
            [
              { value: 'doc', label: '导入现有技术架构文档', hint: '如 tech-stack.md / architecture.md / docs/tech' },
              { value: 'summary', label: '直接填写技术架构摘要', hint: '适合先定义前后端、数据库、部署与中间件约束' },
              { value: 'skip', label: '暂不提供', hint: '只导入 PRD，并在 bootstrap TODO 中提示补齐' }
            ]
          ) as string;

          if (archSourceMode === 'doc') {
            fromArch = (await cliUX.askText(
              '请输入技术架构文档路径',
              './docs/tech-stack.md'
            )) as string;
            fromArch = fromArch.trim() || undefined;
          } else if (archSourceMode === 'summary') {
            archSummary = (await cliUX.askText(
              '请输入技术架构摘要',
              '例如: Frontend Vue 3 + Vite，Backend NestJS，DB PostgreSQL，Deploy Docker Compose + Nginx'
            )) as string;
            archSummary = archSummary.trim() || undefined;
          }
        }
      } else if (!options.yes && fromPrd && !fromArch && !archSummary) {
        const archSourceMode = await cliUX.askSelect(
          '检测到你正在基于 PRD 初始化，请补充技术架构输入',
          [
            { value: 'doc', label: '导入现有技术架构文档', hint: '推荐，约束最稳定' },
            { value: 'summary', label: '直接填写技术架构摘要', hint: '适合先给出技术方向和边界' },
            { value: 'skip', label: '稍后补充', hint: '本次只导入 PRD' }
          ]
        ) as string;

        if (archSourceMode === 'doc') {
          fromArch = (await cliUX.askText(
            '请输入技术架构文档路径',
            './docs/tech-stack.md'
          )) as string;
          fromArch = fromArch.trim() || undefined;
        } else if (archSourceMode === 'summary') {
          archSummary = (await cliUX.askText(
            '请输入技术架构摘要',
            '例如: Frontend Vue 3 + Vite，Backend NestJS，DB PostgreSQL，Deploy Docker Compose + Nginx'
          )) as string;
          archSummary = archSummary.trim() || undefined;
        }
      }

      // 3. 生成配置文件
      const configPath = path.resolve(process.cwd(), 'aictx.json');
      const ignorePath = path.resolve(process.cwd(), '.aiignore');
      
      const s = cliUX.createSpinner();
      s.start('正在生成项目配置...');

      const projectName = path.basename(process.cwd());
      const defaultConfig = {
        $schema: "https://unpkg.com/aictx/schema.json",
        version: "1.0",
        repository: repoUrl,
        ides: ides.length > 0 ? ides : defaultIdes,
        tags: ["backend", "frontend", "common", projectName],
        bootstrap: {
          mode: fromPrd || fromArch || archSummary ? 'from-docs' : 'blank',
          prdPath: fromPrd,
          architecturePath: fromArch,
          hasArchitectureSummary: Boolean(archSummary && archSummary.trim().length > 0)
        },
        overrides: {}
      };

      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
      
      // 写入基础的 .aiignore
      if (!fs.existsSync(ignorePath)) {
        await fs.writeFile(ignorePath, `# aictx ignore file\n# 在此处配置不需要被 AI 读取的敏感或无价值文件\nnode_modules\n.env*\ndist\n`);
      }

      // Scaffold standard documents directory structure and MOC templates
      const docBase = path.resolve(process.cwd(), 'aictx-docs');
      const dirsToCreate = [
        path.join(docBase, 'product'),
        path.join(docBase, 'architecture'),
        path.join(docBase, 'project')
      ];

      for (const dir of dirsToCreate) {
        await fs.ensureDir(dir);
        const folderName = path.basename(dir);
        const indexPath = path.join(dir, '00-Index.md');
        
        if (!fs.existsSync(indexPath)) {
          const indexContent = `---
tags:
  - aictx
  - moc
  - ${folderName}
aliases:
  - [${folderName} Index, 目录]
entities:
  - [MOC]
roles:
  - [Maintainer]
---
# ${folderName.charAt(0).toUpperCase() + folderName.slice(1)} Map of Content (MOC)

> **路由表**: 这是 \`${folderName}\` 目录的核心索引文件。
> AI 助手在寻找特定业务逻辑时，必须**优先且仅**读取此文件，并通过这里的双向链接（如 \`[[xxx]]\`）去跳转到对应的原子文档。**严禁使用全局检索**。

## 📑 领域索引

<!-- aictx-index-start -->
_运行 \`aictx index\` 自动生成路由表_
<!-- aictx-index-end -->

## 📌 业务模块说明
请在此处简要说明该目录下各原子文档的协作关系和业务边界。
`;
          await fs.writeFile(indexPath, indexContent);
        }
      }

      const bootstrapArtifacts = await scaffoldBootstrapArtifacts({
        cwd: process.cwd(),
        projectName,
        fromPrd,
        fromArch,
        archSummary
      });

      // Copy built-in Trae skills if Trae is selected
      if (ides.includes('trae')) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // __dirname is usually 'dist' (when bundled) or 'src/commands' (in dev).
        const isDist = __dirname.endsWith('dist');
        const templatesDir = path.resolve(__dirname, isDist ? 'templates/.trae/skills' : '../templates/.trae/skills');
        const targetSkillsDir = path.resolve(process.cwd(), '.trae/skills');
        
        if (fs.existsSync(templatesDir)) {
          await fs.copy(templatesDir, targetSkillsDir, { overwrite: false });
        }
      }

      if (ides.includes('codex')) {
        await ensureCodexWorkspace(process.cwd());
      }

      s.stop('配置生成成功！');

      console.log('\n======================================================================');
      console.log(`🎉 成功接入 aictx!\n`);
      console.log(`📝 配置文件已生成: ${pc.cyan('aictx.json')}`);
      console.log(`🛡️ 忽略文件已生成: ${pc.cyan('.aiignore')}`);
      console.log(`🗂️ 路由表模板已生成: ${pc.cyan('aictx-docs/**/00-Index.md')}\n`);
      if (bootstrapArtifacts.importedArtifacts.length > 0 || bootstrapArtifacts.generatedArtifacts.length > 0) {
        console.log(`📥 已导入/生成启动文档: ${pc.cyan((bootstrapArtifacts.importedArtifacts.length + bootstrapArtifacts.generatedArtifacts.length).toString())} 份`);
      }
      console.log('======================================================================\n');
      
      // 自动执行 aictx sync
      try {
        await runCurrentAictxCommand(['sync'], process.cwd());
      } catch (e) {
        console.error(pc.red(`自动 aictx sync 失败，请手动执行 \`aictx sync\`: ${(e as Error).message}`));
      }
      
      cliUX.outro('Stop fighting the AI. Start engineering its context.');
    });
};
