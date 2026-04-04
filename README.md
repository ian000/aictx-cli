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

**aictx-cli** (AI Context CLI) 是专为现代研发团队打造的 **Context as Code (CaC)** 基础设施。它将团队的架构规约、业务红线、代码风格等隐性知识，转化为大模型（LLM/Agent）能够精准理解并严格遵循的显性上下文，从而彻底解决 AI 编程工具“幻觉频发”、“架构破坏”、“重复纠错”的三大痛点。

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 为什么需要 aictx？

在 AI 辅助工程时代，研发团队最大的瓶颈不再是代码产出速度，而是**“如何让 AI 写出符合当前项目架构和业务预期的代码”**。如果不加约束，AI 生成的代码往往伴随着“幻觉频发”、“架构破坏”与“规范丢失”。

aictx 通过引入 **Context as Code (CaC)** 理念，将隐性知识沉淀在代码库中，为团队和个人开发者带来直观的效率跃升。

### 🏢 对于研发团队 (Team)
- **终结“破窗效应”**：将架构规约、业务红线、命名风格写成 CaC 规则。无论团队涌入多少新人（或外包），AI 助手都会严格拦截不合规的代码生成，从源头保证代码质量。
- **告别“重复造轮子”**：核心架构师只需编写一次规则（如 `project-aictx-prd.md`），即可一键同步至全团队所有成员的本地 IDE，确保组织内知识 **100% 同步到达**，消除信息差。
- **强制 SSOT (单点真实源)**：内置的冲突监测与消解引擎 (`resolve`)，能深度扫描团队内部矛盾的业务描述，杜绝大模型因上下文冲突而产生的“精神分裂”。

### 🧑‍💻 对于个人开发者 (Developer)
- **告别“向 AI 反复解释”**：无需在每次打开 Trae / Cursor / Claude Code 时重复粘贴长篇大论的 Prompt。执行 `aictx sync`，IDE 瞬间“懂你所想”，沟通成本直降 40%。
- **省 Token，防超载**：智能的上下文组装与预警 (`doctor`)，能按需剔除不相关的规则，避免 Context Bloat。这不仅让 AI 响应更快，更避免了昂贵的长文本 Token 浪费。
- **开箱即用，零侵入**：只需一行命令即可为项目挂载 AI 防护装甲，完全不污染现有业务代码逻辑。

## ✨ 核心特性

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
- 🌐 **内置中英双语 (i18n)**
  默认英文输出，初始化时可一键切换为简体中文，完美融入全球化开发团队。

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
| `aictx init` | 初始化 aictx 配置 | 新项目接入 CaC 体系 |
| `aictx sync` | 同步并组装 AI 上下文规则 | 获取团队最新架构规约 |
| `aictx doctor` | 诊断本地规则与 Token 健康度 | 排查 AI 上下文“污染”或超载 |
| `aictx resolve`| 交互式解决业务上下文冲突 | 发现多个规则描述了同一业务边界时 |
| `aictx info` | 展示 aictx 核心指标大盘 | 洞察团队规范落地情况 |

> 输入 `aictx <command> --help` 可查看任何命令的详细用法。

## 🏗️ 架构愿景 (Roadmap)

aictx 旨在成为 AI-Assisted Engineering 时代的“Kubernetes”，核心演进方向包括：

- [x] **Phase 1: CLI 基础设施搭建** (当前阶段)
  - 核心指令脚手架 (`init`, `sync`, `doctor`, `resolve`, `info`)
  - 跨平台兼容构建
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
