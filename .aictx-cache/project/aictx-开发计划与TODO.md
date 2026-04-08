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
- [ ] **P2.4 多语言支持 (i18n)**
  - [ ] 搭建 `src/locales` 轻量级字典 (中/英)。
  - [ ] 在 `init` 流程增加语言选择向导。
  - [ ] 重构所有 CLI 命令以接入多语言字典。

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

- [x] **P4.1 冲突消解引擎 (`resolve`)**
  - [x] 扫描组装后的 Rules，比对 `entities` 和 `tags` 的交集。
  - [x] 若发现重叠，利用 `@clack/prompts` 在终端弹出版本比对视图，引导开发者选择优先级。
- [x] **P4.2 本地漂移诊断 (`doctor`)**
  - [x] 校验 `.aictx-cache` 中的 Hash 值与当前 IDE 中注入的规则文件。
  - [x] 若被本地开发者篡改，提示修复或覆盖。
- [x] **P4.3 价值面板 (`info`)**
  - [x] 终端渲染大盘：展示本次节省的 Tokens 预估值、过滤掉的无关模块数。
  - [x] 实现 IDE 静默注入：在生成的规则末尾注入特定 Prompt，让 AI 自己向用户播报“防腐收益”。

---

## 🎯 Phase 5: CI/CD 与开源分发 (Release & Distribution)
*目标：完成项目的打磨，推向开源社区。*

- [x] **P5.1 完善测试覆盖率**
  - [x] 引入 `vitest` 或 `jest`，对 Assembler 和 Fetcher 进行核心逻辑单测。
- [x] **P5.2 NPM 打包与发布**
  - [x] 配置 `package.json` 的 `bin` 字段和 `files` 白名单。
  - [x] 编写 GitHub Actions 流水线，实现基于 Git Tag 的自动 NPM 发版。
- [x] **P5.3 开源布道支持**
  - [x] 补充具体的 Rule 范例 (Examples 目录)。
  - [x] 在 README 中增加录屏 GIF (Asciinema) 展示交互流程。

---

## 🎯 Phase 6: MOC 路由与防文档膨胀 (Map of Content)
*目标：通过引入标准目录和自动索引，彻底解决 AI 全局检索带来的 Token 消耗和幻觉问题。*

- [x] **P6.1 MOC 脚手架模板 (`init`)**
  - [x] 更新 `aictx init` 命令，在生成标准目录时，自动创建 `00-Index.md` 或 `README.md` 路由表模板。
  - [x] 模板中预置 `<!-- aictx-index-start -->` 和 `<!-- aictx-index-end -->` 锚点。
- [x] **P6.2 自动索引构建引擎 (`index`)**
  - [x] 注册全新的 `aictx index` 命令。
  - [x] 扫描 `documents/` 下的所有 Markdown，解析 YAML Frontmatter (`entities`, `description`, `aliases`)。
  - [x] 自动生成带有双向链接 `[[xxx]]` 的 Markdown 表格。
  - [x] 将生成的表格精准覆写到 MOC 模板的锚点位置。
- [x] **P6.3 国际化与规范更新**
  - [x] 为 `index` 命令添加中英文 i18n 翻译。
  - [x] 更新 `.trae/rules`，教导 AI 优先读取 `00-Index.md` 并顺藤摸瓜，严禁使用全局检索。
- [x] **P6.4 验证与集成测试**
  - [x] 编写测试用例验证索引生成的准确性和锚点替换的安全性。
