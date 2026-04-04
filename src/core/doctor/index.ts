import fs from 'fs-extra';
import path from 'path';
import { glob } from 'tinyglobby';
import crypto from 'crypto';

export interface DriftIssue {
  ide: string;
  file: string;
  reason: 'missing' | 'modified';
}

function calculateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function diagnoseDrift(cwd: string, cacheDir: string, ides: string[]): Promise<DriftIssue[]> {
  const issues: DriftIssue[] = [];
  
  if (!(await fs.pathExists(cacheDir))) {
    throw new Error('未找到缓存目录，请先执行 `aictx sync`。');
  }

  const sourceFiles = await glob('**/*.md', { cwd: cacheDir, absolute: false });
  
  // 计算源文件的 Hash
  const sourceHashes = new Map<string, string>();
  for (const relativePath of sourceFiles) {
    const fullPath = path.join(cacheDir, relativePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    sourceHashes.set(relativePath, calculateHash(content));
  }

  for (const ide of ides) {
    let targetDir = '';
    let extMap = (name: string) => name; // 默认同名

    if (ide === 'trae') targetDir = path.join(cwd, '.trae', 'rules');
    if (ide === 'cursor') {
      targetDir = path.join(cwd, '.cursor', 'rules');
      extMap = (name: string) => {
        const base = path.basename(name, path.extname(name));
        return `${base}.mdc`;
      };
    }
    if (ide === 'claude') targetDir = path.join(cwd, '.claude', 'rules');
    // Windsurf 是单文件，暂时跳过复杂的文件级 hash 比对
    if (ide === 'windsurf') continue;

    if (!(await fs.pathExists(targetDir))) {
      issues.push({ ide, file: targetDir, reason: 'missing' });
      continue;
    }

    for (const [relativeSrcPath, sourceHash] of sourceHashes.entries()) {
      // 简单模拟: 假设所有规则都应该被注入了 (忽略 tags 过滤的情况，这里做简化实现)
      const targetFileName = extMap(relativeSrcPath);
      const targetFullPath = path.join(targetDir, targetFileName);

      if (!(await fs.pathExists(targetFullPath))) {
        // 如果文件不存在，可能是被 tags 过滤了，这里不作为 missing 报错（在高级实现中，需要持久化 sync 时的 manifest）
        continue;
      }

      const targetContent = await fs.readFile(targetFullPath, 'utf-8');
      
      // Cursor 的 .mdc 有额外的 frontmatter 包装，需做内容包含判定而不是绝对 hash
      if (ide === 'cursor') {
         if (!targetContent.includes(await fs.readFile(path.join(cacheDir, relativeSrcPath), 'utf-8'))) {
           issues.push({ ide, file: targetFileName, reason: 'modified' });
         }
      } else {
         if (calculateHash(targetContent) !== sourceHash) {
           issues.push({ ide, file: targetFileName, reason: 'modified' });
         }
      }
    }
  }

  return issues;
}
