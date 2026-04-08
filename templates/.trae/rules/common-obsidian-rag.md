---
tags:
  - common
  - global
alwaysApply: false
description: 任何项目中创建、重构或修改的架构规范或业务要求 Markdown (`.md`) 文件
---
# Obsidian RAG 文档规范 (Obsidian RAG Standard)

> **适用范围**: 
> 任何项目中创建、重构或修改的架构规范或业务要求 Markdown (`.md`) 文件。

## 1. 强制 YAML Frontmatter
所有文档必须包含以下元数据头部，以优化 RAG 检索权重：
```yaml
---
tags:
  - 业务领域 (如: #调度, #财务, #询价)
  - 文档类型 (如: #PRD, #技术方案)
aliases:
  - [同义词, 简称]
entities:
  - [涉及的 Prisma Model 名]
roles:
  - [涉及的 UserRole 枚举名]
---
```

## 2. 知识原子化 (Atomic Notes)
- **单一职责**: 一个文档只讲一个核心业务逻辑或模块。
- **长度限制**: 严禁输出超过 1500 行的文档。如果逻辑过于复杂，必须采用 `MOC (Map of Content)` 结构进行拆分。
- **结论先行**: 核心业务规则 (Final Rules) 必须置于文档前半部分，复杂的“推演过程”或“备选方案”必须使用 Obsidian 的折叠块 (`<details>`) 或剥离到子文档。

## 3. 关联性与术语 (Linking & Terms)
- **双向链接**: 提及跨模块逻辑时，必须使用 `[[文档名]]` 或 `[显示文本](./相对路径.md)` 进行链接。
- **术语对齐**: 严禁发明新词，必须严格对齐 `schema.prisma` 中的模型名 (如 `Quote`, `SubOrder`, `Trip`)。
- **状态描述**: 状态流转必须与代码中的 `Enum` 保持 100% 同步。

## 4. RAG 优化排版
- **列表化**: 核心规则优先使用无序列表 `-`。
- **代码块标识**: 涉及 Prisma Schema 或 JSON 结构时，必须带上对应的语言标签。
- **禁止废话**: 移除所有 AI 常见的客套话（如 "当然，我为你准备了..."），直接输出结构化文档。