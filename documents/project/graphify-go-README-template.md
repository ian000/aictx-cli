# Graphify-Go 🚀

**The blazing-fast, zero-dependency AST extractor and code relationship graph builder.**

A 1:1 Go rewrite of the original Python `graphify` engine, designed specifically to serve as the ultra-fast backend for [aictx-cli](https://github.com/kings2017/aictx-cli).

## 💡 Why Rewrite in Go?

The original Python version of Graphify was powerful but suffered from critical distribution issues:
- **Dependency Hell**: Required users to have Python 3.9+, pip, and complex libraries like `networkx` installed globally.
- **Performance Bottlenecks**: Extracting ASTs from 100k+ lines of code projects using Python could take tens of seconds and consume significant memory.
- **Integration Friction**: Node.js CLI tools calling Python scripts natively cross-platform is a nightmare.

**Graphify-Go solves all of this:**
- **Zero Dependencies**: Compiled down to a single binary (`.exe`, ELF, Mach-O). No Python, no pip, no C-compilers required on the user's machine.
- **Blazing Fast**: Powered by `tree-sitter` (via `go-tree-sitter`) and Go's native concurrency (goroutines). Extracts codebases 10x-50x faster.
- **Drop-in Replacement**: Produces the exact same `graph.json` format as the Python version, ensuring 100% compatibility with the `aictx-cli` ecosystem.

## 🏗️ Architecture Guardrails

We adhere strictly to the following principles:

1. **Strict Output Compatibility**: The JSON output and Markdown reports must be pixel-perfect identical to the Python version.
2. **Static Linking Only**: All C-code (tree-sitter parsers) must be statically linked via `cgo`. The final binary must be entirely standalone.
3. **IPC via File System / Stdout**: No complex gRPC/HTTP overhead. The engine runs as a hidden subprocess, takes CLI arguments, and outputs standard JSON to the file system.

## 🛠️ Supported Languages (Tree-sitter Parsers)

Phase 1 MVP targets:
- [ ] JavaScript / TypeScript
- [ ] Python
- [ ] Go
- [ ] Rust
- [ ] Java
- [ ] C / C++

## 🚀 Development

### Prerequisites
- Go 1.21+
- GCC (for cgo compilation of tree-sitter)

### Setup
```bash
git clone https://github.com/kings2017/graphify-go.git
cd graphify-go
go mod download
```

## 📄 License
MIT License
