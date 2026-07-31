export const CONTEXT_SCHEMA_VERSION = 1 as const;

export interface ContextSourceFingerprint {
  path: string;
  hash: string;
}

export interface ContextSourceRoot {
  path: string;
  extension: '.md';
}

export interface ContextRule {
  id: string;
  sourcePath: string;
  description?: string;
  alwaysApply?: boolean;
  content: string;
  tokens: number;
  tags: string[];
  hash: string;
}

export interface ContextDocument {
  path: string;
  title: string;
  description: string;
  tags: string[];
  entities: string[];
  aliases: string[];
  updated: string;
  content: string;
  tokens: number;
  hash: string;
}

export interface ContextGraphReference {
  path: string;
  hash: string;
  nodes: number;
  edges: number;
}

export interface ContextBundle {
  schemaVersion: typeof CONTEXT_SCHEMA_VERSION;
  version: string;
  generatedAt: string;
  rules: ContextRule[];
  documents: ContextDocument[];
  graph?: ContextGraphReference;
  sources: ContextSourceFingerprint[];
  sourceRoots: ContextSourceRoot[];
}

export interface ContextFreshnessIssue {
  path: string;
  reason: 'missing' | 'modified' | 'added';
}

export interface ContextFreshness {
  status: 'fresh' | 'stale';
  checkedAt: string;
  issues: ContextFreshnessIssue[];
}

export interface ContextPacket {
  schemaVersion: typeof CONTEXT_SCHEMA_VERSION;
  packetId: string;
  status: 'ready' | 'context_stale';
  task: string;
  bundleVersion: string;
  budget: number;
  usedTokens: number;
  budgetExceeded: boolean;
  rules: ContextRule[];
  documents: ContextDocument[];
  graph?: ContextGraphReference;
  freshness: ContextFreshness;
  provenance: string[];
}

export interface RunManifest {
  schemaVersion: typeof CONTEXT_SCHEMA_VERSION;
  runId: string;
  createdAt: string;
  task: string;
  packetId: string;
  bundleVersion: string;
  status: ContextPacket['status'];
  selectedRules: string[];
  selectedDocuments: string[];
  freshness: ContextFreshness;
  validation: 'prepared';
}
