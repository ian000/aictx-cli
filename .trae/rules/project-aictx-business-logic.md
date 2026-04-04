---
tags: [业务逻辑, aictx]
alwaysApply: false
description: 当开发或讨论 aictx 项目的核心业务逻辑、状态机流转 (生命周期) 或 SSOT 阻断等业务红线时触发
---

# 业务逻辑 (Business Logic)

## 核心领域模型 (Domain Models)
- **BaseRule (底座规范)**：跨项目通用的底层研发纪律（如：代码风格约束、RAG 写作标准、代码提交流程）。
- **DomainRule (领域规则)**：特定业务模块的约束逻辑（如：物流系统状态机说明、医美系统计费红线）。
- **Skill (AI 技能包)**：类似 npm package，可在项目中被 AI 直接调用复用的自动化脚本或 Agent Action（如：`biz-scaffolder`）。
- **ContextAssembler (上下文组装器)**：aictx CLI 的核心引擎，负责解析依赖图谱，将 BaseRule 与 DomainRule 按需合并。

## 状态机流转 (State Machine)
- **aictx 执行生命周期**：
  1. `Init/Sync`：用户触发 `aictx` 命令或通过 `postinstall` 钩子自动启动。
  2. `Resolve`：读取本地项目的规则清单配置，定位远程/中央 Meta 仓库位置。
  3. `Fetch`：拉取最新的 Rule 和 Skill 资产至本地缓存。
  4. `Assemble`：根据当前项目声明的 `tags` 或模块范围，动态组装 Top-tier Context。
  5. `Inject`：通过策略模式（Adapter Pattern）平铺注入或覆写到本地对应的 IDE/CLI 专有目录。支持多端并行写入，并自动转换目录规范（例如将规则同步为 `.trae/rules/*.md`，并在 Claude Code 中映射为 `.clauderc` 结构）。
  6. `Report`：输出同步结果，对比本地与 Meta 仓库的 Drift（漂移）并预警。

## 业务红线 (Business Guardrails)
- **单一事实来源 (SSOT) 阻断与本地逃生舱**：默认情况下，本地注入的 AI 规则文件应被视为“编译后产物”，如果在具体的业务项目中被随意篡改，下一次同步时会被强制覆盖。但为了满足开发者本地调试的需求，必须提供 `local-override.md` 或 `.aiignore` 逃生舱机制，允许局部覆写或忽略某些规则。
- **上下文爆炸 (Context Bloat) 拦截**：严禁全量无脑加载所有规则。组装器必须基于标签过滤（Tag-filtering）或 `alwaysApply: false` 机制进行控制，防止超出大模型 Token 上限，引发幻觉。
