---
tags: [PRD, aictx]
alwaysApply: false
description: 当设计或开发 aictx 项目的核心功能模块 (配置解析、同步、组装器、生命周期) 和角色权限划分时触发
---

# 产品需求 (PRD)

## 核心功能模块列表 (MOC)
- **配置解析模块 (Config Parser)**：解析项目根目录的配置声明（类似 `package.json` 中的 `ai-context` 或独立的 `.ai-config.json`），识别该项目依赖了哪些中央规则和技能包。
- **规则拉取与同步模块 (Rule Fetcher & Synchronizer)**：支持从 Git 仓库（Meta-Repo）、本地文件系统或远程 HTTP 接口拉取全量的 AI 规则与 Skills。
- **上下文动态组装模块 (Context Assembler)**：将多个 Markdown 规则文件和 YAML Frontmatter 进行智能合并。对存在冲突的规则进行策略覆盖。
- **生命周期集成模块 (Lifecycle Hooks Integrator)**：无缝集成 npm/pnpm/yarn 的 `postinstall` 钩子或 Git Hooks，实现在拉取新代码/依赖时，自动静默同步 AI 规则到 `.trae/rules` 或对应的 IDE 目录。
- **技能包管理模块 (Skill Registry Manager)**：不仅管理 Markdown 规则，还要负责分发、注册 AI 可以直接调用的自动化脚本工具（AI Skills）。

## 角色与权限划分 (RBAC)
- **终端开发者 (User)**：在各个业务项目中运行 `aictx sync` 或被动通过依赖钩子触发。作为规则的“消费者”，只有**只读**与**本地应用**的权限。
- **架构师/平台工程师 (Maintainer)**：在中央 Meta 仓库中维护和发布 BaseRule 与 DomainRule。作为规则的“生产者”，拥有规则定义、边界划分和版本分发的权限。
