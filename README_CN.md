<div align="center">
  <h1>aictx-cli 🧠</h1>
  <p><b>面向 AI 辅助开发与 Agent Runtime 的 Context as Code 基础设施</b></p>
  <p><i>Stop fighting the AI. Start engineering its context.</i></p>
</div>

<div align="center">

[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-orange.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/aictx-cli.svg)](https://www.npmjs.com/package/aictx-cli)
[![Build Status](https://github.com/kings2017/aictx-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/kings2017/aictx-cli/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

<p align="center">
  <a href="./README.md">English</a> |   <a href="./README_CN.md">简体中文</a>  
</p>

<br />

**aictx-cli** (AI Context CLI) 是面向 AI 辅助开发和团队内部 Agent Runtime 的 **Context as Code (CaC)** 基础设施。开发命令负责维护规则、文档、索引、图谱和 IDE 配置；Runtime 命令只读取版本化的上下文快照，为单次 Agent 任务准备上下文，不反向修改这些来源。

我们致力于为 AI 编程时代提供三大核心基础设施能力：
1. **🌍 跨设备与跨 IDE 同步**：无论是 Codex、Trae、Cursor、Windsurf 还是 OpenCode、Claude Code，一份架构规则 (Rules) 与本地技能 (Skills)，一键编译并动态注入所有终端，彻底终结“不同 AI 写出不同风格”的灾难。
2. **💰 极致降本与抗幻觉**：不再让 AI 盲读十几万行旧代码。纯本地 AST 引擎提取高浓度物理拓扑摘要，结合 MOC (Map of Content) 双链路由，Token 消耗直降 90%，从根源上消除 AI 胡编乱造。
3. **🛡️ 架构防腐与红线拦截**：将业务边界与核心逻辑代码化。当 IDE 接收到的新提示词与既有系统架构发生冲突时，自动触发“业务红线”软拦截或硬阻断，强制 AI 修正方案或同步更新文档，确保项目演进不腐化。

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 为什么你需要 aictx？

无论你是追求极客效率的独立开发者，还是天天接外包修 Bug 的“接单侠”，aictx 都能带来物理级别的降维打击。

### 🥷 场景 A：独立黑客 (Indie Hacker) 的永久外脑
当你同时维护 3 个独立产品时，每次切换项目，AI 都会搞混技术栈。
有了 aictx，只需在根目录执行 `aictx sync`，你个人的数据库偏好、UI 组件库版本、API 封装规范瞬间无缝写入 Trae / Cursor / Codex / OpenCode 等底层配置。**AI 瞬间切换大脑，沟通成本直降 40%，接下来的每一行代码都完美契合该项目的架构。**

### 🌍 场景 B：跨 AI IDE 游牧者 (AI Nomad) 的统一底座
白天在公司用 Cursor（有团队额度），晚上回家用 Trae（因为免费），偶尔尝鲜 Windsurf 或 OpenCode。不同的 AI IDE 性格迥异，经常把同一个项目的代码风格写得四分五裂。
通过 aictx，你只需要维护一份核心架构规则，执行 `aictx sync` 就能**一键同时分发**到所有 IDE（`.cursorrules`, `.trae/rules` 等）。**无论用什么工具，AI 吐出的代码规范永远 100% 保持一致，彻底终结“不同 AI 写代码打架”的惨状。**

### 🛠️ 场景 C：外包接单侠 (Freelancer) 秒接盘“祖传屎山”
客户丢来一个 5 年历史、十几万行的屎山项目让你修 Bug。直接让 AI 看？不仅 Token 爆炸，还疯狂产生幻觉。
执行 `aictx init --onboard`。1 秒内，aictx 在**纯本地（零 Token、不泄露代码）**扫描提取出精准的物理依赖拓扑。再复制生成的“上帝提示词”给 AI，它就能瞬间给你出一份真实的 PRD 和架构分析。**让 AI 读高浓度摘要，而不是读全集，Token 消耗直降 90%。**

### 🏢 终极形态：绑架企业级架构 (Tech Lead)
当团队里的个人开发者因为用了 aictx 效率翻倍且从不犯错后，顺理成章将 `.trae/rules` 提交到 Git 仓库。从此，“10 个 AI 助手写出 10 种不同架构”的灾难被彻底终结，团队级 AI 架构实现了强制统一。

## ✨ 核心特性

- 🕵️ **逆向接盘神器 (Zero-LLM Onboarding)**
  专为棕地 (Brownfield) 项目设计。底层集成纯本地 Graphify AST 引擎，将十几万行代码压缩为千字物理拓扑图 (`system-graph.md`)。**零云端 API 调用、绝对隐私安全**，引导 IDE 完美反推现状，不再虚构重构计划。
- 🗂️ **极致抠门：MOC 双链路由 (Index)**
  内置基于 Markdown Frontmatter 的 MOC 路由机制。大模型只需读取几十行的索引表，就能顺藤摸瓜精准命中所需的原子化文档。彻底抛弃昂贵且低效的“全局检索”，榨干每一滴 Token 的价值。
- 🧩 **开箱即用，零侵入 (Context Assembler)**
  `aictx sync` 自动拉取你的模板，根据 `tags` 动态过滤，并一键注入到 Trae, Cursor, Windsurf, Codex, OpenCode, Claude Code 等终端。无需更改现有业务代码，只需一行命令即可为项目挂载 AI 防护装甲。
- ⚡ **让 AI 学会用工具 (IDE Skill Injection)**
  自动为项目挂载如 `aictx-graphify` (AST 本地查询) 等本地大模型 Skill。你只需对 AI 说“查一下依赖”，AI 就会自己调用本地引擎挖掘图谱。

## 🚀 快速开始

### 1. 安装

作为全局工具安装：
```bash
npm install -g aictx-cli
# 或使用 pnpm/yarn
pnpm add -g aictx-cli
```

### 2. 初始化配置

在你的项目根目录下执行：
```bash
# 全新项目 (Greenfield)
aictx init

# 存量老项目逆向接盘 (Brownfield) - 强烈推荐！
aictx init --onboard
```
*老项目会自动进行零模型 AST 提取，并生成 IDE 引导上帝提示词 (God Prompt)。*

如果你已经有 PRD 和技术架构文档，可以直接基于现有输入快速建项：
```bash
aictx init --from-prd ./docs/prd.md --from-arch ./docs/tech-stack.md
```

如果暂时只有 PRD，但已经明确技术选型，也可以直接传入技术架构摘要：
```bash
aictx init --from-prd ./docs/prd.md --arch "Frontend Vue 3 + Vite，Backend NestJS，DB PostgreSQL，Deploy Docker Compose + Nginx"
```

CLI 会把这些输入自动导入到 `aictx-docs/product`、`aictx-docs/architecture`，并在 `aictx-docs/project` 下生成一份 bootstrap TODO，供 AI 后续直接开始拆解与搭架子。

默认情况下，`aictx init` 还会生成 npm Trusted Publisher 发布资产：

- `.github/workflows/npm-publish.yml`：基于 GitHub Actions OIDC 的 `npm publish --provenance` 工作流
- `aictx-docs/project/npm-trusted-publisher-release.md`：npm 后台设置项与发布检查清单

如果当前项目不是 npm 包，可以使用 `aictx init --no-npm-publish-workflow` 跳过生成。

### 3. 一键同步你的 AI 大脑

拉取、组装并动态注入最新的上下文规范到当前 AI 编程工具：
```bash
aictx sync
```

`aictx sync` 是让本地 AI 编程工具保持上下文一致的核心命令。它会从当前项目根目录读取 `aictx.json`，把内置 / 本地 / 远程规则同步到 `.aictx-cache`，按 `tags` 过滤 Markdown 规则文件，再把命中的规则写入配置的 AI 工具目录。

最小 `aictx.json` 示例：
```json
{
  "version": "1.0",
  "repository": "builtin",
  "ides": ["codex"],
  "tags": ["backend", "frontend", "common"]
}
```

规则文件使用 Markdown + frontmatter tags：
```md
---
tags:
  - common
  - backend
---
# API Architecture Rules
```

`repository` 支持三种模式：

- 省略、空字符串或 `builtin`：使用 aictx 内置最佳实践规则。
- 本地路径，例如 `../aictx-rules`：从本地规则目录复制。
- Git URL，例如 `git@github.com:your-org/aictx-meta-repo.git`：克隆远程规则快照。

生成目标：

- Codex：`AGENTS.md`、`.agents/workflows/aictx-*.md`、`.agents/skills/*`
- Claude Code：`CLAUDE.md`、`.claude/rules/aictx-*.md`、`.claude/skills/*`
- Cursor：`.cursor/rules/aictx-*.mdc`
- Windsurf：`.windsurf/rules/aictx-*.md`
- Trae：`.trae/rules/aictx-*.md`

`aictx sync` 只接管这些规则目录中以 `aictx-` 开头的生成文件，不会删除用户自己维护的自定义规则。

### 4. 先路由，再读文档

当你创建或修改项目文档后，先编译 MOC 路由表：
```bash
aictx index
```

`aictx index` 会更新所有包含 `<!-- aictx-index-start -->` 的 `00-Index.md`，生成包含文档路径、tags、entities、aliases、更新时间和简介的路由表。

在让 AI 阅读产品、架构或项目文档前，先用问题做一次路由：
```bash
aictx route "支付下单流程是怎么工作的？"
```

这个命令会基于 `aictx-docs/**/00-Index.md` 的元数据给原子文档排序，让 AI 先阅读最相关的候选文档，再决定是否需要全局检索。

### 5. 为 Agent 运行准备上下文

当前 Runtime 是 **Agent 的上下文准备与审计层**，不是完整的 Agent 执行器。它负责选择规则和文档、检查上下文是否过期、控制 Token 预算、记录每次准备结果。它目前不负责调用模型、执行工具、任务调度或失败重试；这些仍由 Codex 或团队自己的 Agent Host 负责。

```text
规则 + MOC 文档 + 图谱
          |
          | aictx sync / context build
          v
Context Bundle -- context prepare "<任务>" --> Context Packet --> Agent Host
                                               +--> Run Manifest
```

#### 第一次使用

```bash
# 1. 初始化项目；默认选择 Codex
aictx init

# 2. 同步规则、注入 IDE，并生成 Context Bundle
aictx sync

# 3. 确认 Bundle 与当前来源一致
aictx context verify
```

`aictx sync` 同时完成规则同步、IDE 注入和 Bundle 构建。如果只需要从 `aictx.json` 配置的规则仓库重新拉取规则并刷新 Runtime 快照，不重新注入 IDE，使用：

```bash
aictx context build
```

#### 每次 Agent 任务如何运行

```bash
# 人类可读摘要，同时写入 Run Manifest
aictx context prepare "修复支付下单问题"

# 包含完整规则和文档内容的 Markdown
aictx context prepare "修复支付下单问题" --codex

# Agent Host 读取的机器可读 JSON
aictx context prepare "修复支付下单问题" --json
```

`context prepare` 会自动检查 Bundle 是否过期，不需要每次手动先运行 `context verify`。`--codex` 只输出可交给 Codex 的上下文，**不会自动启动 Codex**。

默认输出示例：

```text
Context Packet: a465db4045ad932d8316642d
status: ready
budget: 4611/8000
rules: 5, documents: 0
manifest: .aictx/runs/55daeca9-7743-44fb-92ef-fba783e4f36d.json
```

如果必带的 `alwaysApply` 规则已超过预算，Packet 会设置 `budgetExceeded: true`，可选规则和文档不会继续塞入。此时应提高 `--budget` 或精简必带规则。

Runtime 使用三类数据：

- **Context Bundle**：`.aictx/context-bundle.json`，保存规则、MOC 文档、图谱元数据和来源指纹。
- **Context Packet**：`context prepare` 的输出。它包含必带的 `alwaysApply` 规则，以及在 Token 预算内按任务相关性选中的可选规则和文档。
- **Run Manifest**：`.aictx/runs/<run-id>.json`，记录任务、Bundle 版本、选中的内容和新鲜度结果。它只表示“上下文已准备”，不表示 Agent 任务已执行或成功。

#### 常用参数

| 参数 | 作用 | 默认值 |
|---|---|---|
| `--budget <tokens>` | 本次 Context Packet 的 Token 预算 | `8000` |
| `--limit <count>` | 最多选择的 MOC 文档数 | `3` |
| `--json` | 输出完整 JSON，供 Agent Host 解析 | 关闭 |
| `--codex` | 输出包含完整内容的 Markdown | 关闭 |
| `--no-manifest` | 只生成 Packet，不保存运行记录 | 关闭 |
| `--allow-stale` | 允许宿主继续获取过期 Packet，其状态仍为 `context_stale` | 关闭 |
| `--bundle <path>` | 覆盖 Bundle 文件路径 | `.aictx/context-bundle.json` |
| `--runs-dir <dir>` | 覆盖 Run Manifest 目录 | `.aictx/runs` |

#### 默认配置

`aictx init` 会在 `aictx.json` 中生成：

```json
{
  "context": {
    "cacheDir": ".aictx-cache",
    "docsDir": "aictx-docs",
    "graphPath": "graphify-out/graph.json",
    "bundlePath": ".aictx/context-bundle.json"
  },
  "runtime": {
    "runsDir": ".aictx/runs",
    "defaultBudget": 8000,
    "documentLimit": 3
  }
}
```

#### Agent Host 接入方式

Agent Host 应执行 `context prepare --json`，检查 `packet.status`，再把 `packet` 交给模型或 Agent。以下是伪代码：

```ts
const prepared = JSON.parse(
  await run("aictx", ["context", "prepare", task, "--json"])
);

if (prepared.packet.status !== "ready") {
  throw new Error("Context 已过期，需要重建 Bundle");
}

await agent.run({ task, context: prepared.packet });
```

#### 上下文过期如何处理

`context verify` 和 `context prepare` 会检查 Bundle 记录的规则、MOC 文档、图谱和 `aictx.json`。已记录文件被修改或删除，以及规则或文档目录新增 Markdown 时，会返回 `context_stale`。

| 变化 | 正确操作 |
|---|---|
| 规则仓库或 tags 变化 | `aictx sync` |
| 文档新增、移动或 Frontmatter 变化 | `aictx index` 后运行 `aictx context build` |
| 代码结构变化，图谱已落后 | `aictx graph analyze --dir . --out ./graphify-out` 后运行 `aictx context build` |
| 只修改了已纳入 Bundle 的文档 | `aictx context build` |

退出码约定：正常为 `0`，Bundle 过期为 `2`，命令或配置错误为 `1`。`--allow-stale` 会允许 `context prepare` 以退出码 `0` 返回过期 Packet，但 `packet.status` 仍为 `context_stale`。

#### 查看运行记录

`--json` 输出的 `manifest.runId` 是 Run ID。默认和 `--codex` 输出会显示 `.aictx/runs/<run-id>.json` 路径，其文件名中不带 `.json` 的部分就是 Run ID：

```bash
aictx run inspect "<run-id>"
aictx run inspect "<run-id>" --json
```

Runtime 只读检查上下文来源，除了写入 `.aictx/runs/` 记录外，不会自动修改规则、文档或图谱。

## 🛠️ CLI 命令一览

> **设计哲学：无感化 (Invisible CLI)**
> aictx 提倡降低开发者的认知负担。绝大多数命令由 AI 助手自动调用或通过工程钩子静默触发。

| 命令 | 描述 | 触发方式 (适用场景) |
|---|---|---|
| `aictx init` | 智能向导初始化 (支持新项目与存量项目逆向接管 `--onboard`) | **👤 人类手动** (首次接入 aictx 时执行一次) |
| `aictx sync` | 解析、过滤并向 IDE 动态注入 AI 上下文规则 (Context Assembler) | **🪝 钩子静默 / 🤖 AI** (拉取最新规约时) |
| `aictx index`| 编译生成 MOC 双链路由表 | **🤖 AI 自动** (新建或修改文档后，刷新 AI 索引) |
| `aictx route "<问题>"` | 基于 MOC 路由表推荐应优先阅读的原子文档 | **🤖 AI 自动** (读文档或全局检索前执行) |
| `aictx context build` | 重建版本化 Context Bundle | **🤖 AI 自动** (上下文来源变化后) |
| `aictx context verify` | 检查 Bundle 与来源是否一致 | **🤖 Agent 宿主** (准备任务前) |
| `aictx context prepare "<任务>"` | 生成 Context Packet 并记录 Run Manifest | **🤖 Agent 宿主** (任务开始时) |
| `aictx run inspect "<run-id>"` | 查看历史 Run Manifest | **👤 / 🤖** (审计与排错) |
| `aictx resolve`| 交互式解决业务上下文冲突 | **👤 人类手动** (发现多个规则描述同一边界时介入) |
| `aictx doctor` | 诊断本地规则漂移与 Token 健康度 | **🪝 钩子静默** (推荐绑定 Git `pre-commit` 钩子) |

> 输入 `aictx <command> --help` 可查看任何命令的详细用法。

## 📝 版本更新

每次发布新的 npm 包前，都需要更新本节，明确说明该版本变更。

### Unreleased

暂无更新。

### v2.0.3 - 2026-08-06

- `aictx route` 新增可选 `--ai-fallback`：本地路由无结果、低分或并列时，使用本机 Codex CLI 只读复核。
- Codex CLI 未安装、未登录、超时或执行失败时自动降级为本地 MOC 路由，不影响原有命令。
- `--ai-fallback` 默认关闭。启用后 Codex 可能通过已配置的在线模型处理 MOC 元数据并读取候选文档，请仅对允许发送给对应模型服务的项目使用。

### v2.0.2 - 2026-08-06

- 修复 `aictx route` 无法用自然语言问题命中文档正文中业务概念的问题。
- 增加中文词组和英文词的关联匹配，正文至少命中两个有效词才会进入候选，减少误命中。
- Agent Runtime 的 Context Bundle 文档选择同步使用相同匹配规则。

### v2.0.1 - 2026-08-06

- 修复全局安装 `aictx-cli` 后执行图谱命令可能出现 `spawn graphify-go ENOENT` 的问题。
- `aictx` 现在直接解析并启动自身依赖中的 `graphify-go` 入口，不再依赖传递依赖的命令是否暴露到全局 PATH。
- 新增 PATH 中不存在 `graphify-go` 时的图谱生成回归测试。

### v2.0.0 - 2026-08-01

- 明确拆分 Shared Context Core、Development Plane、Runtime Plane 三层职责，并固化单向依赖边界。
- 新增版本化 Context Bundle、任务级 Context Packet、来源新鲜度检查和可审计 Run Manifest。
- 新增 `aictx context build`、`aictx context verify`、`aictx context prepare`、`aictx run inspect`；`aictx sync` 会自动刷新 Bundle。
- 保持 v1 配置和原有 `sync` 主流程程兼容；Bundle 构建失败不会撤销已完成的 IDE 规则同步。
- 补充 Runtime 完整使用说明，明确能力边界、日常流程、参数、配置、过期处理和 Agent Host 接入方式。
- 许可证由 MIT 改为 PolyForm Noncommercial 1.0.0；商业用途必须单独取得书面授权，历史 MIT 版本继续适用原许可。

### v1.6.4 - 2026-08-01

- 新增内置用户沟通规则：要求结论优先、减少过程叙述和工程汇报腔，并根据真实验证结果交付。
- 新增 Sub-agent 条件分工规则：只在宿主支持且并行收益明确时拆分任务，由主智能体统一复核和汇总。
- 全局沟通语言改为跟随用户当前语言，用户明确指定语言时优先采用指定语言。

### v1.6.3 - 2026-08-01

- 新增内置通用图谱新鲜度规则：当图谱落后时，智能体必须先重新生成项目图谱，再进行架构或代码关系判断。
- 做实 MOC 路由：增强 `aictx index` 表格，并新增 `aictx route "<问题>"` 命令，用于在全局检索前先定位原子文档。

### v1.6.2 - 2026-08-01

- 强化 `aictx sync`：IDE 规则目录会收敛到最新 tags 过滤结果，不再遗留过期的 `aictx-*` 文件。
- 规则抓取改为先写入临时目录，成功后再替换 `.aictx-cache`，抓取失败时保留旧缓存。
- 保留嵌套规则来源路径，并生成更稳定的输出文件名，避免同名规则静默覆盖。
- 加强 `aictx.json` 校验，覆盖 `ides`、`tags`、`repository`。
- 补充 README 中 `aictx sync` 的用途、规则格式、仓库模式与生成目录说明。

### v1.6.1

- 修复 Brownfield onboarding 自动执行异步 CLI 命令未正确等待的问题。
- 初始化流程默认面向 Codex，并按所选 AI 工具生成对应配置目录。
- 更新内置 `graphify-go` 依赖到修复后的版本，用于 `aictx init --onboard`。

## 🏗️ 架构愿景 (Roadmap)

aictx 致力于成为 AI 辅助编程时代的标准基础设施。无论是帮助**个人开发者**实现低 Token 的本地知识库闭环，还是帮助**研发团队**实现架构一致性：

- [x] **Phase 1: CLI 基础设施搭建** 
  - 核心指令脚手架 (`init`, `sync`, `index`, `doctor`, `resolve`, `info`)
  - 跨平台兼容构建
  - 自动 MOC 双链索引机制
- [x] **Phase 2: 规则解析与组装器引擎 (Context Assembler)**
  - 动态 YAML 解析与 `tags` 路由过滤
  - 存量项目零模型 AST 逆向提取 (Zero-LLM Onboarding)
  - 终端 God Prompt 动态拼装
- [x] **Phase 3: IDE 与工作流深度集成**
  - Trae / Cursor / Windsurf / Codex / OpenCode / Claude Code 原生配置注入
  - IDE 本地 Skill 智能生态融合 (`aictx-graphify`)
- [x] **Phase 4: 内部 Agent Runtime 基础**
  - Shared Context Core 稳定契约与版本化快照
  - 只读 Context Packet 准备、来源检查和 Run Manifest
- [ ] **Phase 5: Runtime 工程化加固**
  - Policy Gate、宿主适配器、可观测、回放与评测
  - 仅在部署、权限、团队归属或发布节奏确有差异时拆包或拆仓库

## 🤝 参与贡献

欢迎社区以非商业方式提交 Issue、PR，或分享 Context as Code 实践。贡献内容按项目当前许可证分发。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起一个 Pull Request

发布流程与约定见：[RELEASING.md](./RELEASING.md)

## 📄 许可证

当前源码按 [PolyForm Noncommercial License 1.0.0](LICENSE) 提供。在条款范围内允许非商业使用、修改和分发；任何商业用途都需要单独取得书面授权，详见[商业授权说明](COMMERCIAL_LICENSE.md)。

本项目属于 Source-Available，不再称为 OSI Open Source。此前已经按 MIT 发布的历史版本继续适用其原始 MIT 条款。
