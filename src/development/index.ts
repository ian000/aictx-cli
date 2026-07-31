export { buildContextBundle } from './context-bundle.js';
export type { BuildContextBundleOptions } from './context-bundle.js';

export { fetchRules } from '../core/fetcher/index.js';
export { assembleRules } from '../core/assembler/index.js';
export type { AssembleResult } from '../core/assembler/index.js';
export {
  ClaudeAdapter,
  CodexAdapter,
  CursorAdapter,
  TraeAdapter,
  WindsurfAdapter
} from '../core/injector/index.js';
export { diagnoseDrift } from '../core/doctor/index.js';
