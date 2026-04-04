import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { consola } from 'consola';
import pc from 'picocolors';
import { estimateTokens } from '../../utils/token.js';

/**
 * 组装后的一条领域/底座规则
 */
export interface AssembledRule {
  filename: string;
  content: string; // 完整文本，包括 YAML 头部或清理后的 Markdown
  tags: string[];
  tokens: number;
}

/**
 * 上下文拦截与命中统计数据
 */
export interface AssembleStats {
  matchedCount: number;
  ignoredCount: number;
  matchedTokens: number;
  ignoredTokens: number;
}

/**
 * 遍历并收集目录下所有的 Markdown 文件 (递归)
 */
async function collectMarkdownFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await collectMarkdownFiles(fullPath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * 解析并组装项目所需的规则
 * 核心逻辑：基于 Markdown 的 tags 和项目的 requiredTags 进行交集匹配
 */
export async function assembleRules(cacheDir: string, requiredTags: string[]): Promise<{ rules: AssembledRule[], stats: AssembleStats }> {
  const rules: AssembledRule[] = [];
  const stats: AssembleStats = {
    matchedCount: 0,
    ignoredCount: 0,
    matchedTokens: 0,
    ignoredTokens: 0
  };

  const mdFiles = await collectMarkdownFiles(cacheDir);

  for (const file of mdFiles) {
    const rawContent = await fs.readFile(file, 'utf-8');
    
    // 使用 gray-matter 解析 Frontmatter
    const parsed = matter(rawContent);
    const data = parsed.data || {};
    const fileTags: string[] = Array.isArray(data.tags) ? data.tags : [];
    const alwaysApply: boolean = data.alwaysApply === true;

    // 估算单个文件的 Token 数
    const fileTokens = estimateTokens(rawContent);

    // 判断逻辑：
    // 1. 如果规则声明了 alwaysApply 为 true，则强制挂载 (如底层代码风格规范)
    // 2. 如果项目 requiredTags 为空 (不过滤，全部加载)
    // 3. 如果项目 requiredTags 和规则自带的 tags 存在交集
    const isMatch = alwaysApply || requiredTags.length === 0 || requiredTags.some(t => fileTags.includes(t));

    if (isMatch) {
      stats.matchedCount++;
      stats.matchedTokens += fileTokens;
      rules.push({
        filename: path.basename(file), // 取出基础文件名
        content: rawContent, // 暂且保留完整的 YAML 和文本，供后续适配器修改
        tags: fileTags,
        tokens: fileTokens
      });
    } else {
      stats.ignoredCount++;
      stats.ignoredTokens += fileTokens;
    }
  }

  return { rules, stats };
}
