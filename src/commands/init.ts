import { defineCommand } from 'cac';
import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { cliUX } from '../utils/cli-ux.js';
import { t, setLanguage, Language } from '../locales/index.js';

export const initCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('init', 'Initialize aictx configuration / 初始化 aictx 配置')
    .action(async () => {
      // 0. 询问语言
      const lang = await cliUX.askSelect<Language>(
        'Please select your preferred language / 请选择你的首选语言',
        [
          { value: 'en', label: 'English' },
          { value: 'zh', label: '简体中文' }
        ]
      );
      setLanguage(lang);

      cliUX.intro(t('init.welcome'));

      // 1. 询问 IDE 类型
      const ides = await cliUX.askMultiSelect(
        t('init.select_ide'),
        [
          { value: 'trae', label: 'Trae', hint: '(.trae/rules/)' },
          { value: 'cursor', label: 'Cursor', hint: '(.cursor/rules/)' },
          { value: 'windsurf', label: 'Windsurf', hint: 'Codeium Windsurf' },
          { value: 'claude', label: 'Claude Code', hint: '(.clauderc)' },
        ],
        true
      );

      // 2. 询问 Meta-Repo 地址
      const repoUrl = await cliUX.askText(
        t('init.enter_repo'),
        'git@github.com:your-org/aictx-meta-repo.git',
        './'
      );

      // 3. 询问 tags
      const tagsStr = await cliUX.askText(
        t('init.enter_tags'),
        'frontend, common',
        'frontend, common'
      );
      const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

      // 4. 生成配置文件
      const configPath = path.resolve(process.cwd(), 'aictx.json');
      const ignorePath = path.resolve(process.cwd(), '.aiignore');
      
      const s = cliUX.createSpinner();
      s.start(t('sync.assemble') + '...'); // using a placeholder

      const defaultConfig = {
        $schema: "https://unpkg.com/aictx/schema.json",
        version: "1.0",
        lang: lang,
        repository: repoUrl,
        ides: ides,
        tags: tags.length > 0 ? tags : ["common"],
        overrides: {}
      };

      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
      
      // 写入基础的 .aiignore
      if (!fs.existsSync(ignorePath)) {
        await fs.writeFile(ignorePath, `# aictx ignore file\nnode_modules\n.env*\ndist\n`);
      }

      s.stop(t('init.success'));

      console.log('\n======================================================================');
      console.log(`🎉 aictx initialized!\n`);
      console.log(`📝 Config: ${pc.cyan('aictx.json')}`);
      console.log(`🛡️ Ignore: ${pc.cyan('.aiignore')}\n`);
      console.log(`Next: ${pc.green('aictx sync')}`);
      console.log('======================================================================\n');
      
      cliUX.outro('Stop fighting the AI. Start engineering its context.');
    });
};
