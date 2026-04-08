---
tags:
  - aictx
  - architecture
  - generated
aliases:
  - [aictx-cli 系统架构, 架构纪实]
entities:
  - [OnboardEngine, Graphify, Context Assembler, Adapter]
roles:
  - [Architect]
---

# aictx-cli 当前系统架构纪实 (As-Is Architecture)

> **文档生成纪实声明**: 本文档基于 `system-graph.md` (纯本地 AST 解析生成的物理代码依赖图谱) 与项目源码逆向推演而成。它真实反映了当前代码库的技术现状与模块边界。

## 1. 核心架构模式 (Core Architectural Pattern)

aictx-cli 采用了**管道-过滤器 (Pipeline & Filter)** 与 **适配器模式 (Adapter Pattern)** 相结合的架构，整体分为三大执行流：
1. **Onboarding 流 (棕地接管)**: `OnboardEngine` -> 代理调用本地 `graphify` 引擎 -> 提取 AST -> 生成 `system-graph.md`。
2. **Assembler 流 (规则组装)**: 解析 YAML -> 根据 `tags` 与 `alwaysApply` 过滤规则 -> `Context Assembler` 拼接。
3. **Injector 流 (IDE 注入)**: 接收组装后的上下文 -> 分发至多态 `Adapter` (Trae, Cursor, Windsurf, Claude) -> 物理写入。

## 2. God Nodes (核心抽象节点分析)

从 AST 物理依赖图中提取的最核心节点 (God Nodes) 反映了系统的核心职责：
1. **`OnboardEngine`** (God Node 5, Community 15): 负责连接终端 CLI 交互与底层的代码解析引擎。它是桥接用户侧操作与纯本地逆向工程的核心枢纽。
2. **`_make_id()` / `_extract_generic()`** (God Nodes 1, 3, Community 0): 底层集成/代理的 Graphify 引擎的核心提取逻辑，用于从多种编程语言中稳定抽取出跨语言的 AST 节点与边关系。
3. **`_read_text()` / `_fetch_webpage()`** (God Nodes 2, 7, Community 5): 处理本地文件读取与潜在的远程/远端规则拉取 (Fetch)。
4. **`detect()` / `classify_file()`** (God Node 4, Community 1): 文件类型嗅探器，用于在执行 AST 解析或规则匹配前，判断目标文件类型与语言。

## 3. 模块聚类 (Communities) 与依赖现状

### 3.1 规则同步与注入引擎 (Context Assembler & Injector)
*映射图谱：Community 2 (`ClaudeAdapter`, `CursorAdapter`, `TraeAdapter`, `ConfigParser`, `diagnoseDrift`)*
- **现状**: 所有的 IDE 适配器被集中管理，这证明系统具备极强的可扩展性，新增一款 AI IDE（如 RooCode）只需实现一个新的 Adapter 接口。
- **配置解析**: `ConfigParser` 负责读取项目的 `aictx.json`，是所有过滤和路由的源头。

### 3.2 纯本地 AST 提取引擎 (Graphify Subsystem)
*映射图谱：Community 0 (`extract_c`, `extract_go`, `extract_cpp` 等), Community 1, Community 3*
- **现状**: aictx-cli 深度内嵌/代理了 Graphify 的分析能力。它通过 `_extract_generic` 处理多语言，并通过 `god_nodes()`, `graph_diff()`, `_cross_file_surprises()` (Community 3) 进行图论级别的代码异味分析。
- **优势**: 完全本地执行，零模型调用，确保代码不离线。

### 3.3 CLI 命令控制层 (Command Layer)
*映射图谱：Community 19-24 (`doctor.ts`, `graph.ts`, `info.ts`, `resolve.ts`, `sync.ts`)*
- **现状**: 采用 `cac` 构建，每一个子命令（如 `sync`, `doctor`, `init`）作为独立的入口点，保持了“薄控制器 (Thin Controller)”的设计原则，将核心逻辑下放给 `Engine` 和 `Assembler`。

## 4. 潜在技术债与风险 (Technical Debt)

1. **Graphify 引擎深度耦合**: 图谱显示系统存在大量底层的 `extract_*` 和 `_make_id` 节点，这表明 CLI 可能直接打包了 Graphify 的 Python 脚本或强依赖其本地二进制包。如果跨平台（Windows/Linux/macOS）打包处理不当，可能导致执行失败。
2. **Thin Communities (碎片化命令)**: CLI 命令模块（如 `info.ts`, `resolve.ts`）在图谱中呈现为孤岛（Community 19-24）。这虽然符合命令模式的解耦，但可能暗示这些高级功能（如 `resolve` 冲突消解）目前**尚未与底层的核心 AST 引擎或组装器产生深度交互**，可能仅停留在简单的占位或基础实现阶段。
