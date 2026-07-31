---
tags:
  - architecture
  - context-runtime
  - development-plane
entities:
  - Shared Context Core
  - Development Plane
  - Runtime Plane
aliases:
  - Agent Runtime Boundary
  - Context Runtime Architecture
description: aictx 开发基建、共享上下文核心与运行时基建的职责和依赖边界
---
# Context Runtime Architecture Boundary

## Decision

aictx 保持单仓库和单一 CLI，对代码进行三层逻辑隔离，暂不拆成独立仓库或独立 npm 包：

1. **Shared Context Core**：定义规则、文档、图谱、Token 预算、来源和新鲜度等稳定契约。
2. **Development Plane**：负责初始化、存量项目接管、规则同步、MOC/图谱构建、IDE 注入和诊断修复。
3. **Runtime Plane**：只读消费版本化的 Context Bundle，为单次任务生成 Context Packet，并记录 Run Manifest。

## Dependency Direction

```text
Shared Context Core <- Development Plane
Shared Context Core <- Runtime Plane
Runtime Plane <- Host Adapters
Development Plane + Runtime Plane <- CLI
```

Runtime Plane 不得依赖 Development Plane、CLI 交互或具体 Agent 宿主。Shared Context Core 不得依赖 `consola`、交互提示、`process.exit` 或隐式工作目录。

## Read And Write Boundary

- Development Plane 可以创建或更新规则、文档、索引、图谱和 Context Bundle。
- Runtime Plane 只能读取 Context Bundle 和源文件新鲜度，不能自动修改规则、文档或图谱。
- Runtime 发现源内容变化时返回 `context_stale`，由 Development Plane 重新构建 Bundle。
- Runtime 只写入 `.aictx/runs/` 下的运行记录。

## Stable Contracts

- **Context Bundle**：项目级、版本化、可复现的上下文快照。
- **Context Packet**：针对一个任务和 Token 预算选出的规则与文档。
- **Run Manifest**：记录一次上下文准备使用的 Bundle、来源、验证状态和选择结果。

`alwaysApply: true` 的规则必须进入 Context Packet；其余规则和 MOC 文档按任务相关性与 Token 预算选择。Runtime 不得为了塞入可选内容突破预算。

## Physical Split Gate

只有当 Runtime 需要独立部署、出现独立发布节奏、由独立团队维护、采用不同技术栈或需要权限隔离时，才拆为独立包或仓库。
