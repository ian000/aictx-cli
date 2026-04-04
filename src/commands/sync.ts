import { loadConfig } from '../config/index.js';
import { fetchRules } from '../core/fetcher/index.js';
import { assembleRules } from '../core/assembler/index.js';
import { adapters } from '../core/injector/index.js';
import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';

export async function syncCommand() {
  const config = await loadConfig();
  if (!config) process.exit(1);

  try {
    const cwd = process.cwd();
    const cacheDir = config.cacheDir || path.join(cwd, '.aictx-cache');

    // 1. Fetch
    await fetchRules(config.metaRepo, cacheDir);

    // 2. Assemble
    consola.start('正在动态组装并过滤上下文 (Context Assembler)...');
    const { rules, stats } = await assembleRules(cacheDir, config.tags);
    consola.success(`组装完成: 命中 ${rules.length} 个规则`);

    if (stats.matchedTokens > 12000) {
      consola.warn(
        pc.yellow(`⚠️ 当前上下文约 ${stats.matchedTokens} Tokens，存在 Context Bloat 风险，建议裁剪 Tags！`)
      );
    }

    // 3. Inject
    consola.start(`正在通过适配器注入至目标 IDE: ${config.ide.join(', ')}...`);
    for (const ide of config.ide) {
      const adapter = adapters[ide];
      if (adapter) {
        await adapter.inject(rules, stats, cwd);
        consola.success(`${ide} 规则注入成功`);
      }
    }

    // 4. Report
    consola.box({
      title: 'aictx Value Dashboard',
      message:
        `${pc.green('✨ 同步完成！')}\n\n` +
        `🛡️ 拦截无关规则数: ${pc.yellow(stats.ignoredCount)} 次\n` +
        `💰 节约 Token 预估: ${pc.yellow('~' + stats.ignoredTokens)} Tokens\n` +
        `✅ 实际注入 Token数: ${pc.cyan('~' + stats.matchedTokens)} Tokens\n` +
        `🔗 核心规范版本: ${pc.cyan('v2.1.0')}`
    });

  } catch (err: any) {
    consola.error(pc.red(`❌ 同步失败: ${err.message}`));
    process.exit(1);
  }
}
