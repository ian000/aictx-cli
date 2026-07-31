import fs from 'fs-extra';
import path from 'path';
import type { AssembleResult } from '../assembler/index.js';
import { getIdeRuleDir, getIdeRuleTargetPath, renderRuleForIde } from '../injector/index.js';
import { SUPPORTED_IDES, type SupportedIde } from '../ide/index.js';

export interface DriftIssue {
  ide: string;
  file: string;
  reason: 'missing' | 'modified' | 'stale';
}

export async function diagnoseDrift(
  cwd: string,
  result: AssembleResult,
  ides: string[]
): Promise<DriftIssue[]> {
  const issues: DriftIssue[] = [];

  for (const configuredIde of ides) {
    if (!SUPPORTED_IDES.includes(configuredIde as SupportedIde)) continue;
    const ide = configuredIde as SupportedIde;
    const expectedPaths = new Set(result.rules.map((rule) => getIdeRuleTargetPath(cwd, ide, rule.filename)));

    for (const rule of result.rules) {
      const targetPath = getIdeRuleTargetPath(cwd, ide, rule.filename);
      const displayPath = path.relative(cwd, targetPath);
      if (!(await fs.pathExists(targetPath))) {
        issues.push({ ide, file: displayPath, reason: 'missing' });
        continue;
      }

      const actual = await fs.readFile(targetPath, 'utf-8');
      const expected = renderRuleForIde(ide, rule.filename, rule.content);
      if (actual !== expected) {
        issues.push({ ide, file: displayPath, reason: 'modified' });
      }
    }

    const ruleDir = getIdeRuleDir(cwd, ide);
    if (!(await fs.pathExists(ruleDir))) continue;
    const existing = await fs.readdir(ruleDir);
    for (const entry of existing) {
      if (!entry.startsWith('aictx-')) continue;
      const targetPath = path.join(ruleDir, entry);
      const stat = await fs.stat(targetPath);
      if (stat.isFile() && !expectedPaths.has(targetPath)) {
        issues.push({ ide, file: path.relative(cwd, targetPath), reason: 'stale' });
      }
    }
  }

  return issues;
}
