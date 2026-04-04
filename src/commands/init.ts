import { defineCommand } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { cliUX } from '../utils/cli-ux.js';

export const initCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('init', '初始化 aictx 配置')
    .action(async () => {
      cliUX.intro('初始化 Context as Code 基础设施');

      // 1. 询问 IDE 类型
      const ides = await cliUX.askMultiSelect(
        '请选择当前团队使用的 AI IDE 或编程助手 (多选)',
        [
          { value: 'trae', label: 'Trae', hint: '字节跳动 AI IDE (.trae/rules/)' },
          { value: 'cursor', label: 'Cursor', hint: 'Cursor (.cursor/rules/)' },
          { value: 'windsurf', label: 'Windsurf', hint: 'Codeium Windsurf' },
          { value: 'claude', label: 'Claude Code', hint: 'Anthropic CLI (.clauderc)' },
        ],
        true
      );

      // 2. 询问 Meta-Repo 地址
      const repoUrl = await cliUX.askText(
        '请输入团队的中央规范仓库地址 (Git URL 或本地绝对路径)',
        'git@github.com:your-org/aictx-meta-repo.git',
        './'
      );

      // 3. 生成配置文件
      const configPath = path.resolve(process.cwd(), 'aictx.json');
      const ignorePath = path.resolve(process.cwd(), '.aiignore');
      
      const s = cliUX.createSpinner();
      s.start('正在生成项目配置...');

      const defaultConfig = {
        $schema: "https://unpkg.com/aictx/schema.json",
        version: "1.0",
        repository: repoUrl,
        ides: ides,
        tags: ["backend", "frontend", "common"],
        overrides: {}
      };

      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
      
      // 写入基础的 .aiignore
      if (!fs.existsSync(ignorePath)) {
        await fs.writeFile(ignorePath, `# aictx ignore file\n# 在此处配置不需要被 AI 读取的敏感或无价值文件\nnode_modules\n.env*\ndist\n`);
      }

      // Scaffold standard documents directory structure and MOC templates
      const docBase = path.resolve(process.cwd(), 'documents');
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

      s.stop('配置生成成功！');

      console.log('\n======================================================================');
      console.log(`🎉 成功接入 aictx!\n`);
      console.log(`📝 配置文件已生成: ${pc.cyan('aictx.json')}`);
      console.log(`🛡️ 忽略文件已生成: ${pc.cyan('.aiignore')}`);
      console.log(`🗂️ 路由表模板已生成: ${pc.cyan('documents/**/00-Index.md')}\n`);
      console.log(`下一步，请运行: ${pc.green('aictx sync')} 获取组织上下文规范。`);
      console.log(`然后运行: ${pc.green('aictx index')} 生成 MOC 本地路由。`);
      console.log('======================================================================\n');
      
      cliUX.outro('Stop fighting the AI. Start engineering its context.');
    });
};
