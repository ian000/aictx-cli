import fs from 'fs-extra';
import path from 'node:path';
import { glob } from 'tinyglobby';
import matter from 'gray-matter';
import {
  CONTEXT_SCHEMA_VERSION,
  assembleRules,
  buildMocRouteIndex,
  countTokens,
  sha256Text,
  stableHash,
  type ContextBundle,
  type ContextDocument,
  type ContextGraphReference,
  type ContextRule,
  type ContextSourceFingerprint,
  type ContextSourceRoot
} from '../context/index.js';

export interface BuildContextBundleOptions {
  projectDir: string;
  cacheDir: string;
  docsDir: string;
  graphPath?: string;
  outputPath: string;
  tags: string[];
}

function toProjectPath(projectDir: string, filePath: string): string {
  return path.relative(projectDir, filePath).split(path.sep).join('/');
}

async function fingerprintFile(projectDir: string, filePath: string): Promise<ContextSourceFingerprint> {
  const content = await fs.readFile(filePath, 'utf-8');
  return { path: toProjectPath(projectDir, filePath), hash: sha256Text(content) };
}

async function readGraphReference(
  projectDir: string,
  graphPath: string | undefined
): Promise<ContextGraphReference | undefined> {
  if (!graphPath || !(await fs.pathExists(graphPath))) return undefined;
  const content = await fs.readFile(graphPath, 'utf-8');
  const graph = JSON.parse(content) as { nodes?: unknown[]; links?: unknown[]; edges?: unknown[] };
  return {
    path: toProjectPath(projectDir, graphPath),
    hash: sha256Text(content),
    nodes: graph.nodes?.length ?? 0,
    edges: graph.links?.length ?? graph.edges?.length ?? 0
  };
}

async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeJson(temporaryPath, value, { spaces: 2 });
  await fs.move(temporaryPath, filePath, { overwrite: true });
}

export async function buildContextBundle(options: BuildContextBundleOptions): Promise<ContextBundle> {
  const projectDir = path.resolve(options.projectDir);
  const cacheDir = path.resolve(options.cacheDir);
  const docsDir = path.resolve(options.docsDir);
  const graphPath = options.graphPath ? path.resolve(options.graphPath) : undefined;

  if (!(await fs.pathExists(cacheDir))) {
    throw new Error(`规则缓存不存在: ${toProjectPath(projectDir, cacheDir)}，请先运行 aictx sync。`);
  }

  const assembled = await assembleRules(cacheDir, options.tags);
  const rules: ContextRule[] = await Promise.all(assembled.rules.map(async rule => {
    const sourceFile = path.join(cacheDir, rule.sourcePath);
    const metadata = matter(rule.content).data;
    return {
      id: rule.filename,
      sourcePath: toProjectPath(projectDir, sourceFile),
      description: typeof metadata.description === 'string' ? metadata.description : undefined,
      alwaysApply: metadata.alwaysApply === true,
      content: rule.content,
      tokens: rule.tokens,
      tags: rule.tags,
      hash: sha256Text(rule.content)
    };
  }));

  const mocDocuments = await fs.pathExists(docsDir) ? await buildMocRouteIndex(docsDir) : [];
  const documents: ContextDocument[] = await Promise.all(mocDocuments.map(async document => {
    const content = await fs.readFile(document.filePath, 'utf-8');
    return {
      path: toProjectPath(projectDir, document.filePath),
      title: document.title,
      description: document.description,
      tags: document.tags,
      entities: document.entities,
      aliases: document.aliases,
      updated: document.updated,
      content,
      tokens: countTokens(content),
      hash: sha256Text(content)
    };
  }));

  const graph = await readGraphReference(projectDir, graphPath);
  const markdownFiles = async (directory: string): Promise<string[]> => {
    if (!(await fs.pathExists(directory))) return [];
    return glob('**/*.md', { cwd: directory, absolute: true });
  };
  const configPath = path.join(projectDir, 'aictx.json');
  const sourceFiles = [...new Set([
    ...await markdownFiles(cacheDir),
    ...await markdownFiles(docsDir),
    ...(graphPath && graph ? [graphPath] : []),
    ...(await fs.pathExists(configPath) ? [configPath] : [])
  ])];
  const sourceRoots: ContextSourceRoot[] = [
    { path: toProjectPath(projectDir, cacheDir), extension: '.md' },
    { path: toProjectPath(projectDir, docsDir), extension: '.md' }
  ];
  const sources = await Promise.all(sourceFiles.map(file => fingerprintFile(projectDir, file)));
  sources.sort((left, right) => left.path.localeCompare(right.path));
  rules.sort((left, right) => left.id.localeCompare(right.id));
  documents.sort((left, right) => left.path.localeCompare(right.path));

  const version = stableHash({ rules, documents, graph, sources, sourceRoots });
  const bundle: ContextBundle = {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    version,
    generatedAt: new Date().toISOString(),
    rules,
    documents,
    graph,
    sources,
    sourceRoots
  };

  await writeJsonAtomic(path.resolve(options.outputPath), bundle);
  return bundle;
}
