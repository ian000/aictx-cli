export const en = {
  // init command
  'init.welcome': 'Welcome to aictx - Initialize your Context as Code setup',
  'init.select_lang': 'Please select your preferred language',
  'init.select_ide': 'Which AI IDEs / CLI tools does your team use?',
  'init.enter_repo': 'Enter the URL of your remote Meta-Repo rules (optional, press Enter to skip)',
  'init.enter_tags': 'Enter the business tags for this project (comma separated, e.g. frontend, global)',
  'init.success': 'Initialization complete! You can now run `aictx sync` to fetch the context.',
  
  // sync command
  'sync.start': 'Starting Context Sync...',
  'sync.config_missing': 'aictx configuration not found. Please run `aictx init` first.',
  'sync.fetch.local': 'Reading rules from local directory...',
  'sync.fetch.remote': 'Fetching rules from remote Meta-Repo...',
  'sync.assemble': 'Assembling rules based on project tags...',
  'sync.inject': 'Injecting assembled rules into IDE directories...',
  'sync.success': 'Sync complete!',
  'sync.dashboard.title': 'aictx Value Perception',
  'sync.dashboard.scanned': 'Total Rules Scanned',
  'sync.dashboard.injected': 'Rules Injected',
  'sync.dashboard.ignored': 'Rules Ignored (Anti-Bloat)',
  'sync.dashboard.tokens': 'Est. Tokens',
  'sync.warning.bloat': '⚠️ Warning: The assembled context exceeds 12,000 tokens! This may cause AI hallucinations or context bloat.',
  
  // resolve command
  'resolve.start': 'Scanning for business boundary and context overlaps (Context Resolver)',
  'resolve.scan': 'Deep scanning entities intersection...',
  'resolve.success': 'Scan complete.',
  'resolve.perfect': '🎉 Congratulations! The team\'s rule base is very healthy. No business boundary conflicts found. SSOT Status: Perfect.',
  'resolve.found': 'Found {0} potential rule conflicts:\n',
  'resolve.conflict.entity': 'Conflict #{0}: Entity [{1}] is described simultaneously by the following files:',
  'resolve.hint': 'Hint: This is preview mode. Please ask the team architect to intervene and merge the overlapping Entities into the same Markdown file to ensure the LLM has a single source of truth (SSOT).',
  'resolve.outro': 'Please resolve the conflicts manually in your Meta-Repo.',
  
  // doctor command
  'doctor.start': 'Diagnosing local rules and token health',
  'doctor.diagnose': 'Checking local context drift...',
  'doctor.cache_missing': 'Cache directory not found. Please run `aictx sync` first.',
  'doctor.healthy': 'Diagnosis complete: 100% Healthy. No rules were tampered with.',
  'doctor.drift_found': 'Diagnosis complete: Local drift detected!',
  'doctor.issue.missing': 'Missing',
  'doctor.issue.modified': 'Modified',
  'doctor.hint': 'Hint: Local modifications to rule files will be overwritten by the next sync. Please modify them in the remote Meta-Repo instead.',
  'doctor.fix': 'Run `aictx sync` to fix the above issues.',
  
  // info command
  'info.title': 'aictx Metrics Dashboard',
  'info.stat.projects': 'Projects Covered',
  'info.stat.syncs': 'Total Syncs',
  'info.stat.tokens': 'Tokens Saved (Est.)',
  'info.stat.conflicts': 'Conflicts Resolved',
  'info.mock_note': 'Note: Cumulative data is currently mocked. Cloud console statistics will be integrated in future updates.',
  
  // common
  'common.error': 'Error: {0}',
  'common.cancel': 'Operation cancelled.',
};
