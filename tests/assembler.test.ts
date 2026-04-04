import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { assembleRules } from '../src/core/assembler/index.js';

describe('Context Assembler', () => {
  const TEST_DIR = path.join(process.cwd(), '.test-aictx-cache');

  beforeEach(async () => {
    // 准备测试用的 mock markdown 文件
    await fs.ensureDir(TEST_DIR);
    
    // 1. 包含 frontend tag 的规则
    await fs.writeFile(path.join(TEST_DIR, 'rule-frontend.md'), `---
tags:
  - frontend
entities:
  - Button
---
# Frontend Rule
This is a frontend rule.
`);

    // 2. 包含 backend tag 的规则
    await fs.writeFile(path.join(TEST_DIR, 'rule-backend.md'), `---
tags:
  - backend
---
# Backend Rule
This is a backend rule.
`);

    // 3. 包含 common tag 的全局规则
    await fs.writeFile(path.join(TEST_DIR, 'rule-common.md'), `---
tags:
  - common
---
# Common Rule
This is a global common rule.
`);

    // 4. 无 tag 的规则 (默认匹配)
    await fs.writeFile(path.join(TEST_DIR, 'rule-notag.md'), `# No Tag Rule
This rule has no tags and should be matched by default.
`);
  });

  afterEach(async () => {
    // 清理测试目录
    await fs.remove(TEST_DIR);
  });

  it('should assemble all rules if project tags are empty', async () => {
    const result = await assembleRules(TEST_DIR, []);
    
    expect(result.stats.totalScanned).toBe(4);
    expect(result.stats.matchedRules).toBe(4);
    expect(result.stats.ignoredRules).toBe(0);
    expect(result.rules.length).toBe(4);
  });

  it('should filter rules based on project tags (frontend)', async () => {
    const result = await assembleRules(TEST_DIR, ['frontend']);
    
    expect(result.stats.totalScanned).toBe(4);
    // 应该匹配: frontend, common, notag
    // 应该忽略: backend
    expect(result.stats.matchedRules).toBe(3);
    expect(result.stats.ignoredRules).toBe(1);
    
    const matchedFilenames = result.rules.map(r => r.filename);
    expect(matchedFilenames).toContain('rule-frontend.md');
    expect(matchedFilenames).toContain('rule-common.md');
    expect(matchedFilenames).toContain('rule-notag.md');
    expect(matchedFilenames).not.toContain('rule-backend.md');
  });

  it('should correctly parse frontmatter metadata', async () => {
    const result = await assembleRules(TEST_DIR, ['frontend']);
    const frontendRule = result.rules.find(r => r.filename === 'rule-frontend.md');
    
    expect(frontendRule).toBeDefined();
    expect(frontendRule?.tags).toEqual(['frontend']);
    // 内容中不应剥离 frontmatter，因为 IDE 规则需要完整上下文
    expect(frontendRule?.content).toContain('tags:');
    expect(frontendRule?.content).toContain('# Frontend Rule');
  });

  it('should calculate tokens roughly', async () => {
    const result = await assembleRules(TEST_DIR, []);
    expect(result.stats.matchedTokens).toBeGreaterThan(0);
    // rule-notag.md 长度约 75，token 估算约 113
    const notagRule = result.rules.find(r => r.filename === 'rule-notag.md');
    expect(notagRule?.tokens).toBeGreaterThan(50);
  });
});
