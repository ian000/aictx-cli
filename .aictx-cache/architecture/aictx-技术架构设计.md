---
tags:
  - aictx
  - 技术架构
aliases:
  - [aictx 技术架构设计, Architecture]
entities:
  - [ContextAssembler, Fetcher, Injector]
roles:
  - [Developer]
---
# aictx 技术架构设计 (Architecture)

> **设计准则**: 极速冷启动、零环境侵入、跨平台兼容、终端交互优雅。

## 1. 技术栈选型 (Tech Stack)
- **开发语言**: `TypeScript` (强类型，Node 生态契合度最高)。
- **CLI 框架**: `cac` (极轻量级，性能远优于 commander，适合 DevTool)。
- **交互与 UI**: `@clack/prompts` (无感知、现代化的终端交互组件) + `picocolors` (终端着色) + `consola` (日志分级)。
- **文件与解析**: 
  - `fs-extra` (增强型文件系统操作)。
  - `gray-matter` (高效解析 Markdown 的 YAML Frontmatter)。
  - `tiktoken` / 字符估算算法 (用于快速预估 Token 消耗，防止 Context Bloat)。
- **构建与打包**: `tsup` (基于 esbuild，零配置打出极致压缩的单文件二进制执行包)。
- **包管理**: `pnpm` (支持 Workspace，为后续重构 Monorepo 铺路)。

## 2. 核心命令与无感触发机制 (Invisible CLI)

> **设计哲学：无感化 (Invisible CLI)**
> 为了降低开发者的认知负担，aictx 的设计目标是“尽量不让人类主动敲命令”。绝大多数命令应由 AI 助手在工作流中自动调用，或通过 Git Hooks/NPM 脚本静默触发。人类只需在遇到冲突时介入。

### 2.1 人类主动执行 (Human-Triggered)
*这类命令通常只在项目初始化或开发者好奇时执行一次。*
- `aictx init`: 智能初始化入口 (Smart Gateway)。执行时会弹出交互式向导，询问用户当前是“绿地项目(新)”还是“棕地项目(老)”：
  - **分支 A (新项目)**: 生成基础 `aictx.json` 和空的 MOC 路由表模板（植入锚点）。
  - **分支 B (存量老项目)**: 自动触发内部的 `onboard` (逆向工程) 子流程。**吸收 graphify 思想，采用“零大模型、纯本地确定性图谱”的终极接管方案：**
    1. **静态结构探测 (0 Token)**: 极速解析 `package.json`、目录树、数据库 Schema 等结构化元数据。
    2. **纯本地确定性 AST 解析 (Zero LLM/Zero VRAM)**: 检查并静默调用 `graphify` 引擎。利用其内置的 Tree-sitter 等确定性解析器遍历业务模块。极速提取出类的结构、函数出入参、API 路由签名、调用图 (Call Graph) 及注释，生成拓扑 JSON 图谱与审查报告。
    3. **知识图谱格式化 (Data Transform)**: aictx-cli 充当统筹转换器。直接读取生成的 `graph.json`，从中提炼出 God Nodes (神级中枢节点)，并结合 `GRAPH_REPORT.md`，用纯 TypeScript 逻辑拼装成带有 aictx 规范的 YAML Frontmatter 的原子化 Markdown 规则文档。
    4. **固化为 MOC 知识库**: 将转换后的系统架构红线，落盘至 `documents/architecture/system-graph.md`。实现 100% 覆盖率、零 Token 消耗、零算力门槛、绝对数据不出局的老代码无痛接管。
- `aictx info`: 指标数据展示命令。在终端渲染图表，展示项目从接入以来节省的 Token 数量、规则更新次数以及核心防腐数据。（**按需查看价值面板**）

### 2.2 AI 助手自动触发 (AI-Driven)
*通过在 IDE (如 Trae) 的 System Prompt 中注入规则，强制 AI 在执行特定任务时调用这些命令，人类完全无需记忆。*
- `aictx plan [feature]`: 工作流意图拦截。AI 在接到开发需求后、写代码前**自动调用**，生成临时变更意向书与执行清单，并暂停等待人类 Review。
- `aictx apply`: 工作流执行与防腐同步。人类确认 `plan` 后，AI **自动调用**执行代码变更，并强制固化更新 Obsidian RAG 知识库，确保 SSOT。
- `aictx index`: MOC 路由编译。当 AI 增删改了 `documents/` 下的 Markdown 文件后，**自动调用**以重构双向链接路由表。

### 2.3 生命周期/钩子自动触发 (Hook-Driven)
*通过工程化配置与现有开发生命周期绑定。*
- `aictx sync`: 核心组装命令。触发状态机，拉取、组装并注入规则到本地 IDE 目录。（**推荐绑定 `package.json` 的 `postinstall` 钩子，或 IDE 启动钩子**）
- `aictx doctor`: 诊断命令。检查本地规则是否发生 Drift (漂移/被篡改) 及 Token 消耗预估。（**推荐绑定 Git `pre-commit` 钩子**）
- `aictx resolve`: 冲突消解命令。提供终端交互向导，引导团队合并或覆盖冲突的业务红线。（**仅当 `sync` 或 `doctor` 抛出冲突错误时，系统提示人类执行**）

## 3. 状态机流转设计 (State Machine)
整个 `sync` 命令遵循严格的 6 步生命周期：
1. **Init**: 读取终端上下文，初始化日志和全局错误捕获。
2. **Resolve**: 定位并解析 `aictx.json`，构建规则依赖图谱。
3. **Fetch**: 从 Git/HTTP 或本地路径并行拉取 Rule 和 Skill 资产至 `~/.aictx-cache`。
4. **Assemble**: 解析拉取到的 Markdown Frontmatter，依据 Tag 过滤掉不需要的规则（避免 Context Bloat）。
5. **Inject**: 根据配置的适配器矩阵 (TraeAdapter, CursorAdapter, AntigravityAdapter, ClaudeAdapter 等)，将规则文件平铺覆写至目标项目的一个或多个对应目录。自动将组装后的 Rule 对象转换为对应 IDE 的目录结构（例如同一份 Rule 同步为 `.trae/rules/*.md`，并映射为 Claude Code 的 `.clauderc` 等）。
6. **Report**: 打印终端高维日志，展示同步变更树 (Add/Update/Delete) 及 Token 预警，并附带本次同步创造的“价值感知”摘要（例如：“本次组装为您排除了 32 个无关规则，节省了约 45,000 Tokens”）。

## 4. 目录结构规范 (Directory Structure)
为了保障代码的扩展性和防腐性，项目源码采用如下分层架构：
```text
src/
├── bin/           # CLI 执行入口 (cac 实例)
├── commands/      # 指令逻辑 (init, sync, doctor)
├── core/          # 核心引擎
│   ├── fetcher/   # 多协议拉取器 (Git, Local)
│   ├── assembler/ # 上下文组装器 (处理 gray-matter 解析和规则合并)
│   ├── resolver/  # 冲突消解引擎 (处理 Entities/Tags 交集计算与引导)
│   └── injector/  # 跨 IDE 适配器矩阵 (Trae, Cursor, Antigravity, Claude 策略模式写入)
├── config/        # 配置文件解析与校验 (Schema Validation)
├── utils/         # 终端 UI、日志、文件操作基建
└── index.ts       # 统一导出
```

## 5. 发布与分发 (CI/CD)
- **发布渠道**: 编译后作为独立包发布至 `npm Registry`。
- **自动化流水线**: 采用 GitHub Actions 结合 Changesets 实现全自动语义化发版和 Changelog 生成。
- **执行方式**: 
  - 开发者通过 `npx aictx init` 免安装执行。
  - 项目配置 `package.json` 中的 `scripts: { "postinstall": "aictx sync" }` 实现静默防腐同步。