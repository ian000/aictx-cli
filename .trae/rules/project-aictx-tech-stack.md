---
tags: [技术架构, aictx]
alwaysApply: false
description: 当需要确定 aictx CLI 的前后端框架 (cac/tsup等)、依赖管理、分发渠道或自动化发版 CI/CD 选型时触发
---

# 技术栈选型 (Tech Stack)

## 前端/CLI 交互架构
- **框架选型**：推荐使用 Node.js 生态的 `cac` (非常轻量) 或 `commander`。考虑到 CLI 的轻量级定位，`cac` 为首选。
- **交互与提示**：推荐使用 `@clack/prompts`，提供非常优雅、现代且无感知的终端问答交互体验。
- **终端输出**：使用 `picocolors` (极小极快的颜色输出) 和 `consola` 进行日志分级与美化。

## 后端/核心逻辑架构
- **开发语言**：TypeScript 优先。外包团队和大部分前端/全栈团队对 Node 生态最为熟悉，有利于前期“标准制定”阶段的快速推广。
- **文件与解析操作**：使用 `fs-extra` 处理文件系统流转；使用 `gray-matter` 或 `yaml` 高效解析和重写 Markdown 的 Frontmatter。
- **网络请求**：原生 `fetch` 或 `ofetch`（由 unjs 提供，支持跨平台同构）用于远程规则资产拉取。

## 部署与基建
- **依赖管理**：`pnpm` (自带 Workspace 支持，方便后续做 monorepo 将 Rule-Hub 拆分)。
- **构建工具**：`tsup` (基于 esbuild 的零配置打包工具)，能够极快地将 TS 编译为单文件二进制产物。
- **分发渠道**：发布至 npm Registry。开发者可以通过 `npx aictx init` 初始化，或通过依赖项安装后使用 `postinstall` 触发。
- **CI/CD**：GitHub Actions + Changesets (或 Semantic Release) 实现全自动的语义化版本管理、Changelog 生成与 npm 自动发布。
