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

**aictx-cli** (AI Context CLI) is the **Context as Code (CaC)** infrastructure designed for modern engineering teams. It transforms implicit team knowledge—such as architectural conventions, business boundaries, and coding styles—into explicit context that Large Language Models (LLMs/Agents) can precisely understand and strictly follow. This completely resolves the three major pain points of AI coding tools: "frequent hallucinations," "architecture degradation," and "repetitive error correction."

---

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=CLI+Demo+Animation+(Asciinema)" alt="aictx-cli demo" />
</div>

## 💡 Why aictx?

In the era of AI-Assisted Engineering, the biggest bottleneck for R&D teams is no longer the speed of code generation, but rather **"how to make AI write code that meets the current project architecture and business expectations."** Without constraints, AI-generated code often brings "frequent hallucinations," "architecture degradation," and "lost conventions."

By introducing the **Context as Code (CaC)** philosophy, aictx embeds implicit knowledge directly into the codebase, delivering an immediate leap in efficiency for both teams and individual developers.

### 🏢 For R&D Teams (Team)
- **Unify AI Technical Architecture**: Codify architecture rules, business boundaries, and API styles as CaC rules. Solves the core pain point of "10 AI assistants writing 10 different architectures" within a team. No matter how many new hires join, the AI assistant will strictly block non-compliant code generation, ensuring architecture stability at the source.
- **Stop "Trial and Error"**: Core architects only need to write a rule once (e.g., `project-aictx-prd.md`). With one click, it syncs to the local IDEs of all team members, ensuring **100% knowledge alignment** across the organization and completely eliminating the risk of production incidents caused by LLM hallucinations.
- **Enforce SSOT (Single Source of Truth)**: The built-in conflict resolution engine (`resolve`) deeply scans for contradictory business descriptions within the team, preventing the LLM from becoming "schizophrenic" due to context conflicts.

### 🧑‍💻 For Individual Developers (Developer)
- **Balance Extremely Low Tokens with Zero Hallucinations**: Say goodbye to the inefficient and expensive "global search" approach of traditional AI tools. The built-in MOC routing mechanism allows LLMs to navigate precisely to atomic documents with minimal token consumption, achieving a "low-cost, zero-hallucination" context feed.
- **Say Goodbye to "Explaining to AI"**: No more pasting lengthy Prompts every time you open Trae / Cursor / Claude Code. Run `aictx sync`, and the IDE instantly "gets you," slashing communication costs by 40%.
- **Save Tokens, Prevent Overload**: Intelligent context assembly and warnings (`doctor`) prune irrelevant rules on demand to prevent Context Bloat. This not only makes AI respond faster but also avoids wasting expensive long-context Tokens.
- **Out of the Box, Zero Intrusion**: Mount AI armor onto your project with a single command, completely without polluting your existing business logic.

## ✨ Core Features

- 🧩 **One-Click Sync, Out of the Box**
  Automatically fetch, assemble, and inject the latest AI context rules into your project. Supports custom RAG knowledge bases on demand.
- 🗂️ **MOC Routing & Anti-Context Bloat (Index)**
  Automatically scans Markdown Frontmatter to generate a Map of Content routing table based on bi-directional links, putting an end to expensive AI "global searches".
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

aictx aims to become the "Kubernetes" of the AI-Assisted Engineering era. Core evolution directions include:

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
