---
tags:
  - aictx
  - 开发计划
  - TODO
aliases:
  - [aictx 研发里程碑, Roadmap]
entities:
  - [CLI, ConfigParser, ContextAssembler, Fetcher, Resolver]
roles:
  - [Maintainer]
---
# aictx-cli 开发计划与 TODO (Roadmap)

> **文档目的**: 作为 `aictx-cli` 项目开发的单一真实源 (SSOT) 任务追踪板。所有特性的设计、编码和验证，都必须与此文档的状态同步。

## 🎯 Phase 1: 基础设施与命令脚手架 (Infrastructure)
*目标：搭建项目的基本骨架，打通编译构建与双语宣发，跑通全部命令的 Mock 流程。*

- [x] **P1.1 核心脚手架搭建**
  - [x] 引入 `cac`、`tsup`、`consola`、`picocolors` 等依赖。
  - [x] 搭建 `src/bin/aictx.ts` 核心入口。
  - [x] 配置 `tsup` 实现极致压缩的二进制跨平台构建。
- [x] **P1.2 核心命令 Mock 注册**
  - [x] 注册 `init` 命令 (初始化配置)。
  - [x] 注册 `sync` 命令 (同步与组装)。
  - [x] 注册 `doctor` 命令 (健康诊断)。
  - [x] 注册 `info` 命令 (指标看板)。
- [x] **P1.3 高级特性引入与产品定义**
  - [x] 设计并注册 `resolve` 冲突监测命令。
  - [x] 撰写顶级的 GitHub 风格双语 `README.md` (中/英)。
  - [x] 将产品愿景和技术架构落实到 `documents/` 下，作为项目 SSOT。
  - [x] 在团队工作流 (`common-coding-workflow.md`) 中引入 **文档驱动开发 (DDD)** 铁律及前置确认机制。

---

## 🎯 Phase 2: 配置解析与交互模块 (Configuration & CLI UX)
*目标：让 CLI 能够与开发者进行优雅的终端交互，并正确生成和解析 `.aictx` 配置文件。*

- [x] **P2.1 优雅终端交互基建**
  - [x] 集成 `@clack/prompts`，封装终端问答向导基类 (Spinner, Select, Text)。
- [x] **P2.2 `init` 核心流程实现**
  - [x] 交互式询问用户所使用的 IDE 类型 (Trae, Cursor, Antigravity, Claude Code 等，支持多选)。
  - [x] 询问并确认团队的远程 Meta-Repo 规则仓库地址。
  - [x] 在项目根目录生成标准的 `aictx.json` 配置文件。
  - [x] 生成基础的本地覆写文件 `.aiignore`。
- [x] **P2.3 `config` 解析引擎实现**
  - [x] 编写 ConfigParser，读取并校验项目目录下的 `aictx.json`。
  - [x] 支持本地配置与默认缺省配置的 Merge。

---

## 🎯 Phase 3: 规则拉取与组装核心 (Fetch & Assemble Engine)
*目标：实现 `sync` 命令的血肉，完成真正的 Context as Code 数据流转。*

- [x] **P3.1 规则拉取引擎 (Fetcher)**
  - [x] 实现 LocalFetcher：从本地文件系统读取 Markdown 规则。
  - [x] 实现 GitFetcher：从远程 Meta-Repo 拉取特定版本的规则文件至 `~/.aictx-cache`。
- [x] **P3.2 YAML Frontmatter 解析器**
  - [x] 集成 `gray-matter`，提取 Markdown 头部的 `tags`, `entities`, `roles` 等元数据。
- [x] **P3.3 规则组装引擎 (Context Assembler)**
  - [x] 根据当前项目的业务标签，动态过滤和合并缓存中的 Rules。
  - [x] 实现 `tiktoken` 估算器，实时计算合并后文本的 Token 消耗，并在超过 12K 时输出黄色警告。
- [x] **P3.4 跨 IDE 适配与注入器 (Injector)**
  - [x] 实现 TraeAdapter：写入 `.trae/rules/`。
  - [x] 实现 CursorAdapter：写入 `.cursor/rules/`。
  - [x] 根据 `init` 时用户的选择，执行并行写入。

---

## 🎯 Phase 4: 诊断、消解与价值展示 (Doctor, Resolve & Info)
*目标：提供高级特性，解决规则冲突，并向团队直观展示 aictx 的降本增效价值。*

- [ ] **P4.1 冲突消解引擎 (`resolve`)**
  - [ ] 扫描组装后的 Rules，比对 `entities` 和 `tags` 的交集。
  - [ ] 若发现重叠，利用 `@clack/prompts` 在终端弹出版本比对视图，引导开发者选择优先级。
- [ ] **P4.2 本地漂移诊断 (`doctor`)**
  - [ ] 校验 `.aictx-cache` 中的 Hash 值与当前 IDE 中注入的规则文件。
  - [ ] 若被本地开发者篡改，提示修复或覆盖。
- [ ] **P4.3 价值面板 (`info`)**
  - [ ] 终端渲染大盘：展示本次节省的 Tokens 预估值、过滤掉的无关模块数。
  - [ ] 实现 IDE 静默注入：在生成的规则末尾注入特定 Prompt，让 AI 自己向用户播报“防腐收益”。

---

## 🎯 Phase 5: CI/CD 与开源分发 (Release & Distribution)
*目标：完成项目的打磨，推向开源社区。*

- [ ] **P5.1 完善测试覆盖率**
  - [ ] 引入 `vitest` 或 `jest`，对 Assembler 和 Fetcher 进行核心逻辑单测。
- [ ] **P5.2 NPM 打包与发布**
  - [ ] 配置 `package.json` 的 `bin` 字段和 `files` 白名单。
  - [ ] 编写 GitHub Actions 流水线，实现基于 Git Tag 的自动 NPM 发版。
- [ ] **P5.3 开源布道支持**
  - [ ] 补充具体的 Rule 范例 (Examples 目录)。
  - [ ] 在 README 中增加录屏 GIF (Asciinema) 展示交互流程。
