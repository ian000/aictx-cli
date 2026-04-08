import { ConfigParser } from '../config/index.js';
import { fetchRules } from '../core/fetcher/index.js';
import { assembleRules } from '../core/assembler/index.js';
import { TraeAdapter, CursorAdapter, WindsurfAdapter, ClaudeAdapter } from '../core/injector/index.js';
import { consola } from 'consola';
import pc from 'picocolors';
import path from 'path';
import fs from 'fs-extra';

const adapters: Record<string, any> = {
  trae: new TraeAdapter(),
  cursor: new CursorAdapter(),
  windsurf: new WindsurfAdapter(),
  claude: new ClaudeAdapter()
};

export const syncCommand = (cli: any) => {
  cli.command('sync', '同步并组装 AI 上下文规则')
    .action(async () => {
      try {
        const parser = new ConfigParser();
        const config = await parser.read();
        
        const cwd = process.cwd();
        // 确保 cacheDir 存在于项目根目录下
        const cacheDir = path.join(cwd, '.aictx-cache');
        
        // 1. Fetch
        if (!config.repository || config.repository.trim() === '') {
          consola.start('正在释放 aictx 内置防腐与架构规则 (Builtin Templates)...');
        } else {
          consola.start(`正在从远程 Meta-Repo 同步规则: ${config.repository}`);
        }
        await fetchRules(config.repository, cacheDir);

        // 2. Assemble
        consola.start('正在动态组装并过滤上下文 (Context Assembler)...');
        const result = await assembleRules(cacheDir, config.tags);
        
        if (result.rules.length === 0) {
          consola.warn('未找到匹配的规则，可能是 Tags 过滤过严，或者规则仓库为空。');
          console.log('\n💡 ' + pc.yellow('未找到专属业务红线 (No Domain Rules Found)'));
          console.log(pc.gray(`我们发现您当前的 aictx.json 配置了 tags: [${config.tags.join(', ')}]，但在规则仓库中并未匹配到对应的业务架构文档。`));
          console.log('👇 ' + pc.cyan('解决建议：'));
          console.log(`请在您的 AI IDE (如 Trae) 对话框中输入：${pc.green('为当前项目生成新的业务规则脚手架')}`);
          console.log('AI 将自动调用内置的 `aictx-biz-scaffolder` 技能帮您初始化。');
          return;
        }

        consola.success(`组装完成: 命中 ${result.stats.matchedRules} 个规则模块`);

        if (result.stats.matchedTokens > 12000) {
          consola.warn(
            pc.yellow(`⚠️ 当前上下文约 ${result.stats.matchedTokens} Tokens，存在 Context Bloat 风险，建议裁剪 Tags！`)
          );
        }

        // 3. Inject
        consola.start(`正在通过适配器注入至目标 IDE: ${config.ides.join(', ')}...`);
        for (const ide of config.ides) {
          const adapter = adapters[ide];
          if (adapter) {
            await adapter.inject(cwd, result);
            consola.success(`已成功注入至 ${ide} 环境。`);
          } else {
            consola.warn(`未找到对应 ${ide} 的注入适配器。`);
          }
        }

        // 检查是否有专属业务规则
        const projectName = path.basename(cwd);
        const hasDomainRules = result.rules.some(r => r.name && r.name.includes(projectName));
        
        // 我们将是否包含 domain rule 的状态写入到一个临时文件里，供外层 onboard 读取
        const statusPath = path.resolve(cwd, '.aictx-sync-status.json');
        await fs.writeJson(statusPath, { hasDomainRules, projectName });

        // 4. Value Dashboard (Value Perception)
        console.log('\n======================================================================');
        console.log(`${pc.green('✨ 同步与组装完成！')}\n`);
        console.log(`🛡️ 拦截无关规则数: ${pc.yellow(result.stats.ignoredRules.toString())} 份`);
        console.log(`💰 节约 Token 预估: ${pc.yellow('~' + result.stats.ignoredTokens.toString())} Tokens`);
        console.log(`✅ 实际注入 Token数: ${pc.cyan('~' + result.stats.matchedTokens.toString())} Tokens`);
        console.log(`🔗 核心规范版本: ${pc.cyan('v1.0.0')}`);
        console.log('======================================================================\n');

      } catch (error: any) {
        consola.error(pc.red(`❌ 同步失败: ${error.message}`));
        process.exit(1);
      }
    });
};
