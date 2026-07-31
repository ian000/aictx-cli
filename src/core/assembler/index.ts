import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'tinyglobby';
import { countTokens } from '../../utils/token.js';
import { consola } from 'consola';

export interface AssembleResult {
  rules: {
    filename: string;
    sourcePath: string;
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

function normalizeRuleSourcePath(filePath: string, sourceDir: string): string {
  return path.relative(sourceDir, filePath).split(path.sep).join('/');
}

function toSafeRuleFilename(sourcePath: string): string {
  return sourcePath
    .split(/[\\/]+/)
    .filter(Boolean)
    .join('__');
}

function parseTags(rawTags: unknown, sourcePath: string): string[] {
  if (rawTags === undefined) return [];
  if (!Array.isArray(rawTags) || rawTags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`规则 ${sourcePath} 的 tags 必须是字符串数组。`);
  }
  return rawTags;
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
  const seenOutputNames = new Map<string, string>();

  for (const filePath of mdFiles) {
    const sourcePath = normalizeRuleSourcePath(filePath, sourceDir);
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);
    const fileTags = parseTags(parsed.data.tags, sourcePath);
    const contentTokens = countTokens(rawContent);

    // 严格过滤机制：
    // 1. 如果规则文件没有任何 tags，我们认为它不是一个合格的 aictx 规则文件（比如 README），直接忽略。
    // 2. 如果文件有 tags，检查它是否包含 'common' / 'global'，或者与项目 tags 有交集。
    const isMatched = 
      fileTags.length > 0 && 
      (projectTags.length === 0 || fileTags.some(tag => projectTags.includes(tag) || tag === 'common' || tag === 'global'));

    if (isMatched) {
      const filename = toSafeRuleFilename(sourcePath);
      const previousSource = seenOutputNames.get(filename);
      if (previousSource) {
        throw new Error(`规则输出文件名冲突: ${previousSource} 与 ${sourcePath} 都会生成 ${filename}`);
      }
      seenOutputNames.set(filename, sourcePath);

      result.rules.push({
        filename,
        sourcePath,
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
