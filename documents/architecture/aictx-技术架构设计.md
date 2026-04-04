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

## 2. 核心命令设计 (CLI Commands)
- `aictx init`: 初始化 aictx 配置与文档目录结构。除了生成 `aictx.json`，还会自动在标准目录（`documents/product`, `documents/architecture`, `documents/project`）中生成 MOC (Map of Content) 路由表模板（如 `00-Index.md` 或 `README.md`），并植入 `<!-- aictx-index-start -->` 和 `<!-- aictx-index-end -->` 锚点。
- `aictx sync`: 核心命令。触发执行状态机，拉取、组装并注入规则到本地 IDE 目录。执行完毕后，自动打印“价值感知面板 (Value Dashboard)”。
- `aictx index`: MOC 路由编译命令。扫描指定目录（默认 `documents/`）下的所有 Markdown 文件的 YAML Frontmatter（包括 `entities`, `aliases`, `description` 等元数据），自动生成包含文件路径和双向链接 (`[[xxx]]`) 的路由表格，并精准替换（覆写）MOC 模板文件中锚点之间的内容。
- `aictx doctor`: 诊断命令。检查本地规则是否发生 Drift (漂移/被篡改)，并计算当前注入规则的 Token 消耗预估。
- `aictx resolve`: 冲突监测与消解命令。通过解析 Markdown 的 `entities` / `tags` 交集预估规则重叠度，结合 `@clack/prompts` 提供交互式向导，引导团队手动合并或覆盖冲突的业务红线，确保 SSOT。
- `aictx info`: 指标数据展示命令。在终端渲染图表，展示项目从接入以来节省的 Token 数量、规则更新次数以及核心防腐数据。

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