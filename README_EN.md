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
  <a href="./README.md">简体中文</a> | <b>English</b>
</p>

<br />

**aictx-cli** (AI Context CLI) is the **Context as Code (CaC)** infrastructure built for the AI-Assisted Programming era. Think of it as a high-precision "external brain navigator" for Large Language Models (LLMs).

We solve one critical, fatal pain point: **How to completely lock out AI hallucinations while burning the stingiest amount of Tokens, ensuring the AI never deviates from your business logic?**
Whether you are a solo indie hacker obsessed with efficiency or a Tech Lead enforcing architecture conventions, aictx uses its proprietary **MOC (Map of Content) bi-directional routing** to force the AI to prioritize standard architecture blueprints. It stops your AI from "blindly searching the whole repo" or "free-styling," **ensuring that the generated code remains 100% consistent with your business documents at all times.**

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 Why aictx?

In the era of AI-Assisted Engineering, the biggest bottleneck for developers is no longer the speed of code generation, but rather **"how to low-costly make AI write code that meets the current project architecture and business expectations."**

The current market faces a deadlock: if AI is allowed to free-style, it often brings "frequent hallucinations" and "architecture degradation"; if you "dump" massive global context into the LLM to constrain it, Token consumption explodes, and the AI easily loses focus due to Context Bloat.

aictx breaks this deadlock, bringing immediate efficiency leaps to both **individual developers** and **R&D teams**:

### 🎯 Balance Extremely Low Tokens with Zero Hallucinations
Completely abandons the inefficient and expensive "global search" or "full RAG" approach of traditional AI tools. aictx's built-in MOC routing mechanism based on Markdown Frontmatter allows LLMs to navigate precisely to required atomic documents by simply reading a lightweight index table of a few dozen lines. **Reduces long-context Token consumption by 80% while achieving a "low-cost, zero-hallucination" precise context feed.**

### 🧑‍💻 For Individual Developers (Individual)
- **Say Goodbye to "Explaining to AI"**: No more pasting lengthy Prompts or manually attaching tons of documents every time you open Trae / Cursor / Claude Code. Run `aictx sync`, and the IDE instantly "gets you," slashing communication costs by 40%.
- **Out of the Box, Zero Intrusion**: Mount AI armor onto your project with a single command, completely without polluting your existing business logic.

### 🏢 For R&D Teams (Team)
- **Unify AI Technical Architecture**: Solves the core pain point of "10 AI assistants writing 10 different architectures" within a team. No matter how many new hires join, the AI assistant will strictly block non-compliant code generation, ensuring architecture stability at the source.
- **Enforce SSOT (Single Source of Truth)**: The built-in conflict resolution engine (`resolve`) deeply scans for contradictory business descriptions within the team, preventing the LLM from becoming "schizophrenic" due to context conflicts.

## ✨ Core Features

- 🗂️ **Zero Hallucinations: Extremely Low Tokens & Precise Routing (MOC Index)**
  Built-in Map of Content (MOC) routing mechanism based on Markdown Frontmatter. LLMs only need to read a few dozen lines of the index table to precisely jump to target atomic documents via bi-directional links. **Completely abandons expensive and inefficient "global searches", reducing token consumption by 80% while bringing AI hallucinations down to freezing point.**
- 🧩 **One-Click Sync, Out of the Box**
  Automatically fetch, assemble, and inject the latest AI context rules into your project. Supports custom RAG knowledge bases on demand.
- 🛡️ **Local Health Diagnosis (Doctor)**
  Intelligently diagnose the health of local rules and token consumption levels, providing early warnings for context "pollution" and overload risks.
- ⚖️ **Conflict Resolution (Resolve)**
  Deeply scan business boundaries and context overlaps, interactively guiding the team to resolve rule conflicts and ensure SSOT (Single Source of Truth).
- 📊 **Visual Data Dashboard (Info)**
  Provides a core metrics dashboard to clearly monitor the coverage and penetration of your team's AI conventions.
- 🚀 **Minimal Integration, Zero Intrusion**
  No changes to existing business code required. Equip your project with AI armor using just a single command.
- 🌐 **Built-in i18n (English/Chinese)**
  Default English output with seamless switching to Simplified Chinese during initialization. Perfectly fits global teams.

## 🚀 Quick Start

### 1. Installation

Install globally:
```bash
npm install -g aictx
# or using pnpm/yarn
pnpm add -g aictx
```

### 2. Initialize Configuration

Run in your project root:
```bash
aictx init
```
*This will generate an `.aictx` configuration file and guide you through basic RAG mount point settings.*

### 3. Sync Team Rules

Fetch and inject the latest team context conventions with one click:
```bash
aictx sync
```

## 🛠️ CLI Commands

| Command | Description | Scenario |
|---|---|---|
| `aictx init` | Initialize config & doc directories | Integrate CaC into a new project |
| `aictx sync` | Sync and assemble AI context rules | Get the latest team architecture conventions |
| `aictx index`| Compile MOC bi-link routing table | Rebuild AI index after docs are created/modified |
| `aictx doctor` | Diagnose local rules & token health | Troubleshoot AI context "pollution" or overload |
| `aictx resolve`| Interactively resolve context conflicts | When multiple rules describe the same business boundary |
| `aictx info` | Display aictx core metrics dashboard | Gain insights into team convention adoption |

> Run `aictx <command> --help` for detailed usage of any command.

## 🏗️ Architecture Roadmap

aictx is committed to becoming the standard infrastructure for the AI-Assisted Engineering era. Whether helping **solo full-stack developers** build low-token personal knowledge bases or empowering **mid-to-large teams** to achieve architecture consistency, our evolution roadmap includes:

- [x] **Phase 1: CLI Infrastructure Setup** (Current Phase)
  - Core command scaffold (`init`, `sync`, `index`, `doctor`, `resolve`, `info`)
  - Cross-platform compatible builds
  - Automatic MOC bi-link indexing mechanism
- [ ] **Phase 2: Rule Parser & Assembler Engine**
  - Support multi-source rule fetching (Git, Local, HTTP)
  - AST-level project feature sniffing & dynamic Context injection
- [ ] **Phase 3: Deep IDE & Workflow Integration**
  - Seamless Trae / Cursor plugin mounting
  - CI/CD pipeline interception and gating

## 🤝 Contributing

We welcome contributions from the community! Whether it's submitting Issues, creating PRs, or sharing your best practices with Context as Code.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
