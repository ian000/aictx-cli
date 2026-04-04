export const zh = {
  // init command
  'init.welcome': '欢迎使用 aictx - 初始化你的 Context as Code 配置',
  'init.select_lang': '请选择你的首选语言 (Please select your language)',
  'init.select_ide': '你的团队主要使用哪些 AI IDE / CLI 工具？',
  'init.enter_repo': '请输入团队远程 Meta-Repo 规则仓库地址 (可选，回车跳过)',
  'init.enter_tags': '请输入该项目的业务标签 (用逗号分隔，如: frontend, global)',
  'init.scaffold': '正在创建标准文档目录结构...',
  'init.success': '初始化成功！你现在可以运行 `aictx sync` 拉取上下文。',
  
  // sync command
  'sync.start': '开始同步上下文 (Context Sync)...',
  'sync.config_missing': '未找到 aictx 配置，请先执行 `aictx init`。',
  'sync.fetch.local': '正在从本地读取规则...',
  'sync.fetch.remote': '正在拉取远程 Meta-Repo 规则...',
  'sync.assemble': '正在根据项目标签组装规则...',
  'sync.inject': '正在注入组装后的规则到目标 IDE 目录...',
  'sync.success': '同步完成！',
  'sync.dashboard.title': 'aictx 价值感知面板 (Value Dashboard)',
  'sync.dashboard.scanned': '已扫描规则总数',
  'sync.dashboard.injected': '实际注入规则数',
  'sync.dashboard.ignored': '剔除无关规则数 (防腐)',
  'sync.dashboard.tokens': '本次预估 Tokens',
  'sync.warning.bloat': '⚠️ 警告：组装后的上下文超过 12,000 Tokens！可能导致 AI 幻觉或冗余浪费，建议裁剪规则。',
  
  // resolve command
  'resolve.start': '开始扫描业务红线与上下文重叠区 (Context Resolver)',
  'resolve.scan': '正在深度扫描实体 (Entities) 交集...',
  'resolve.success': '扫描完成。',
  'resolve.perfect': '🎉 恭喜！当前团队的规则库非常健康，没有发现任何业务边界冲突。SSOT 状态: Perfect。',
  'resolve.found': '发现 {0} 处潜在的规则冲突:\n',
  'resolve.conflict.entity': '冲突 #{0}: 实体 [{1}] 被以下多个文件同时描述：',
  'resolve.hint': '提示: 目前为预览模式。请团队架构师介入，将上述重叠的 Entity 合并到同一个 Markdown 文件中，以保证大模型拥有唯一的业务基准 (SSOT)。',
  'resolve.outro': '请在您的 Meta-Repo 中手动解决这些冲突。',
  
  // doctor command
  'doctor.start': '诊断本地规则与 Token 健康度',
  'doctor.diagnose': '正在检测本地上下文漂移 (Drift)...',
  'doctor.cache_missing': '未找到缓存目录，请先执行 `aictx sync`。',
  'doctor.healthy': '诊断完成：100% 健康，未发现规则篡改。',
  'doctor.drift_found': '诊断完成：发现本地漂移！',
  'doctor.issue.missing': '缺失',
  'doctor.issue.modified': '被篡改',
  'doctor.hint': '提示: 本地修改规则文件会被下一次 sync 覆盖。请在远端 Meta-Repo 中修改并重新下发。',
  'doctor.fix': '运行 `aictx sync` 修复上述问题。',
  
  // info command
  'info.title': 'aictx 核心指标大盘',
  'info.stat.projects': '已覆盖项目数',
  'info.stat.syncs': '累计同步次数',
  'info.stat.tokens': '累计节约 Tokens (估算)',
  'info.stat.conflicts': '排除潜在冲突',
  'info.mock_note': '注: 累计数据目前为本地 Mock 展示，后续将接入云端控制台统计。',

  // index command
  'index.intro': '编译 MOC 路由表',
  'index.start': '正在扫描文档与索引模板...',
  'index.error_dir': '目录不存在: {0}',
  'index.no_template': '在 {0} 中未找到包含锚点 <!-- aictx-index-start --> 的路由表模板。',
  'index.col.link': '文档路由 (双链)',
  'index.col.entities': '核心实体 (Entities)',
  'index.col.aliases': '别名 (Aliases)',
  'index.col.desc': '简介',
  'index.success_count': '✨ 共更新了 {0} 个索引文件',
  'index.success_desc': '📂 路由表已重新建立，AI 上下文索引更精准。',
  'index.outro': 'Map of Content generated successfully.',
  
  // common
  'common.error': '错误: {0}',
  'common.cancel': '操作已取消。',
};
