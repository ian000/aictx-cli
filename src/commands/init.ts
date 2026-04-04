import * as p from '@clack/prompts';
import { saveConfig, AictxConfig, TargetIDE } from '../config/index.js';
import pc from 'picocolors';

export async function initCommand() {
  console.clear();
  p.intro(pc.bgCyan(pc.black(' aictx Init - 组织级 AI 上下文管理 ')));

  const project = await p.group(
    {
      metaRepo: () =>
        p.text({
          message: '中央 Meta 仓库地址 (Git URL 或本地绝对/相对路径)',
          placeholder: '../meta-repo',
          initialValue: '../meta-repo'
        }),
      tags: () =>
        p.text({
          message: '当前项目所需的规则标签 (用逗号分隔，如: frontend, payment)',
          placeholder: 'frontend, core',
          defaultValue: ''
        }),
      ide: () =>
        p.multiselect({
          message: '请选择需要注入的目标终端/IDE (多选)',
          options: [
            { value: 'trae', label: 'Trae (.trae/rules)' },
            { value: 'cursor', label: 'Cursor (.cursor/rules/*.mdc)' },
            { value: 'antigravity', label: 'Google Antigravity (.agents/skills)' },
            { value: 'claude', label: 'Claude Code (.claude/rules)' }
          ],
          required: true
        })
    },
    {
      onCancel: () => {
        p.cancel('操作已取消');
        process.exit(0);
      }
    }
  );

  const config: AictxConfig = {
    metaRepo: project.metaRepo,
    // 处理用户输入的 tags，去除空格和空项
    tags: project.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
    ide: project.ide as TargetIDE[]
  };

  await saveConfig(config);

  p.outro(pc.green('🎉 初始化完成！现在您可以运行 `npx aictx sync` 开始同步规范。'));
}
