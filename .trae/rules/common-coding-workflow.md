---
alwaysApply: false
description: 所有的后端 API 变更、ORM Schema 变更、以及核心前端组件的逻辑重构。
---
# 编码与文档同步工作流 (Code-Doc Sync Standard)

> **适用范围**: 
> 任何项目中的后端 API 变更、ORM Schema 变更、以及核心前端组件的逻辑重构。

## 1. 代码即唯一事实来源 (SSOT)
- **禁止在文档中重复定义表结构**: 对于 `schema.prisma` (或任何 ORM 配置文件) 中已定义的 `Model`, `Enum`, `Field` 的长度/类型等细节，**严禁**在任何业务或技术 `.md` 文档中重复枚举。
- 文档只负责描述“为什么这么设计 (Why)”和“机制流转 (How)”，具体的值一律指向代码。

## 2. 强制文档驱动开发 (Docs-First Driven Development)
> **铁律：绝不允许“无证驾驶”！代码永远不能走在产品定义和架构设计的前面。**

当引入新需求、新特性或进行核心业务重构时，AI (Trae) **绝不能直接更新文档或编写代码**，必须严格按照以下顺序执行：
0. **前置确认**：必须先询问开发者（如：“确定要增加这个新需求吗？”），在得到明确的**肯定答复**后，方可继续执行后续步骤。
1. **遵循标准目录**：所有的架构和产品文档必须严格存放在 `aictx` 初始化的标准目录下 (`documents/product`, `documents/architecture`, `documents/project`)。
2. **更新产品需求文档 (PRD)**：在 `documents/product/` 目录下明确业务目标、核心价值和功能模块。
3. **更新技术架构设计**：在 `documents/architecture/` 目录下补充或修改技术方案、命令设计和模块划分。
4. **编码实现**：在上述文档（SSOT）确认无误后，方可进行代码编写。
5. **宣发与 README 更新**：最后一步才是根据已经实现并经过文档背书的特性，更新对外展示的 `README.md` 或其他宣发材料。
**严禁在没有确认需求或缺乏文档支撑的情况下直接编写代码或修改 README。**

## 3. 强制 MOC 路由与禁止全局检索 (MOC Routing)
> **铁律：禁止使用全局检索 (SearchCodebase/Glob) 来盲目寻找业务文档！这会引发 Token 爆炸。**

当 AI 需要查找特定业务领域的文档（如寻找订单流转逻辑、鉴权方案）时，必须：
1. **读取索引表**: 直接读取该领域下的 `00-Index.md` (如 `documents/product/00-Index.md`)。
2. **顺藤摸瓜**: 通过 `00-Index.md` 中表格记录的双向链接 (`[[xxx]]`) 和 Entities 描述，精准定位到目标原子文档，然后再去读取该文件。
3. **后置编译**: 当你在 `documents/` 下创建了新的 Markdown 文件，或者修改了旧文件的 YAML Frontmatter (如 Entities, Aliases) 后，**必须强制执行 `aictx index`** 命令，以重新编译 MOC 路由表，确保索引不过期。

## 4. 强制后置文档修正机制 (Mandatory Post-Update)
在每次完成 Bug 修复或细节逻辑的优化后，AI (Trae) **必须主动**执行以下三步检查：
1. **定位受影响文档**: 在标准的 `documents/` 子目录下（如 `documents/product/`, `documents/architecture/`）检索与本次代码变更相关的关键字（如状态名、字段名、公式名）。
2. **对比陈旧信息**: 检查搜索出的 Markdown 文档中的业务流转描述或定价机制是否与刚刚修改的代码产生冲突（Drift）。
3. **主动覆写**: **必须立刻**使用工具，将检索出且过时的文档内容修正为与代码一致的最新状态。

## 5. RAG 知识库防腐化 (Anti-Decay)
- 当业务需求发生根本性变更时，在编写代码前，必须先在标准的 `documents/` 目录结构中创建或更新对应的产品/技术文档，并打上正确的 Obsidian YAML 标签（如 `tags`, `entities`）。
- **文档先行，代码跟上**：在处理架构级重构时，优先更新当前项目的 **Tech MOC (技术架构根节点)** 和 **Product MOC (产品根节点)** 的双向链接，确保新旧交替不断链。