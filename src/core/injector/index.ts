import fs from 'fs-extra';
import path from 'path';
import type { AssembleResult } from '../assembler/index.js';

export abstract class IdeAdapter {
  abstract inject(cwd: string, result: AssembleResult): Promise<void>;

  protected async writeRule(targetPath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content, 'utf-8');
  }

<<<<<<< HEAD
  // 默认情况下不再粗暴清空整个目录，因为可能会误删用户原有的自定义规则
  // 相反，我们只追踪并覆盖 aictx 生成的文件
=======
  protected async clearDir(targetDir: string): Promise<void> {
    if (await fs.pathExists(targetDir)) {
      await fs.emptyDir(targetDir);
    }
  }
>>>>>>> f809bde (feat(i18n): add built-in multi-language support (English and Chinese))
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
      const baseName = path.basename(rule.filename, path.extname(rule.filename));
<<<<<<< HEAD
      const targetPath = path.join(rulesDir, `aictx-${baseName}.mdc`);
      
      // Cursor 规则支持 glob 匹配前缀
=======
      const targetPath = path.join(rulesDir, `${baseName}.mdc`);
>>>>>>> f809bde (feat(i18n): add built-in multi-language support (English and Chinese))
      const cursorContent = `---\ndescription: ${baseName}\nglobs: *\n---\n\n${rule.content}`;
      await this.writeRule(targetPath, cursorContent);
    }
  }
}

export class ClaudeAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    const rulesDir = path.join(cwd, '.claude', 'rules');

    for (const rule of result.rules) {
      const targetPath = path.join(rulesDir, `aictx-${rule.filename}`);
      await this.writeRule(targetPath, rule.content);
    }
  }
}

export class WindsurfAdapter extends IdeAdapter {
  async inject(cwd: string, result: AssembleResult): Promise<void> {
    const targetPath = path.join(cwd, '.windsurfrules');
    let combinedContent = '# aictx generated rules for Windsurf\n\n';
    for (const rule of result.rules) {
      combinedContent += `\n\n## [${rule.filename}]\n\n${rule.content}`;
    }
    await this.writeRule(targetPath, combinedContent);
  }
}

