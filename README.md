<div align="center">
  <h1>aictx-cli 🧠</h1>
  <p><b>Context as Code (CaC) CLI for AI-Assisted Engineering</b></p>
  <p><i>Stop fighting the AI. Start engineering its context.</i></p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/aictx.svg)](https://www.npmjs.com/package/aictx)
[![Build Status](https://github.com/kings2017/aictx-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/kings2017/aictx-cli/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

<p align="center">
  <b>简体中文</b> | <a href="./README_EN.md">English</a>
</p>

<br />

**aictx-cli** (AI Context CLI) 是专为 AI 辅助编程时代打造的 **Context as Code (CaC)** 基础设施。它就像是给大模型（LLM）装上了一台高精度的“外脑导航仪”。

我们只解决一个极其致命的痛点：**如何用最抠门的 Token 消耗，彻底锁死 AI 的幻觉，让它永远不偏离你的业务红线？**
无论你是追求极客效率的独立开发者，还是需要统一架构规约的 Tech Lead，aictx 都能通过独创的 **MOC (Map of Content) 双链路由**，强制 AI 优先读取标准架构图纸。它能让 AI 助手告别“全库瞎找”和“自由发挥”，**确保写出的代码与你的业务文档始终保持 100% 的一致性。**

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 为什么需要 aictx？

在 AI 辅助工程时代，开发者最大的瓶颈不再是代码产出速度，而是**“如何低成本地让 AI 写出符合当前项目架构和业务预期的代码”**。

当前市面上面临着一个死局：如果放任 AI 自由发挥，往往伴随着“幻觉频发”与“架构破坏”；如果为了约束 AI 而向大模型“倾倒”大量全局上下文，又会导致 Token 消耗爆炸，且 AI 容易因为上下文过载（Context Bloat）而丢失重点。

aictx 破解了这一死局，为**个人开发者**与**研发团队**带来了立竿见影的效能跃升：

### 🎯 极低 Token 与极低幻觉的平衡
彻底抛弃传统 AI 工具低效且昂贵的“全局检索”或“全量 RAG”方案。aictx 内置基于 Markdown Frontmatter 的 MOC 路由机制，让大模型只需读取几十行的轻量级索引表，就能顺藤摸瓜精准命中所需的原子化文档。**在节约 80% 长文本 Token 消耗的同时，实现“低成本、零幻觉”的上下文精准喂给。**

### 🧑‍💻 对于独立开发者 (Individual)
- **告别“向 AI 反复解释”**：无需在每次打开 Trae / Cursor / Claude Code 时重复粘贴长篇大论的 Prompt 或手动附加大量文档。执行 `aictx sync`，IDE 瞬间“懂你所想”，沟通成本直降 40%。
- **开箱即用，零侵入**：只需一行命令即可为项目挂载 AI 防护装甲，完全不污染现有业务代码逻辑。

### 🏢 对于研发团队 (Team)
- **统一 AI 技术架构**：解决团队中“10 个 AI 助手写出 10 种不同架构”的核心痛点。无论团队涌入多少新人，AI 助手都会严格拦截不合规的代码生成，从源头保证架构不崩塌。
- **强制 SSOT (单点真实源)**：内置的冲突监测与消解引擎 (`resolve`)，能深度扫描项目中矛盾的业务描述，杜绝大模型因上下文冲突而产生的“精神分裂”。

## ✨ 核心特性

- 🗂️ **终结幻觉：极低 Token 与精准路由 (MOC Index)**
  内置基于 Markdown Frontmatter 的 MOC (Map of Content) 路由机制。大模型只需读取几十行的索引表，即可通过双向链接精准跳读目标原子文档。**彻底抛弃昂贵且低效的“全局检索”，在节约 80% Token 消耗的同时，将 AI 幻觉率降至冰点。**
- 🧩 **一键同步，开箱即用 (Sync)**
  自动拉取、组装并向项目注入最新的 AI 上下文规则，支持按需定制你的 RAG 知识库。
- 🛡️ **本地健康诊断 (Doctor)**
  智能诊断本地规则的健康度和 Token 消耗水位，提前预警“污染”和超载风险。
- ⚖️ **冲突监测与消解 (Resolve)**
  深度扫描业务红线与上下文重叠区，交互式引导团队解决规范冲突，保证 SSOT（单点真实源）。
- 📊 **可视化数据底盘 (Info)**
  提供核心指标面板，清晰掌握团队 AI 规范的覆盖率与渗透情况。
- 🚀 **极简接入，零侵入**
  无需更改现有业务代码，只需一行命令即可为项目装备上 AI 防护装甲。

## 🚀 快速开始

### 1. 安装

作为全局工具安装：
```bash
npm install -g aictx
# 或使用 pnpm/yarn
pnpm add -g aictx
```

### 2. 初始化配置

在你的项目根目录下执行：
```bash
aictx init
```
*这将会生成 `.aictx` 配置文件，并引导你完成基础的 RAG 挂载点设置。*

### 3. 同步团队规则

一键拉取并注入团队最新的上下文规范：
```bash
aictx sync
```

## 🛠️ CLI 命令一览

| 命令 | 描述 | 适用场景 |
|---|---|---|
| `aictx init` | 初始化 aictx 配置与文档目录 | 新项目接入 CaC 体系 |
| `aictx sync` | 同步并组装 AI 上下文规则 | 获取团队最新架构规约 |
| `aictx index`| 编译生成 MOC 双链路由表 | 当新建或修改文档后，刷新 AI 检索索引 |
| `aictx doctor` | 诊断本地规则与 Token 健康度 | 排查 AI 上下文“污染”或超载 |
| `aictx resolve`| 交互式解决业务上下文冲突 | 发现多个规则描述了同一业务边界时 |
| `aictx info` | 展示 aictx 核心指标大盘 | 洞察团队规范落地情况 |

> 输入 `aictx <command> --help` 可查看任何命令的详细用法。

## 🏗️ 架构愿景 (Roadmap)

aictx 致力于成为 AI 辅助编程时代的标准基础设施。无论是帮助**全栈开发者**实现低 Token 的本地个人知识库闭环，还是帮助**中大型团队**实现架构一致性，我们的演进方向包括：

- [x] **Phase 1: CLI 基础设施搭建** (当前阶段)
  - 核心指令脚手架 (`init`, `sync`, `index`, `doctor`, `resolve`, `info`)
  - 跨平台兼容构建
  - 自动 MOC 双链索引机制
- [ ] **Phase 2: 规则解析与组装器引擎**
  - 支持多源（Git, Local, HTTP）规则拉取
  - AST 级别项目特征嗅探与动态 Context 注入
- [ ] **Phase 3: IDE 与工作流深度集成**
  - Trae / Cursor 插件无缝挂载
  - CI/CD 流水线拦截与卡点

## 🤝 参与贡献

我们非常欢迎来自社区的贡献！无论是提出 Issue、提交 PR，还是分享你在 Context as Code 方面的最佳实践。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起一个 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
