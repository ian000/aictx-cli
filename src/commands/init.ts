import { defineCommand } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { cliUX } from '../utils/cli-ux.js';
import { fileURLToPath } from 'url';

export const initCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('init', '初始化 aictx 配置')
    .option('--onboard', '直接进入存量项目逆向接管流程')
    .option('-y, --yes', '跳过所有确认提示')
    .option('--repo <url>', '指定 Meta-Repo 地址 (跳过交互)')
    .option('--ide <ide>', '指定 IDE (如 trae, 跳过交互)')
    .action(async (options) => {
      cliUX.intro('初始化 Context as Code 基础设施');

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
      } else {
        ides = await cliUX.askMultiSelect(
          '请选择当前团队使用的 AI IDE 或编程助手 (多选)',
          [
            { value: 'trae', label: 'Trae', hint: '字节跳动 AI IDE (.trae/rules/)' },
            { value: 'cursor', label: 'Cursor', hint: 'Cursor (.cursor/rules/)' },
            { value: 'windsurf', label: 'Windsurf', hint: 'Codeium Windsurf' },
            { value: 'claude', label: 'Claude Code', hint: 'Anthropic CLI (.clauderc)' },
          ],
          true
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
        ides: ides,
        tags: ["backend", "frontend", "common", projectName],
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

      // Copy built-in Trae skills if Trae is selected
      if (ides.includes('trae')) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        // __dirname is usually 'dist' (when bundled) or 'src/commands' (in dev).
        const isDist = __dirname.endsWith('dist');
        const templatesDir = path.resolve(__dirname, isDist ? 'templates/.trae/skills' : '../templates/.trae/skills');
        const targetSkillsDir = path.resolve(process.cwd(), '.trae/skills');
        
        if (fs.existsSync(templatesDir)) {
          await fs.copy(templatesDir, targetSkillsDir, { overwrite: false });
        }
      }

      s.stop('配置生成成功！');

      console.log('\n======================================================================');
      console.log(`🎉 成功接入 aictx!\n`);
      console.log(`📝 配置文件已生成: ${pc.cyan('aictx.json')}`);
      console.log(`🛡️ 忽略文件已生成: ${pc.cyan('.aiignore')}`);
      console.log(`🗂️ 路由表模板已生成: ${pc.cyan('aictx-docs/**/00-Index.md')}\n`);
      console.log('======================================================================\n');
      
      // 自动执行 aictx sync
      try {
        const { execa } = await import('execa');
        await execa('npx', ['aictx', 'sync'], { 
          cwd: process.cwd(),
          stdio: 'inherit'
        });
      } catch (e) {
        try {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const isDist = __dirname.endsWith('dist');
          const cliPath = isDist ? path.resolve(__dirname, 'aictx.js') : path.resolve(__dirname, '../bin/aictx.ts');
          
          const { execa } = await import('execa');
          // In dev mode (src/commands), we should technically use ts-node or similar, but this fallback is usually hit in dist mode
          await execa('node', [cliPath, 'sync'], {
            cwd: process.cwd(),
            stdio: 'inherit'
          });
        } catch (e2) {
          console.error(pc.red(`自动 aictx sync 失败，请手动执行 \`aictx sync\`: ${(e2 as Error).message}`));
        }
      }
      
      cliUX.outro('Stop fighting the AI. Start engineering its context.');
    });
};
