---
tags:
  - aictx
  - PRD
  - PLG
  - generated
aliases:
  - [aictx-cli PRD, 产品需求文档]
entities:
  - [Context Assembler, Zero-LLM, MOC, Indie Hacker]
roles:
  - [Product Manager, Go-to-Market]
---

# aictx-cli 产品需求文档 (PRD)

> **战略纪实与演进方向**: 本文档基于 `system-graph.md` (纯本地 AST 解析生成的物理代码依赖图谱) 逆向推演，并结合 **PLG (Product-Led Growth)** 增长战略重写。我们的核心认知是：**必须先让独立开发者（种子用户）爽到极致、省到极致，企业级团队才有可能买单。**

## 1. 商业逻辑与产品定位 (Product Positioning & GTM Strategy)

**产品定位**: `aictx-cli` 是一款专为 AI 辅助编程（Trae/Cursor/Windsurf 等）打造的 **Context as Code (CaC)** 基础设施。它就像是给你的 AI 助手外接了一个永久记忆与防腐装甲。

**核心受众与渗透战略 (GTM)**:
- **先锋种子用户（独立开发者 / 独立黑客 / 全栈接单侠）**:
  - **核心痛点**: “金鱼记忆”的 AI 助手。每次开新窗口都要重复交代技术栈、每次让 AI 看旧代码都要消耗海量 Token 且容易被“上下文撑爆 (Context Bloat)”导致胡编乱造。
  - **核心爽点**: **白嫖大模型、秒接盘烂代码**。通过 `aictx init --onboard` 瞬间将十几万字的祖传烂代码“免费”压缩成千字物理拓扑，零成本让 AI 摸清项目底细；通过 `aictx sync` 永久固化个人编码偏好，AI 再也不会写错库、用错 API。
- **第二阶段渗透（Tech Lead / 研发团队）**:
  - **核心痛点**: “10 个 AI 助手写出 10 种不同的架构”，团队技术规范被 AI 冲击得支离破碎。
  - **核心爽点**: 当团队里的独立开发者因为用了 `aictx` 效率翻倍且从不犯错后，顺理成章将 `.trae/rules` 提交到 Git 仓库，从而实现团队级 AI 架构的强制统一。

**商业模式核心**: 用极端的“降本增效（省 Token、省口水）”切入个人开发者市场，再通过代码仓库协同自然辐射到企业级团队，解决 AI 时代最大的痛点——**如何让 AI 永远不偏离你的业务红线**。

## 2. 核心功能模块 (Core Modules - Individual First)

### 2.1 逆向接盘神器 (Zero-LLM Brownfield Onboarding)
这是打动个人开发者（尤其是经常接手外包/二手代码的开发者）的最强杀手锏，由底层 `OnboardEngine` 驱动：
- **纯本地 AST 提取 (零成本/零泄露)**: 接手成百上千个文件的老项目时，无需再战战兢兢地把代码扔给 Claude 或 GPT-4（既费钱又容易触碰隐私红线）。内置引擎纯本地提取代码物理拓扑 (`system-graph.md`)。
- **上帝提示词 (God Prompt)**: 终端动态拼装引导指令，让用户复制给 IDE，驱动大模型根据高浓度 AST 摘要反推纪实架构。**这是物理意义上的降维打击：让 AI 读摘要，而不是读全集，Token 消耗直降 90%。**

### 2.2 个人编码偏好的永久外脑 (Context Assembler & Injector)
为了解决“每次都要重新调教 AI”的折磨，系统实现了动态的规则注入引擎：
- **开箱即用，零侵入**: `Context Assembler` 根据 `aictx.json` 中的 `tags`，自动筛选匹配的 Markdown 模板。
- **一键注入 IDE**: 实现了 `TraeAdapter`, `CursorAdapter`, `WindsurfAdapter`, `ClaudeAdapter`。敲下 `aictx sync`，你个人的数据库偏好、UI 组件库版本、API 封装规范瞬间无缝写入目标 IDE 的底层配置（如 `.trae/rules`）。**AI 瞬间懂你所想，沟通成本直降 40%。**

### 2.3 MOC 双链路由 (Index - The Token Saver)
极致抠门，榨干每一滴 Token 的价值：
- **`aictx index`**: 扫描 `documents` 下的 Markdown 文件的 YAML Frontmatter (`tags`, `aliases`, `entities`)，自动编译出轻量级的 `00-Index.md` 路由表。
- **精准投喂机制**: 借助 IDE 的 RAG 能力，AI 只需要读取几十行的 Index 表，就能通过双向链接精准跳读目标原子文档，彻底告别“全局检索”带来的幻觉。

### 2.4 本地化技能赋能 (IDE Skill Injection)
让 AI 自己学会使用工具：
- 在 `aictx init --onboard` 流程中，自动向 `.trae/skills/aictx-graphify/SKILL.md` 等路径注入专属本地技能。
- 开发者只需对 AI 说：“查一下这个模块的依赖关系”，AI 就会自动调用 `aictx graph` 引擎在本地图谱中挖掘，而不是盲目阅读源文件。

## 3. 用户旅程与爽点设计 (User Journey)

### 场景 A：独立黑客 (Indie Hacker) 启动新项目
1. **痛点**: 同时维护 3 个独立产品，每次切换项目，AI 都会搞混技术栈。
2. **行动**: 在新项目根目录执行 `aictx init`。
3. **爽点**: 自动拉取了专属该项目的 `[frontend, supabase, react]` 规则标签。执行 `aictx sync`，Cursor 瞬间切换大脑上下文。接下来的一周，AI 写的每一行代码都完美契合该项目的架构规范。

### 场景 B：跨 AI IDE 游牧者 (AI Nomad) 的底座
1. **痛点**: 白天在公司用 Cursor (因为有团队额度)，晚上回家用 Trae (因为免费)，偶尔尝鲜 Windsurf。不同的 AI IDE 性格迥异，经常把同一个项目的代码风格写得四分五裂。
2. **行动**: 在项目里维护好 `.aictx` 规则，在 `aictx.json` 里配置 `["trae", "cursor", "windsurf"]`。
3. **爽点**: 无论切换到哪个 IDE，只要敲下 `aictx sync`，这套统一的架构规约就会被精准注入到对应 IDE 的底层配置（如 `.cursorrules` 或 `.trae/rules`）。跨 IDE 编程，AI 吐出的代码风格却能保持 100% 一致，彻底终结“不同 AI 写代码打架”的惨状。

### 场景 C：外包接单侠 (Freelancer) 接盘祖传代码
1. **痛点**: 客户丢来一个 5 年历史的 Vue2 + PHP 屎山项目，要求修 Bug。直接让 AI 看，Token 爆炸且疯狂产生幻觉。
2. **行动**: 执行 `aictx init --onboard`。
3. **爽点**: 1 秒内，工具在本地纯离线扫描了 10 万行代码，生成了精准的依赖拓扑图。复制终端弹出的 `God Prompt` 给 Trae，AI 瞬间给出了项目的真实 PRD 和架构分析，甚至指出了几个死循环依赖。接单侠直接开始降维修 Bug。

## 4. 未来演进与企业级辐射 (Phase 4 Roadmap)
当个人开发者在项目中深度依赖 `.aictx` 目录后，该目录会随着 Git Push 流入企业级代码库：
- **CI/CD 防腐拦截**: 在流水线挂载 `aictx doctor`，如果检测到团队中有成员（或他的 AI 助手）试图写出违背架构红线的代码，直接阻断合并。
- **跨团队规范同步**: 支持 `aictx sync --remote` 从公司的统一 Meta-Repo 远端拉取架构规约。
