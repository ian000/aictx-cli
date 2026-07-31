import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { globby } from 'globby';
import { cliUX } from '../../utils/cli-ux.js';
import { analyzeWithGraphify } from '../../utils/graphify.js';
import { runCurrentAictxCommand } from '../../utils/self-cli.js';
import { ensureIdeWorkspaces, type SupportedIde } from '../ide/index.js';

export interface OnboardOptions {
  cwd: string;
  yes?: boolean;
  ides: SupportedIde[];
  analyze?: typeof analyzeWithGraphify;
  runCommand?: typeof runCurrentAictxCommand;
}

export interface StaticInfo {
  dependencies: string[];
  fileCount: number;
  hasPrisma: boolean;
  hasDocker: boolean;
}

export class OnboardEngine {
  private options: OnboardOptions;

  constructor(options: OnboardOptions) {
    this.options = options;
  }

  public async run() {
    cliUX.intro('🚀 开始存量项目逆向工程 (Brownfield Onboarding)');
    
    // Step 1: 静态结构探测 (0 Token)
    const s = cliUX.createSpinner();
    s.start('阶段 1/4: 正在进行静态结构探测 (Static Sniffing)...');
    const staticInfo = await this.sniffStaticInfo();
    s.stop(`探测完成: 发现 ${pc.cyan(staticInfo.dependencies.length)} 个核心依赖, ${pc.cyan(staticInfo.fileCount)} 个业务文件`);

    if (staticInfo.fileCount === 0) {
      throw new Error(
        '未找到 Graphify-Go 支持的源码。当前自动接管支持 JavaScript、TypeScript、Python 和 Go；请确认源码已检出，或等待对应语言解析器后再运行 `aictx init --onboard`。'
      );
    }

    // Step 2: 询问用户是否执行逆向接管
    let confirm = true;
    if (!this.options.yes) {
      confirm = await cliUX.askConfirm('是否立即启动基于 Graphify 的全量代码逆向接管 (Zero Token, Zero Model)?');
    }

    if (!confirm) {
      cliUX.outro('已取消接管。您随时可以再次运行 aictx init。');
      return;
    }

    consola.info('准备启动基于 AST 拓扑图谱的解析流程...');
    await this.executeASTExtraction();
  }

  private async executeASTExtraction() {
    // 我们不再强制全局 pip install graphifyy
    // 因为 aictx graph 内部已经实现了黑盒代理调用
    
    // Map 阶段：AST 纯本地提取 (Zero LLM)
    consola.info(`\n${pc.bgBlue(' AST EXTRACTION PHASE ')} 开始调用 Graphify 进行全项目 AST 解析...`);
    const sAst = cliUX.createSpinner();
    sAst.start('正在生成 Call Graph 与实体拓扑图 (Zero LLM/Zero VRAM)...');
    
    const startTime = Date.now();
    try {
      consola.start('正在启动 Graphify-Go 纯本地引擎进行代码逆向...');
      const analyze = this.options.analyze ?? analyzeWithGraphify;
      await analyze(
        this.options.cwd,
        path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out'),
        { cwd: this.options.cwd, stdio: 'inherit' }
      );
      consola.success('Graphify-Go 逆向分析完成！');
    } catch (e: any) {
      sAst.stop('提取失败');
      throw new Error(`Graphify AST 图谱生成失败: ${e.message}`);
    }

    const graphJsonPath = path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/graph.json');
    const reportPath = path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/system-graph.md');
    
    if (!fs.existsSync(graphJsonPath) || !fs.existsSync(reportPath)) {
      sAst.stop('文件未生成');
      throw new Error(`Graphify 执行结束但产物不完整，请检查 ${graphJsonPath} 和 ${reportPath}`);
    }

    const graphData = await fs.readJson(graphJsonPath);
    const nodesCount = graphData.nodes?.length || 0;
    const edgesCount = graphData.links?.length || 0;
    
    sAst.stop(`AST 图谱生成完毕！(耗时 ${((Date.now() - startTime) / 1000).toFixed(1)}s, 节点: ${nodesCount}, 边: ${edgesCount})`);

    // 3. Transform 阶段：将 Graphify 产物转换为 aictx 规范知识库
    consola.info(`\n${pc.bgGreen(' TRANSFORM PHASE ')} 正在将图谱转换为 aictx 规范文档...`);
    const sTrans = cliUX.createSpinner();
    sTrans.start('正在生成业务架构红线文档...');

    // 将 Graphify 生成的 GRAPH_REPORT.md 和核心节点信息拼装成 aictx 规范
    const rawReport = await fs.readFile(reportPath, 'utf-8');
    
    // 提炼高频实体 (神级节点) 作为 YAML 的 entities
    const godNodes = graphData.nodes
      ?.filter((n: any) => n.degree > 3 || n.type === 'class')
      .slice(0, 10)
      .map((n: any) => n.label || n.id) || [];

    const aictxMarkdown = `---
tags:
  - aictx
  - architecture
  - generated
aliases:
  - [系统架构图谱, System Graph]
entities:
  - [${godNodes.join(', ')}]
roles:
  - [AI Assistant]
---
# 系统架构拓扑审查 (System Architecture Report)

> **Context as Code 自动生成**: 本文档由 \`aictx onboard\` 底层调用 \`graphify-go\` 纯本地 AST 引擎生成，**全程未经过任何 LLM 幻觉处理**，代表了代码库最真实、最准确的物理依赖关系 (Single Source of Truth)。

## 核心业务节点 (God Nodes)
系统运行的核心中枢，这些组件被大量其他模块调用，修改时必须极其谨慎。
${godNodes.map(n => `- **${n}**`).join('\n')}

## 拓扑结构分析报告 (Topology Analysis)
${rawReport}

## 约束建议 (AI Instructions)
1. 在修改任何涉及上述 \`God Nodes\` 的代码前，必须优先查询调用链路。
2. 本项目的基础架构强依赖于上述分析报告中的 Community 聚类关系，禁止跨社区发生循环依赖。
`;

    // 写入最终生成的规范文档
    await fs.ensureDir(path.resolve(this.options.cwd, 'aictx-docs/architecture'));
    await fs.writeFile(path.resolve(this.options.cwd, 'aictx-docs/architecture/system-graph.md'), aictxMarkdown);
    
    const onboardIdes = this.options.ides;

    // 4. 生成 IDE Skills 供助手丝滑调用 Graphify
    sTrans.message(`正在为 ${onboardIdes.join(', ')} 安装内置技能 (Skills)...`);
    
    await ensureIdeWorkspaces(this.options.cwd, onboardIdes);

    sTrans.stop('知识库与 IDE Skill 转换生成完毕！');

    // 5. 自动补齐基础的 Context as Code 配置 (等同于 init + sync)
    const configPath = path.resolve(this.options.cwd, 'aictx.json');
    if (!fs.existsSync(configPath)) {
      const projectName = path.basename(this.options.cwd);
      const defaultConfig = {
        $schema: "https://unpkg.com/aictx/schema.json",
        version: "1.0",
        repository: "",
        ides: onboardIdes,
        tags: ["backend", "frontend", "common", projectName],
        overrides: {}
      };
      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    } else {
      const currentConfig = await fs.readJson(configPath);
      await fs.writeJson(configPath, { ...currentConfig, ides: onboardIdes }, { spaces: 2 });
    }
    
    // 强制执行一次 Sync (代替手动拷贝内置规则)
    sTrans.start('正在自动触发 aictx sync 拉取并释放规则...');
    try {
      const runCommand = this.options.runCommand ?? runCurrentAictxCommand;
      await runCommand(['sync'], this.options.cwd);
      sTrans.stop('自动 aictx sync 规则下发完成！');
    } catch (e) {
      sTrans.stop('自动 aictx sync 触发失败');
      throw new Error(`图谱已生成，但自动 aictx sync 失败: ${(e as Error).message}。请修复后运行 \`aictx sync\``);
    }

    console.log('\n======================================================================');
    console.log(`🎉 基于纯本地 AST 图谱的逆向工程 (Onboarding) 成功完成！`);
    console.log(`✅ ${pc.cyan('aictx-docs/architecture/system-graph.md')}`);
    if (onboardIdes.includes('trae')) {
      console.log(`✅ ${pc.cyan('.trae/skills/aictx-graphify/SKILL.md')} (已为 IDE 自动挂载 Graphify 技能)`);
    }
    if (onboardIdes.includes('codex')) {
      console.log(`✅ ${pc.cyan('.agents/skills/aictx-graphify/SKILL.md')} (已为 Codex 自动挂载 Graphify 技能)`);
      console.log(`✅ ${pc.cyan('AGENTS.md')} (已为 Codex 自动生成项目入口指令)`);
    }
    if (onboardIdes.includes('claude')) {
      console.log(`✅ ${pc.cyan('CLAUDE.md')} + ${pc.cyan('.claude/*')} (已为 Claude Code 初始化)`);
    }
    console.log(`全程零 Token 消耗、零云端 API 调用、绝对保护代码隐私！`);
    
    // 增加省 Token 科普与神级提示词
    console.log('\n💡 ' + pc.yellow('为什么这样做能省下 90% 的 Token 与大模型 API 费用？'));
    console.log(pc.gray('如果你直接让 AI 去阅读这个拥有成百上千个文件的老项目，不仅会立刻触发大模型上下文爆炸（Context Bloat）导致严重幻觉，还会一次性消耗掉几十万 Tokens。'));
    console.log(pc.gray('现在，aictx onboard 已经使用纯本地的引擎将十几万行的物理代码高度压缩成了一份千字左右的架构图谱（system-graph.md）。大模型只需要阅读这份高浓度“摘要”，就能精准推演出整个项目的架构与业务。'));
    
    // 读取 sync 留下的临时状态文件，决定最终的 Prompt 组装策略
    let hasDomainRules = true;
    let projectNameStr = path.basename(this.options.cwd);
    const statusPath = path.resolve(this.options.cwd, '.aictx-sync-status.json');
    if (fs.existsSync(statusPath)) {
      try {
        const status = await fs.readJson(statusPath);
        hasDomainRules = status.hasDomainRules;
        projectNameStr = status.projectName || projectNameStr;
        // 读取完后清理掉临时文件
        await fs.remove(statusPath);
      } catch (e) {}
    }

    console.log('\n======================================================================');
    console.log(`🚀 【下一步行动】请复制以下提示词，交给你的 AI 助手 (如 Trae/Cursor/Codex)：`);
    console.log('======================================================================\n');
    
    let finalPrompt = '';
    
    finalPrompt += pc.cyan(`💡 核心指令：请仔细阅读 \`aictx-docs/architecture/system-graph.md\` 中的 AST 架构图谱 (由于是物理压缩摘要，阅读它仅消耗极少量的 Token)。
基于其中的 God Nodes (核心节点) 与聚类结构，执行以下动作：

1. 帮我反推这个项目的商业逻辑与产品定位，在 \`aictx-docs/product/\` 下生成一份详实的 PRD 文档。
2. 帮我梳理目前的真实技术栈现状、模块依赖关系以及可能的技术债，在 \`aictx-docs/architecture/\` 下生成一份当前系统架构纪实文档。注意：必须真实反映现状，严禁随意虚构重构方案。`);

    if (!hasDomainRules) {
      finalPrompt += pc.yellow(`\n\n3. ⚠️ 业务红线初始化：我们发现你还没有当前项目的专属业务红线。请根据上述第1、2步中反推出的真实项目信息，调用内置的 \`aictx-biz-scaffolder\` 技能，为我生成 \`${projectNameStr}\` 项目的业务规则脚手架。注意：必须严格基于本项目的真实物理代码推演，绝不能凭空捏造或混入无关历史项目的记忆！`);
    }

    finalPrompt += pc.cyan(`\n\n4. 所有架构文档与脚手架撰写完成后，请帮我执行 \`aictx index\` 命令，更新项目的 MOC 路由表。`);

    console.log(finalPrompt);
    console.log('\n======================================================================\n');
  }

  private async sniffStaticInfo(): Promise<StaticInfo> {
    const pkgPath = path.resolve(this.options.cwd, 'package.json');
    let dependencies: string[] = [];
    
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = await fs.readJson(pkgPath);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        const coreKeywords = ['react', 'vue', 'next', 'nuxt', 'express', 'nestjs', 'prisma', 'typeorm', 'tailwindcss'];
        dependencies = Object.keys(allDeps).filter(dep =>
          coreKeywords.some(keyword => dep.includes(keyword))
        );
      } catch (error) {
        consola.warn(`package.json 无法解析，将跳过依赖识别并继续分析源码: ${(error as Error).message}`);
      }
    }

    const files = await globby(['**/*.{js,jsx,ts,tsx,py,go}'], {
      cwd: this.options.cwd,
      gitignore: true,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/vendor/**',
        '**/aictx-docs/architecture/graphify-out/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    });

    const hasPrisma = fs.existsSync(path.resolve(this.options.cwd, 'prisma/schema.prisma'));
    const hasDocker = fs.existsSync(path.resolve(this.options.cwd, 'Dockerfile'));

    return {
      dependencies: dependencies.length > 0 ? dependencies : ['unknown'],
      fileCount: files.length,
      hasPrisma,
      hasDocker
    };
  }
}
