import type { ContextBundle, ContextDocument, ContextFreshness, ContextPacket, ContextRule } from './contracts.js';
import { CONTEXT_SCHEMA_VERSION } from './contracts.js';
import { stableHash } from './hash.js';
import { findSharedSearchTerms } from './search.js';

export interface PrepareContextOptions {
  task: string;
  budget: number;
  documentLimit: number;
  freshness: ContextFreshness;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function documentScore(task: string, document: ContextDocument): number {
  const query = normalize(task);
  let score = 0;

  const weightedTerms: Array<[string[], number]> = [
    [document.entities, 8],
    [document.aliases, 7],
    [document.tags, 5],
    [[document.title, document.path], 4],
    [[document.description], 2]
  ];

  for (const [terms, weight] of weightedTerms) {
    for (const term of terms) {
      if (term && query.includes(normalize(term))) score += weight;
    }
  }

  const metadata = [
    document.path,
    document.title,
    document.description,
    ...document.tags,
    ...document.entities,
    ...document.aliases
  ].join(' ');
  score += findSharedSearchTerms(task, metadata).length;

  const contentTerms = findSharedSearchTerms(task, document.content);
  if (contentTerms.length >= 2) score += contentTerms.length;

  return score;
}

function ruleScore(task: string, rule: ContextRule): number {
  const query = normalize(task);
  let score = 0;
  for (const tag of rule.tags) {
    if (tag && query.includes(normalize(tag))) score += 5;
  }
  const metadata = [rule.id, rule.sourcePath, rule.description ?? '', ...rule.tags].join(' ');
  score += findSharedSearchTerms(task, metadata).length * 2;
  return score;
}

export function prepareContextFromBundle(
  bundle: ContextBundle,
  options: PrepareContextOptions
): ContextPacket {
  const budget = Math.max(1, Math.floor(options.budget));
  const documentLimit = Math.max(0, Math.floor(options.documentLimit));
  const mandatoryRules = bundle.rules.filter(rule => rule.alwaysApply !== false);
  const optionalRules = bundle.rules
    .filter(rule => rule.alwaysApply === false)
    .map(rule => ({ rule, score: ruleScore(options.task, rule) }))
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.rule.id.localeCompare(right.rule.id));
  const rules = [...mandatoryRules];
  let usedTokens = rules.reduce((sum, rule) => sum + rule.tokens, 0);
  const documents: ContextDocument[] = [];

  for (const candidate of optionalRules) {
    if (usedTokens + candidate.rule.tokens > budget) continue;
    rules.push(candidate.rule);
    usedTokens += candidate.rule.tokens;
  }

  const rankedDocuments = bundle.documents
    .map(document => ({ document, score: documentScore(options.task, document) }))
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.document.path.localeCompare(right.document.path));

  for (const candidate of rankedDocuments) {
    if (documents.length >= documentLimit) break;
    if (usedTokens + candidate.document.tokens > budget) continue;
    documents.push(candidate.document);
    usedTokens += candidate.document.tokens;
  }

  const packetIdentity = {
    bundleVersion: bundle.version,
    task: options.task,
    budget,
    rules: rules.map(rule => rule.id),
    documents: documents.map(document => document.path)
  };

  return {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    packetId: stableHash(packetIdentity).slice(0, 24),
    status: options.freshness.status === 'fresh' ? 'ready' : 'context_stale',
    task: options.task,
    bundleVersion: bundle.version,
    budget,
    usedTokens,
    budgetExceeded: usedTokens > budget,
    rules,
    documents,
    graph: bundle.graph,
    freshness: options.freshness,
    provenance: [
      ...rules.map(rule => rule.sourcePath),
      ...documents.map(document => document.path),
      ...(bundle.graph ? [bundle.graph.path] : [])
    ]
  };
}
