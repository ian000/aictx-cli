<div align="center">
  <h1>aictx-cli 🧠</h1>
  <p><b>Context as Code (CaC) CLI for AI-Assisted Engineering</b></p>
  <p><i>Stop fighting the AI. Start engineering its context.</i></p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/aictx-cli.svg)](https://www.npmjs.com/package/aictx-cli)
[![Build Status](https://github.com/kings2017/aictx-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/kings2017/aictx-cli/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

<p align="center">
  <a href="./README.md">English</a> |   <a href="./README_CN.md">简体中文</a>  
</p>

<br />

**aictx-cli** (AI Context CLI) 是一款专为 AI 辅助编程（Trae/Cursor/Windsurf 等）打造的 **Context as Code (CaC)** 基础设施。它就像是给你的 AI 助手外接了一个永久记忆与防腐装甲。

我们致力于为 AI 编程时代提供三大核心基础设施能力：
1. **🌍 跨设备与跨 IDE 同步**：无论是 Cursor、Trae 还是 Windsurf，一份架构规则 (Rules) 与本地技能 (Skills)，一键编译并动态注入所有终端，彻底终结“不同 AI 写出不同风格”的灾难。
2. **💰 极致降本与抗幻觉**：不再让 AI 盲读十几万行旧代码。纯本地 AST 引擎提取高浓度物理拓扑摘要，结合 MOC (Map of Content) 双链路由，Token 消耗直降 90%，从根源上消除 AI 胡编乱造。
3. **🛡️ 架构防腐与红线拦截**：将业务边界与核心逻辑代码化。当 IDE 接收到的新提示词与既有系统架构发生冲突时，自动触发“业务红线”软拦截或硬阻断，强制 AI 修正方案或同步更新文档，确保项目演进不腐化。

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 为什么你需要 aictx？

无论你是追求极客效率的独立开发者，还是天天接外包修 Bug 的“接单侠”，aictx 都能带来物理级别的降维打击。

### 🥷 场景 A：独立黑客 (Indie Hacker) 的永久外脑
当你同时维护 3 个独立产品时，每次切换项目，AI 都会搞混技术栈。
有了 aictx，只需在根目录执行 `aictx sync`，你个人的数据库偏好、UI 组件库版本、API 封装规范瞬间无缝写入 Cursor/Trae 的底层配置。**AI 瞬间切换大脑，沟通成本直降 40%，接下来的每一行代码都完美契合该项目的架构。**

### 🌍 场景 B：跨 AI IDE 游牧者 (AI Nomad) 的统一底座
白天在公司用 Cursor（有团队额度），晚上回家用 Trae（因为免费），偶尔尝鲜 Windsurf。不同的 AI IDE 性格迥异，经常把同一个项目的代码风格写得四分五裂。
通过 aictx，你只需要维护一份核心架构规则，执行 `aictx sync` 就能**一键同时分发**到所有 IDE（`.cursorrules`, `.trae/rules` 等）。**无论用什么工具，AI 吐出的代码规范永远 100% 保持一致，彻底终结“不同 AI 写代码打架”的惨状。**

### 🛠️ 场景 C：外包接单侠 (Freelancer) 秒接盘“祖传屎山”
客户丢来一个 5 年历史、十几万行的屎山项目让你修 Bug。直接让 AI 看？不仅 Token 爆炸，还疯狂产生幻觉。
执行 `aictx init --onboard`。1 秒内，aictx 在**纯本地（零 Token、不泄露代码）**扫描提取出精准的物理依赖拓扑。再复制生成的“上帝提示词”给 AI，它就能瞬间给你出一份真实的 PRD 和架构分析。**让 AI 读高浓度摘要，而不是读全集，Token 消耗直降 90%。**

### 🏢 终极形态：绑架企业级架构 (Tech Lead)
当团队里的个人开发者因为用了 aictx 效率翻倍且从不犯错后，顺理成章将 `.trae/rules` 提交到 Git 仓库。从此，“10 个 AI 助手写出 10 种不同架构”的灾难被彻底终结，团队级 AI 架构实现了强制统一。

## ✨ 核心特性

- 🕵️ **逆向接盘神器 (Zero-LLM Onboarding)**
  专为棕地 (Brownfield) 项目设计。底层集成纯本地 Graphify AST 引擎，将十几万行代码压缩为千字物理拓扑图 (`system-graph.md`)。**零云端 API 调用、绝对隐私安全**，引导 IDE 完美反推现状，不再虚构重构计划。
- 🗂️ **极致抠门：MOC 双链路由 (Index)**
  内置基于 Markdown Frontmatter 的 MOC 路由机制。大模型只需读取几十行的索引表，就能顺藤摸瓜精准命中所需的原子化文档。彻底抛弃昂贵且低效的“全局检索”，榨干每一滴 Token 的价值。
- 🧩 **开箱即用，零侵入 (Context Assembler)**
  `aictx sync` 自动拉取你的模板，根据 `tags` 动态过滤，并一键注入到 Trae/Cursor/Windsurf 等 IDE。无需更改现有业务代码，只需一行命令即可为项目挂载 AI 防护装甲。
- ⚡ **让 AI 学会用工具 (IDE Skill Injection)**
  自动为项目挂载如 `aictx-graphify` (AST 本地查询) 等本地大模型 Skill。你只需对 AI 说“查一下依赖”，AI 就会自己调用本地引擎挖掘图谱。

## 🚀 快速开始

### 1. 安装

作为全局工具安装：
```bash
npm install -g aictx-cli
# 或使用 pnpm/yarn
pnpm add -g aictx-cli
```

### 2. 初始化配置

在你的项目根目录下执行：
```bash
# 全新项目 (Greenfield)
aictx init

# 存量老项目逆向接盘 (Brownfield) - 强烈推荐！
aictx init --onboard
```
*老项目会自动进行零模型 AST 提取，并生成 IDE 引导上帝提示词 (God Prompt)。*

### 3. 一键同步你的 AI 大脑

拉取并动态注入最新的上下文规范到当前 IDE：
```bash
aictx sync
```

## 🛠️ CLI 命令一览

> **设计哲学：无感化 (Invisible CLI)**
> aictx 提倡降低开发者的认知负担。绝大多数命令由 AI 助手自动调用或通过工程钩子静默触发。

| 命令 | 描述 | 触发方式 (适用场景) |
|---|---|---|
| `aictx init` | 智能向导初始化 (支持新项目与存量项目逆向接管 `--onboard`) | **👤 人类手动** (首次接入 aictx 时执行一次) |
| `aictx sync` | 解析、过滤并向 IDE 动态注入 AI 上下文规则 (Context Assembler) | **🪝 钩子静默 / 🤖 AI** (拉取最新规约时) |
| `aictx index`| 编译生成 MOC 双链路由表 | **🤖 AI 自动** (新建或修改文档后，刷新 AI 索引) |
| `aictx resolve`| 交互式解决业务上下文冲突 | **👤 人类手动** (发现多个规则描述同一边界时介入) |
| `aictx doctor` | 诊断本地规则漂移与 Token 健康度 | **🪝 钩子静默** (推荐绑定 Git `pre-commit` 钩子) |

> 输入 `aictx <command> --help` 可查看任何命令的详细用法。

## 🏗️ 架构愿景 (Roadmap)

aictx 致力于成为 AI 辅助编程时代的标准基础设施。无论是帮助**个人开发者**实现低 Token 的本地知识库闭环，还是帮助**研发团队**实现架构一致性：

- [x] **Phase 1: CLI 基础设施搭建** 
  - 核心指令脚手架 (`init`, `sync`, `index`, `doctor`, `resolve`, `info`)
  - 跨平台兼容构建
  - 自动 MOC 双链索引机制
- [x] **Phase 2: 规则解析与组装器引擎 (Context Assembler)**
  - 动态 YAML 解析与 `tags` 路由过滤
  - 存量项目零模型 AST 逆向提取 (Zero-LLM Onboarding)
  - 终端 God Prompt 动态拼装
- [x] **Phase 3: IDE 与工作流深度集成**
  - Trae / Cursor / Windsurf 原生配置注入 (`.trae/rules`, `.cursorrules` 等)
  - IDE 本地 Skill 智能生态融合 (`aictx-graphify`)
- [ ] **Phase 4: 企业级协同基建**
  - 支持多源（Git, Local, HTTP）规则拉取与远端分发
  - CI/CD 流水线防腐拦截与架构卡点

## 🤝 参与贡献

我们非常欢迎来自社区的贡献！无论是提出 Issue、提交 PR，还是分享你在 Context as Code 方面的最佳实践。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起一个 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
