---
tags:
  - aictx
  - architecture
  - generated
aliases:
  - [系统架构图谱, System Graph]
entities:
  - []
roles:
  - [AI Assistant]
---
# 系统架构拓扑审查 (System Architecture Report)

> **Context as Code 自动生成**: 本文档由 `aictx onboard` 底层调用 `graphify` 纯本地 AST 引擎生成，**全程未经过任何 LLM 幻觉处理**，代表了代码库最真实、最准确的物理依赖关系 (Single Source of Truth)。

## 核心业务节点 (God Nodes)
系统运行的核心中枢，这些组件被大量其他模块调用，修改时必须极其谨慎。


## 拓扑结构分析报告 (Topology Analysis)
# Graph Report - .  (2026-04-08)

## Corpus Check
- 59 files · ~76,452 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 359 nodes · 492 edges · 32 communities detected
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 162 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `_make_id()` - 23 edges
2. `_read_text()` - 16 edges
3. `_extract_generic()` - 15 edges
4. `detect()` - 10 edges
5. `OnboardEngine` - 8 edges
6. `_cross_file_surprises()` - 8 edges
7. `_fetch_webpage()` - 8 edges
8. `main()` - 8 edges
9. `ingest()` - 7 edges
10. `_is_file_node()` - 6 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (74): _csharp_extra_walk(), extract(), extract_c(), extract_cpp(), extract_csharp(), extract_elixir(), _extract_generic(), extract_go() (+66 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (30): classify_file(), convert_office_file(), count_words(), detect(), detect_incremental(), docx_to_markdown(), extract_pdf_text(), FileType (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (10): calculateHash(), ClaudeAdapter, ConfigParser, CursorAdapter, diagnoseDrift(), initI18n(), setLanguage(), TraeAdapter (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (24): _cross_community_surprises(), _cross_file_surprises(), _file_category(), god_nodes(), graph_diff(), _is_concept_node(), _is_file_node(), _node_community_map() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (20): attach_hyperedges(), _cypher_escape(), _html_script(), _html_styles(), _hyperedge_script(), push_to_neo4j(), Store hyperedges in the graph's metadata dict., Escape a string for safe embedding in a Cypher single-quoted literal. (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (21): _detect_url_type(), _download_binary(), _fetch_arxiv(), _fetch_html(), _fetch_tweet(), _fetch_webpage(), _html_to_markdown(), ingest() (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (18): _agents_install(), _agents_uninstall(), build_graph(), _check_skill_version(), claude_install(), claude_uninstall(), install(), _install_claude_hook() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (16): cache_dir(), cached_files(), check_semantic_cache(), clear_cache(), file_hash(), load_cached(), Save semantic extraction results to cache, keyed by source_file.      Groups n, SHA256 of file contents + resolved path. Prevents cache collisions on identical (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (13): _build_opener(), _NoFileRedirectHandler, Fetch *url* and return decoded text (UTF-8, replacing bad bytes).      Wraps s, Resolve *path* and verify it stays inside *base*.      *base* defaults to the, Strip control characters, cap length, then HTML-escape.      Applied to all no, Raise ValueError if *url* is not http or https, or targets a private/internal IP, Redirect handler that re-validates every redirect target.      Prevents open-r, Fetch *url* and return raw bytes.      Protections applied:     - URL scheme (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (12): build_graph(), cluster(), cohesion_score(), _partition(), Community detection on NetworkX graphs. Uses Leiden (graspologic) if available,, Ratio of actual intra-community edges to maximum possible., Build a NetworkX graph from graphify node/edge dicts.      Preserves original, Run Leiden community detection. Returns {community_id: [node_ids]}.      Commu (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (12): _git_root(), install(), _install_hook(), Remove graphify section from a git hook using start/end markers., Install graphify post-commit and post-checkout hooks in the nearest git repo., Remove graphify post-commit and post-checkout hooks., Check if graphify hooks are installed., Walk up to find .git directory. (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (9): _communities_from_graph(), _find_node(), _load_graph(), Start the MCP server. Requires pip install mcp., Reconstruct community dict from community property stored on nodes., Render subgraph as text, cutting at token_budget (approx 3 chars/token)., Return node IDs whose label or ID matches the search term (case-insensitive)., serve() (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.28
Nodes (8): _estimate_tokens(), print_benchmark(), _query_subgraph_tokens(), Token-reduction benchmark - measures how much context graphify saves vs naive fu, Print a human-readable benchmark report., Run BFS from best-matching nodes and return estimated tokens in the subgraph con, Measure token reduction: corpus tokens vs graphify query tokens.      Args:, run_benchmark()

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (7): build(), build_from_json(), Merge multiple extraction results into one graph.      Extractions are merged, assert_valid(), Validate an extraction JSON dict against the graphify schema.     Returns a lis, Raise ValueError with all errors if extraction is invalid., validate_extraction()

### Community 14 - "Community 14"
Cohesion: 0.36
Nodes (8): _community_article(), _cross_community_links(), _god_node_article(), _index_md(), Return (community_label, edge_count) pairs for cross-community connections, sort, Generate a Wikipedia-style wiki from the graph.      Writes:       - index.md, _safe_filename(), to_wiki()

### Community 15 - "Community 15"
Cohesion: 0.36
Nodes (1): OnboardEngine

### Community 16 - "Community 16"
Cohesion: 0.36
Nodes (7): _has_non_code(), _notify_only(), Watch watch_path for new or modified files and auto-update the graph.      For, Re-run AST extraction + build + cluster + report for code files. No LLM needed., Write a flag file and print a notification (fallback for non-code-only corpora)., _rebuild_code(), watch()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): graphify - extract · build · cluster · analyze · report.

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **126 isolated node(s):** `Graph analysis: god nodes (most connected), surprising connections (cross-commun`, `Invert communities dict: node_id -> community_id.`, `Return True if this node is a file-level hub node (e.g. 'client', 'models')`, `Return the top_n most-connected real entities - the core abstractions.      Fi`, `Find connections that are genuinely surprising - not obvious from file structure` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (2 nodes): `sync-graphify.js`, `sync()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `doctor.ts`, `doctorCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `graph.ts`, `graphCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `info.ts`, `infoCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `resolve.ts`, `resolveCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `sync.ts`, `syncCommand()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `report.py`, `generate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `tsup.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `aictx.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `en.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `zh.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `cli-ux.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `assembler.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `manifest.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OnboardEngine` connect `Community 15` to `Community 2`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `_make_id()` (e.g. with `_import_python()` and `_import_js()`) actually correct?**
  _`_make_id()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `_read_text()` (e.g. with `_resolve_name()` and `_import_python()`) actually correct?**
  _`_read_text()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `_extract_generic()` (e.g. with `_make_id()` and `extract_python()`) actually correct?**
  _`_extract_generic()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `detect()` (e.g. with `_load_graphifyignore()` and `str`) actually correct?**
  _`detect()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Graph analysis: god nodes (most connected), surprising connections (cross-commun`, `Invert communities dict: node_id -> community_id.`, `Return True if this node is a file-level hub node (e.g. 'client', 'models')` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._

## 约束建议 (AI Instructions)
1. 在修改任何涉及上述 `God Nodes` 的代码前，必须优先查询调用链路。
2. 本项目的基础架构强依赖于上述分析报告中的 Community 聚类关系，禁止跨社区发生循环依赖。
