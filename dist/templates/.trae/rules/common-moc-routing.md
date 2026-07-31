---
tags:
  - common
  - global
alwaysApply: true
description: MOC 路由优先规则，要求先用 aictx route 定位原子文档，避免盲目全局检索
---
# MOC 路由优先规则

当任务涉及产品需求、业务规则、技术架构、领域模型、项目计划或历史决策时，AI 必须优先使用 aictx 的 MOC 路由体系，而不是直接全局搜索文档。

## 强制流程

1. **先读索引**：优先阅读 `aictx-docs/**/00-Index.md` 中的 MOC 路由表，理解当前文档地图。
2. **再执行路由**：根据用户问题运行：

```bash
aictx route "<用户问题>"
```

3. **按顺序阅读候选文档**：优先阅读 `aictx route` 返回的前 1-3 个原子文档。
4. **最后才扩大检索**：只有当 MOC 路由没有命中，或候选文档明确不足时，才允许使用全局搜索，并需要说明原因。
5. **修改后重建索引**：如果新增、删除、移动文档，或修改了 `tags`、`entities`、`aliases`、`description` 等 frontmatter，必须运行：

```bash
aictx index
```

## 判断标准

- 如果问题能被 MOC route 命中，不要读取整个 `aictx-docs`。
- 如果多个文档同名，以 `aictx route` 输出的 `Path` 为准，不要只凭 `[[文件名]]` 猜测。
- 回答中应说明已参考的路由文档路径。
