import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'tinyglobby';
import { countTokens } from '../../utils/token.js';
import { consola } from 'consola';

export interface AssembleResult {
  rules: {
    filename: string;
    content: string;
    tokens: number;
    tags: string[];
  }[];
  stats: {
    totalScanned: number;
    matchedRules: number;
    ignoredRules: number;
    matchedTokens: number;
    ignoredTokens: number;
  };
}

export async function assembleRules(sourceDir: string, projectTags: string[]): Promise<AssembleResult> {
  const result: AssembleResult = {
    rules: [],
    stats: {
      totalScanned: 0,
      matchedRules: 0,
      ignoredRules: 0,
      matchedTokens: 0,
      ignoredTokens: 0
    }
  };

  const mdFiles = await glob('**/*.md', { cwd: sourceDir, absolute: true });
  result.stats.totalScanned = mdFiles.length;

  for (const filePath of mdFiles) {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);
    const fileTags: string[] = parsed.data.tags || [];
    const contentTokens = countTokens(rawContent);

    // 如果未配置 tags，或者项目 tags 和 规则 tags 有交集，或者该规则是全局的 (tags: ["common" | "global"])
    const isMatched = 
      projectTags.length === 0 || 
      fileTags.length === 0 || 
      fileTags.some(tag => projectTags.includes(tag) || tag === 'common' || tag === 'global');

    if (isMatched) {
      result.rules.push({
        filename: path.basename(filePath),
        content: rawContent,
        tokens: contentTokens,
        tags: fileTags
      });
      result.stats.matchedRules++;
      result.stats.matchedTokens += contentTokens;
    } else {
      result.stats.ignoredRules++;
      result.stats.ignoredTokens += contentTokens;
    }
  }

  return result;
}
