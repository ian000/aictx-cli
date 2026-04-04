import fs from 'fs-extra';
import path from 'path';
import type { AssembleResult } from '../assembler/index.js';

export abstract class IdeAdapter {
  /**
   * 抽象方法：将组装好的规则注入到目标 IDE 的特定目录中
   * @param cwd 项目根目录
   * @param result 组装器返回的结果
   */
  abstract inject(cwd: string, result: AssembleResult): Promise<void>;

  /**
   * 辅助方法：将内容写入目标文件
   */
  protected async writeRule(targetPath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content, 'utf-8');
  }

  // 默认情况下不再粗暴清空整个目录，因为可能会误删用户原有的自定义规则
  // 相反，我们只追踪并覆盖 aictx 生成的文件
}

export class TraeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    const rulesDir = path.join(cwd, '.trae', 'rules');

    for (const rule of result.rules) {
      const targetPath = path.join(rulesDir, `aictx-${rule.filename}`);
      await this.writeRule(targetPath, rule.content);
    }
  }
}

export class CursorAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    const rulesDir = path.join(cwd, '.cursor', 'rules');

    for (const rule of result.rules) {
      // Cursor 的规则通常推荐使用 .mdc 后缀，这里进行转换
      const baseName = path.basename(rule.filename, path.extname(rule.filename));
      const targetPath = path.join(rulesDir, `aictx-${baseName}.mdc`);
      
      // Cursor 规则支持 glob 匹配前缀
      const cursorContent = `---\ndescription: ${baseName}\nglobs: *\n---\n\n${rule.content}`;
      await this.writeRule(targetPath, cursorContent);
    }
  }
}

export class ClaudeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    // Claude Code 倾向于使用 .clauderc 或者直接放在 .claude/rules/ 下
    const rulesDir = path.join(cwd, '.claude', 'rules');

    for (const rule of result.rules) {
      const targetPath = path.join(rulesDir, `aictx-${rule.filename}`);
      await this.writeRule(targetPath, rule.content);
    }
  }
}

export class WindsurfAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    // Windsurf 通常使用 .windsurfrules 文件（单文件模式）
    const targetPath = path.join(cwd, '.windsurfrules');
    
    let combinedContent = '# aictx generated rules for Windsurf\n\n';
    for (const rule of result.rules) {
      combinedContent += `\n\n## [${rule.filename}]\n\n${rule.content}`;
    }
    
    await this.writeRule(targetPath, combinedContent);
  }
}
