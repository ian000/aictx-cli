---
name: "biz-scaffolder"
description: "快速初始化新外包业务的 Rule 模板文件。当用户要求开启新项目、创建新业务目录或生成 project-xxx-*.md 规则文件时调用此技能。"
---

# 新业务规则脚手架 (Biz Scaffolder)

当用户接手新的外包项目（如医美 `medical`，仓储 `wms` 等），并要求在 `.trae/rules/` 下创建新项目的规则时，你必须主动调用此技能，为其生成标准的四大架构文件。

## 工作流 (Workflow)

1. **获取项目标识**: 从用户的请求中提取新项目的英文简写（如 `medical`）。如果用户未提供，则向用户询问。
2. **生成四大核心文件**: 必须使用 `Write` 工具，在 `.trae/rules/` 目录下一次性生成以下四个 `.md` 规则文件。

**注意**：所有生成的文件必须在 YAML 头部包含 `alwaysApply: false` 以及 `description` 字段（用于向 AI 说明在什么情况下触发此规则），以遵守按需加载和防 Context Bloat 的 RAG 原则。

---

### 1. 业务逻辑 (Business Logic)
**文件名**: `project-<name>-business-logic.md`
**内容模板要求**:
- YAML 头部包含 `tags: [业务逻辑, <name>]`、`alwaysApply: false` 和 `description: 当开发或讨论 <name> 项目的核心业务逻辑、状态机或红线拦截时`。
- **核心领域模型 (Domain Models)**: 定义该项目的核心术语和级联关系。
- **状态机流转 (State Machine)**: 定义该项目核心单据的生命周期（草稿 -> 审批 -> 执行 -> 结算）。
- **业务红线 (Business Guardrails)**: 定义系统里绝不能越权的“软拦截/硬阻断”逻辑。

### 2. 项目背景 (Context)
**文件名**: `project-<name>-context.md`
**内容模板要求**:
- YAML 头部包含 `tags: [项目背景, <name>]`、`alwaysApply: false` 和 `description: 当需要了解 <name> 项目的真实痛点、商业变现目标或 MVP 边界时`。
- **客户真实诉求与痛点**: 为什么要做这个系统？取代了什么旧流程？
- **商业变现目标 (Quote-to-Cash)**: 客户的业务是怎么闭环收钱的？
- **一期 MVP 边界声明**: 明确列出第一期“坚决不做”的功能，防止范围蔓延。

### 3. 产品需求 (PRD)
**文件名**: `project-<name>-prd.md`
**内容模板要求**:
- YAML 头部包含 `tags: [PRD, <name>]`、`alwaysApply: false` 和 `description: 当设计或开发 <name> 项目的核心功能模块 (MOC) 和角色权限 (RBAC) 时`。
- **核心功能模块列表 (MOC)**: 列出该项目包含的中心模块（如订单中心、结算中心等）。
- **角色与权限划分 (RBAC)**: 梳理系统的核心操作角色及其核心权限。

### 4. 技术栈选型 (Tech Stack)
**文件名**: `project-<name>-tech-stack.md`
**内容模板要求**:
- YAML 头部包含 `tags: [技术架构, <name>]`、`alwaysApply: false` 和 `description: 当需要确定 <name> 项目的前后端框架、依赖管理、分发渠道或 CI/CD 选型时`。
- **前端架构**: 框架选型（如 Vue3/React）、UI 组件库、样式方案。
- **后端架构**: 语言选型（如 Node.js/Go）、ORM 方案。
- **部署与基建**: 数据库要求（PostgreSQL/MySQL）、部署方式（Docker Compose）。

---

## 交付标准
1. 生成的四个文件必须内容详实，如果有不确定的业务逻辑，用 `TODO:` 占位符提示用户后续补充。
2. 在对话框中，用一个漂亮的 Markdown 列表向用户展示已生成的四个文件路径，并简要说明其作用。