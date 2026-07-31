<div align="center">
  <h1>aictx-cli 🧠</h1>
  <p><b>Context as Code (CaC) CLI for AI-Assisted Engineering</b></p>
  <p><i>Stop fighting the AI. Start engineering its context.</i></p>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/aictx-cli.svg)](https://www.npmjs.com/package/aictx-cli)
[![Build Status](https://github.com/ian000/aictx-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/ian000/aictx-cli/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

<p align="center">
 <a href="./README.md">English</a> |   <a href="./README_CN.md">简体中文</a>  
</p>

<br />

**aictx-cli** (AI Context CLI) is the **Context as Code (CaC)** infrastructure built for the AI-Assisted Programming era (Codex, Trae, Cursor, Windsurf, OpenCode, Claude Code, etc.). It represents a unique implementation of the emerging **"Harness Engineering"** philosophy. Think of it as a high-precision "external brain navigator" for Large Language Models (LLMs).

We are dedicated to providing three core infrastructure capabilities for the AI-Assisted Programming era:
1. **🌍 Cross-Device & Cross-IDE Sync**: Whether you use Codex, Trae, Cursor, Windsurf, OpenCode, or Claude Code, a single set of architecture Rules and local Skills can be compiled and dynamically injected into all your terminals with one click, completely ending the disaster of "different AIs writing in different styles."
2. **💰 Extreme Cost Reduction & Anti-Hallucination**: Stop making AI blindly read hundreds of thousands of lines of legacy code. The pure local AST engine extracts highly concentrated physical topology summaries. Combined with the MOC (Map of Content) bi-directional routing, Token consumption drops by 90%, eliminating AI hallucinations at the source.
3. **🛡️ Architecture Anti-Corruption & Red-Line Blocking**: Codify your business boundaries and core logic. When the new prompt received by the IDE conflicts with the existing system architecture, it automatically triggers a "business red line" soft interception or hard block, forcing the AI to correct the plan or synchronously update the documentation, ensuring the project evolution does not corrupt.

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
- **Say Goodbye to "Explaining to AI"**: No more pasting lengthy Prompts or manually attaching tons of documents every time you open Trae, Cursor, Windsurf, Codex, OpenCode, or Claude Code. Run `aictx sync`, and the IDE instantly "gets you," slashing communication costs by 40%.
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
npm install -g aictx-cli
# or using pnpm/yarn
pnpm add -g aictx-cli
```

### 2. Initialize Configuration

Run in your project root:
```bash
aictx init
```
This will generate `aictx.json`, scaffold `aictx-docs/`, and inject the selected IDE workspace rules.

For an existing JavaScript, TypeScript, Python, or Go project, run Brownfield onboarding directly. Codex is the default; use `--ide` to select one or more tools:
```bash
aictx init --onboard
aictx init --onboard --yes --ide claude
aictx init --onboard --yes --ide codex,claude
```

Generated files follow each tool's native conventions, including `AGENTS.md` + `.agents/*` for Codex, `CLAUDE.md` + `.claude/*` for Claude Code, and the corresponding `.cursor`, `.windsurf`, or `.trae` rule directories.

If you already have a PRD and architecture document, initialize directly from them:
```bash
aictx init --from-prd ./docs/prd.md --from-arch ./docs/tech-stack.md
```

If you only have the PRD but already know the target stack, provide an architecture summary inline:
```bash
aictx init --from-prd ./docs/prd.md --arch "Frontend Vue 3 + Vite, Backend NestJS, DB PostgreSQL, Deploy Docker Compose + Nginx"
```

This will import the source docs into `aictx-docs/product` and `aictx-docs/architecture`, then generate a bootstrap TODO under `aictx-docs/project`.

By default, `aictx init` also scaffolds npm Trusted Publisher release assets:

- `.github/workflows/npm-publish.yml`: GitHub Actions OIDC workflow for `npm publish --provenance`
- `aictx-docs/project/npm-trusted-publisher-release.md`: npm package settings and release checklist

Use `aictx init --no-npm-publish-workflow` when the project is not an npm package.

### 3. Sync Team Rules

Fetch, assemble, and inject the latest team context conventions with one command:
```bash
aictx sync
```

`aictx sync` is the command that keeps your AI coding tool aligned with the project's Context as Code source of truth. It reads `aictx.json` from the current project root, copies built-in/local/remote rules into `.aictx-cache`, filters Markdown rule files by `tags`, then writes the matched rules into the configured AI tool directories.

Minimal `aictx.json` example:
```json
{
  "version": "1.0",
  "repository": "builtin",
  "ides": ["codex"],
  "tags": ["backend", "frontend", "common"]
}
```

Rule files are Markdown files with frontmatter tags:
```md
---
tags:
  - common
  - backend
---
# API Architecture Rules
```

Repository modes:

- `repository` omitted, empty, or `builtin`: use the built-in aictx best-practice rules.
- Local path, such as `../aictx-rules`: copy rules from a local directory.
- Git URL, such as `git@github.com:your-org/aictx-meta-repo.git`: clone a snapshot of the remote rules.

Generated targets:

- Codex: `AGENTS.md`, `.agents/workflows/aictx-*.md`, `.agents/skills/*`
- Claude Code: `CLAUDE.md`, `.claude/rules/aictx-*.md`, `.claude/skills/*`
- Cursor: `.cursor/rules/aictx-*.mdc`
- Windsurf: `.windsurf/rules/aictx-*.md`
- Trae: `.trae/rules/aictx-*.md`

`aictx sync` only manages files with the `aictx-` prefix in those rule directories. User-owned custom rules without that prefix are preserved.

### 4. Route Before Reading Docs

Compile MOC tables after creating or changing project documents:
```bash
aictx index
```

`aictx index` updates every `00-Index.md` containing `<!-- aictx-index-start -->` with a route table that includes the document path, tags, entities, aliases, last updated date, and description.

Before asking an AI assistant to inspect product, architecture, or project docs, route the question first:
```bash
aictx route "How does checkout payment work?"
```

The command ranks atomic documents from `aictx-docs/**/00-Index.md` metadata so the assistant can read the top matches before falling back to global search.

## 🛠️ CLI Commands

> **Design Philosophy: Invisible CLI**
> aictx advocates reducing developers' cognitive load. The vast majority of commands are automatically invoked by AI assistants or silently triggered via engineering hooks. Humans only need to intervene during initialization or conflict resolution.

| Command | Description | Trigger Method (Scenario) |
|---|---|---|
| `aictx init` | Smart Wizard (Supports Greenfield & Brownfield reverse eng.) | **👤 Manual** (Only once when adopting aictx framework) |
| `aictx info` | Display anti-corruption & token savings dashboard | **👤 Manual** (On-demand insights into team convention adoption) |
| `aictx resolve`| Interactively resolve context conflicts | **👤 Manual** (Intervene when multiple rules describe the same boundary) |
| `aictx plan` | Generate architecture change intent & task list | **🤖 AI Auto** (Before writing code for new requirements) |
| `aictx apply` | Execute code changes & solidify knowledge base | **🤖 AI Auto** (After human reviews the plan) |
| `aictx index`| Compile MOC bi-link routing table | **🤖 AI Auto** (Rebuild AI index after docs are modified) |
| `aictx route "<question>"` | Rank atomic docs from the MOC route table | **🤖 AI Auto** (Before reading docs or doing broad search) |
| `aictx sync` | Sync, assemble, and inject AI context rules | **🪝 Hook Silent** (Recommended to bind to `postinstall`) |
| `aictx doctor` | Diagnose local rules drift & token health | **🪝 Hook Silent** (Recommended to bind to Git `pre-commit`) |

> Run `aictx <command> --help` for detailed usage of any command.

## 📝 Version Updates

Every package release should update this section before publishing to npm.

### Unreleased

No changes yet.

### v1.6.4 - 2026-08-01

- Added a built-in user communication rule that leads with outcomes, removes unnecessary process narration, and reports only verified results.
- Added conditional sub-agent orchestration rules so work is delegated only when the host supports it and parallelism has a clear benefit, with final review owned by the primary agent.
- Updated the global communication language rule to follow the user's current language, while honoring an explicitly requested language.

### v1.6.3 - 2026-08-01

- Added a built-in common graph freshness rule: when graph data is stale, agents must regenerate the project graph before making architecture or codebase-relationship judgments.
- Made MOC routing actionable with richer `aictx index` tables and a new `aictx route "<question>"` command for selecting atomic docs before global search.

### v1.6.2 - 2026-08-01

- Hardened `aictx sync` so generated IDE rule files converge to the latest tag-filtered result instead of leaving stale `aictx-*` files behind.
- Made rule fetching safer by staging built-in, local, and Git snapshots before replacing `.aictx-cache`, preserving the previous cache when fetch fails.
- Preserved nested rule source paths and generated collision-resistant output filenames.
- Added stricter `aictx.json` validation for `ides`, `tags`, and `repository`.
- Expanded README documentation for `aictx sync` usage, rule format, repository modes, and generated targets.

### v1.6.1

- Fixed Brownfield onboarding command execution so async CLI actions are awaited correctly.
- Added Codex-first initialization defaults and IDE-specific workspace scaffolding.
- Updated bundled `graphify-go` dependency to the fixed release used by `aictx init --onboard`.

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
  - Seamless Trae / Cursor / Windsurf / Codex / OpenCode / Claude Code plugin mounting
  - CI/CD pipeline interception and gating

## 🤝 Contributing

We welcome contributions from the community! Whether it's submitting Issues, creating PRs, or sharing your best practices with Context as Code.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Release process and policy: [RELEASING.md](./RELEASING.md)

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
