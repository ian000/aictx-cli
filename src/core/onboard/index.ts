import { consola } from 'consola';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { globby } from 'globby';
import { execa } from 'execa';
import { cliUX } from '../../utils/cli-ux.js';
import { fileURLToPath } from 'url';
import { ConfigParser } from '../../config/index.js';
import { fetchRules } from '../fetcher/index.js';
import { assembleRules } from '../assembler/index.js';
import { TraeAdapter, CursorAdapter, WindsurfAdapter, ClaudeAdapter } from '../injector/index.js';

export interface OnboardOptions {
  cwd: string;
  yes?: boolean;
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
    await this.executeASTExtraction(staticInfo);
  }

  private async executeASTExtraction(staticInfo: StaticInfo) {
    const s = cliUX.createSpinner();
    
    // 我们不再强制全局 pip install graphifyy
    // 因为 aictx graph 内部已经实现了黑盒代理调用
    
    // Map 阶段：AST 纯本地提取 (Zero LLM)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    consola.info(`\n${pc.bgBlue(' AST EXTRACTION PHASE ')} 开始调用 Graphify 进行全项目 AST 解析...`);
    const sAst = cliUX.createSpinner();
    sAst.start('正在生成 Call Graph 与实体拓扑图 (Zero LLM/Zero VRAM)...');
    
    const startTime = Date.now();
    try {
      // 通过 graphify-go 内部接口去执行 AST
      const { graphify } = await import('graphify-go');
      // 注意：graphify-go 命令的参数是 `-dir` 和 `-out`
      consola.start('正在启动 Graphify-Go 纯本地引擎进行代码逆向...');
      const output = await graphify(['-dir', this.options.cwd, '-out', path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out')]);
      consola.success('Graphify-Go 逆向分析完成！');
    } catch (e: any) {
      sAst.stop('提取失败');
      consola.error('Graphify AST 图谱生成失败', e.message);
      return;
    }

    const graphJsonPath = path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/graph.json');
    const reportPath = path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/system-graph.md');
    
    if (!fs.existsSync(graphJsonPath) || !fs.existsSync(reportPath)) {
      sAst.stop('文件未生成');
      consola.error(`未能找到生成的知识图谱或审查报告：${graphJsonPath}`);
      return;
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
    
    // 4. 生成 Trae Skill 供 IDE 丝滑调用 Graphify
    sTrans.message('正在为 Trae IDE 安装内置技能 (Skills)...');
    
    // Copy built-in templates first
    const __filenamePath = fileURLToPath(import.meta.url);
    const __dirnamePath = path.dirname(__filenamePath);
    
    // Note: 兼容开发环境和 tsup 打包后的环境
    // 由于 templates 已经移动到 src/templates，并且构建时被 copy 到了 dist/templates
    // 开发环境: __dirnamePath 是 src/core/onboard -> templates 在 ../../templates
    // 打包环境: __dirnamePath 是 dist -> templates 在 ./templates
    const isDist = __dirnamePath.endsWith('dist');
    const templatesDir = path.resolve(__dirnamePath, isDist ? 'templates/.trae/skills' : '../../templates/.trae/skills');
    const targetTraeDir = path.resolve(this.options.cwd, '.trae/skills');
    
    if (fs.existsSync(templatesDir)) {
      await fs.copy(templatesDir, targetTraeDir, { overwrite: false });
    } else {
      consola.warn(`未找到模板目录: ${templatesDir} (__dirnamePath: ${__dirnamePath})`);
    }

    const skillDir = path.resolve(this.options.cwd, '.trae/skills/aictx-graphify');
    await fs.ensureDir(skillDir);
    const skillContent = `---
name: "aictx-graphify"
description: "Query the local Graphify AST knowledge graph. Invoke IMMEDIATELY when the user asks about project architecture, dependencies, codebase structure, code connections, or module relationships."
---

# Graphify Knowledge Graph Assistant

This project has been onboarded with \`aictx\` and has a local AST knowledge graph generated by \`graphify-go\` at \`aictx-docs/architecture/graphify-out/graph.json\`.

## When to Use This Skill
- When you need to understand the relationships between different modules, classes, or functions.
- When answering architecture or codebase questions.
- To find "God Nodes" (highly connected components) or "Surprising Connections".

## How to Use
You can query the knowledge graph using the \`aictx graph\` CLI tool via the \`RunCommand\` tool:

1. **Query the Graph:**
   \`\`\`bash
   aictx graph query "<your_question>"
   \`\`\`
   *(Example: \`aictx graph query "how does user authentication work?"\`)*

2. **DFS Query:**
   \`\`\`bash
   aictx graph query "<your_question>" --dfs
   \`\`\`

3. **Read the Report:**
   Read \`aictx-docs/architecture/system-graph.md\` or \`aictx-docs/architecture/graphify-out/system-graph.md\` for god nodes and community structure before searching raw files.

4. **Rebuild the Graph:**
   If you significantly modify code files in this session, run \`aictx graph . --no-viz\` to keep the graph current.
`;
    await fs.writeFile(path.resolve(skillDir, 'SKILL.md'), skillContent);

    sTrans.stop('知识库与 IDE Skill 转换生成完毕！');

    // 5. 自动补齐基础的 Context as Code 配置 (等同于 init + sync)
    const configPath = path.resolve(this.options.cwd, 'aictx.json');
    if (!fs.existsSync(configPath)) {
      const projectName = path.basename(this.options.cwd);
      const defaultConfig = {
        $schema: "https://unpkg.com/aictx/schema.json",
        version: "1.0",
        repository: "",
        ides: ["trae"],
        tags: ["backend", "frontend", "common", projectName],
        overrides: {}
      };
      await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    }
    
    // 强制执行一次 Sync (代替手动拷贝内置规则)
      sTrans.start('正在自动触发 aictx sync 拉取并释放规则...');
      try {
        const { execa } = await import('execa');
        await execa('npx', ['aictx', 'sync'], { 
          cwd: this.options.cwd,
          stdio: 'inherit' // 让 sync 的输出直接打印到控制台
        });
      } catch (e) {
        // 如果 npx 找不到全局 aictx，尝试直接调用当前代码编译出的二进制
        try {
          const { execa } = await import('execa');
          const cliPath = __dirnamePath.endsWith('dist') ? path.resolve(__dirnamePath, 'aictx.js') : path.resolve(__dirnamePath, '../aictx.js');
          await execa('node', [cliPath, 'sync'], {
            cwd: this.options.cwd,
            stdio: 'inherit'
          });
        } catch (e2) {
          console.error(pc.red(`自动 aictx sync 失败，请手动执行 \`aictx sync\`: ${(e2 as Error).message}`));
        }
      }
      sTrans.stop('自动 aictx sync 规则下发完成！');

    console.log('\n======================================================================');
    console.log(`🎉 基于纯本地 AST 图谱的逆向工程 (Onboarding) 成功完成！`);
    console.log(`✅ ${pc.cyan('aictx-docs/architecture/system-graph.md')}`);
    console.log(`✅ ${pc.cyan('.trae/skills/aictx-graphify/SKILL.md')} (已为 IDE 自动挂载 Graphify 技能)`);
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
    console.log(`🚀 【下一步行动】请复制以下提示词，交给你的 AI 助手 (如 Trae/Cursor)：`);
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

  /** 
   * 由于 pip 安装的 graphify 暂时仅是一个 Skill Wrapper (只支持 install/query)
   * 这里的备用函数用于模拟 `graphify .` 生成的数据结构，保证产品全链路可测试
   */
  private async fallbackMockGraphifyOutput() {
    await fs.ensureDir(path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out'));
      
    const mockGraphJson = {
      nodes: [
        { id: 'UserController', type: 'class', label: 'UserController', degree: 5, community: 1 },
        { id: 'AuthService', type: 'class', label: 'AuthService', degree: 8, community: 1 },
        { id: 'OrderRepository', type: 'class', label: 'OrderRepository', degree: 4, community: 2 },
        { id: 'PaymentGateway', type: 'class', label: 'PaymentGateway', degree: 2, community: 2 },
        { id: 'DatabaseConnection', type: 'class', label: 'DatabaseConnection', degree: 15, community: 0 }
      ],
      links: [
        { source: 'UserController', target: 'AuthService', label: 'calls' },
        { source: 'AuthService', target: 'DatabaseConnection', label: 'calls' }
      ]
    };
    
    const mockReport = `## Community 0
- 核心基础设施层，处理底层连接与通用工具。
## Community 1
- 用户与认证域，处理登录鉴权与用户资料。
## Community 2
- 交易域，处理订单状态机与支付网关对接。

**Surprising connections**:
- \`UserController\` 存在跨域直接调用 \`PaymentGateway\` 的隐患，建议重构通过 \`OrderService\` 代理。`;

    await fs.writeJson(path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/graph.json'), mockGraphJson);
    await fs.writeFile(path.resolve(this.options.cwd, 'aictx-docs/architecture/graphify-out/GRAPH_REPORT.md'), mockReport);
  }

  /** 读取文件头部 N 行以防 Token 超载 */
  private async readHeadLines(filePath: string, lineCount: number): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      return lines.slice(0, lineCount).join('\n');
    } catch {
      return '';
    }
  }

  private async sniffStaticInfo(): Promise<StaticInfo> {
    const pkgPath = path.resolve(this.options.cwd, 'package.json');
    let dependencies: string[] = [];
    
    if (fs.existsSync(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      // 提取核心框架特征
      const coreKeywords = ['react', 'vue', 'next', 'nuxt', 'express', 'nestjs', 'prisma', 'typeorm', 'tailwindcss'];
      dependencies = Object.keys(allDeps).filter(dep => 
        coreKeywords.some(keyword => dep.includes(keyword))
      );
    }

    const files = await globby(['src/**/*.{ts,tsx,js,jsx}', 'app/**/*.{ts,tsx,js,jsx}', 'lib/**/*.{ts,tsx,js,jsx}'], {
      cwd: this.options.cwd,
      ignore: ['node_modules', '**/*.test.*', '**/*.spec.*']
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

  private executeTier2Fallback(staticInfo: any) {
    console.log('\n======================================================================');
    console.log(`${pc.yellow('⚠️ 未挂载本地模型，已为您降级为 Tier 2 (IDE 引导模式)')}`);
    console.log('请复制以下 Prompt，粘贴到您的 Trae / Cursor / Claude Code 的聊天框中：\n');
    console.log(pc.dim('----------------------------------------------------------------------'));
    console.log(pc.green(`作为一名资深架构师，请帮我将当前项目逆向解构为 aictx 规范的 RAG 知识库。

项目基础信息：
- 核心技术栈：${staticInfo.dependencies.join(', ')}
- 业务规模：约 ${staticInfo.fileCount} 个文件

请执行以下任务：
1. 深度阅读当前仓库的 src 目录，提取出全局的：
   - 架构设计规范 (如文件命名、目录职责)
   - API 响应/错误码枚举约束
   - 核心数据库模型 (Schema) 与业务红线
2. 将以上信息，拆分为 3~5 个独立的 Markdown 文件。
3. 每个 Markdown 文件的开头，必须包含如下 YAML Frontmatter：
---
tags: [aictx, onboard]
aliases: [文档别名]
entities: [涉及的核心实体]
---
4. 将这些文件创建在项目根目录的 \`aictx-docs/\` 文件夹下，并按照 \`product/\`, \`architecture/\` 分类。`));
    console.log(pc.dim('----------------------------------------------------------------------'));
    console.log('\n当 IDE 为您生成完这些文档后，请在终端运行：');
    console.log(pc.cyan('aictx index') + ' 以生成 MOC 双向路由表，完成接管。');
    console.log('======================================================================\n');
    cliUX.outro('Context as Code - 降级策略执行完毕');
  }
}
