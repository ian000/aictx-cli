import fs from 'fs-extra';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  CONTEXT_SCHEMA_VERSION,
  prepareContextFromBundle,
  sha256Text,
  type ContextBundle,
  type ContextFreshness,
  type ContextPacket,
  type RunManifest
} from '../context/index.js';

export interface PrepareRuntimeContextOptions {
  projectDir: string;
  bundlePath: string;
  runsDir: string;
  task: string;
  budget: number;
  documentLimit: number;
  writeManifest?: boolean;
}

export interface PrepareRuntimeContextResult {
  packet: ContextPacket;
  manifest: RunManifest;
  manifestPath?: string;
}

export async function loadContextBundle(bundlePath: string): Promise<ContextBundle> {
  if (!(await fs.pathExists(bundlePath))) {
    throw new Error(`Context Bundle 不存在: ${bundlePath}，请先运行 aictx context build。`);
  }
  const bundle = await fs.readJson(bundlePath) as ContextBundle;
  if (bundle.schemaVersion !== CONTEXT_SCHEMA_VERSION) {
    throw new Error(`不支持的 Context Bundle schemaVersion: ${String(bundle.schemaVersion)}`);
  }
  if (!bundle.version || !Array.isArray(bundle.rules) || !Array.isArray(bundle.documents) || !Array.isArray(bundle.sources)) {
    throw new Error('Context Bundle 结构无效，请重新运行 aictx context build。');
  }
  return bundle;
}

export async function verifyContextBundleFreshness(
  projectDir: string,
  bundle: ContextBundle
): Promise<ContextFreshness> {
  const issues: ContextFreshness['issues'] = [];
  const expectedPaths = new Set(bundle.sources.map(source => source.path));

  for (const source of bundle.sources) {
    const filePath = path.resolve(projectDir, source.path);
    if (!(await fs.pathExists(filePath))) {
      issues.push({ path: source.path, reason: 'missing' });
      continue;
    }
    const content = await fs.readFile(filePath, 'utf-8');
    if (sha256Text(content) !== source.hash) {
      issues.push({ path: source.path, reason: 'modified' });
    }
  }

  for (const root of bundle.sourceRoots ?? []) {
    const rootPath = path.resolve(projectDir, root.path);
    if (!(await fs.pathExists(rootPath))) continue;
    const pending = [rootPath];
    while (pending.length > 0) {
      const directory = pending.pop()!;
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          pending.push(entryPath);
        } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === root.extension) {
          const projectPath = path.relative(projectDir, entryPath).split(path.sep).join('/');
          if (!expectedPaths.has(projectPath)) issues.push({ path: projectPath, reason: 'added' });
        }
      }
    }
  }

  return {
    status: issues.length === 0 ? 'fresh' : 'stale',
    checkedAt: new Date().toISOString(),
    issues
  };
}

async function writeManifest(runsDir: string, manifest: RunManifest): Promise<string> {
  await fs.ensureDir(runsDir);
  const manifestPath = path.join(runsDir, `${manifest.runId}.json`);
  const temporaryPath = `${manifestPath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeJson(temporaryPath, manifest, { spaces: 2 });
  await fs.move(temporaryPath, manifestPath, { overwrite: false });
  return manifestPath;
}

export async function prepareRuntimeContext(
  options: PrepareRuntimeContextOptions
): Promise<PrepareRuntimeContextResult> {
  const projectDir = path.resolve(options.projectDir);
  const bundle = await loadContextBundle(path.resolve(options.bundlePath));
  const freshness = await verifyContextBundleFreshness(projectDir, bundle);
  const packet = prepareContextFromBundle(bundle, {
    task: options.task,
    budget: options.budget,
    documentLimit: options.documentLimit,
    freshness
  });
  const runId = randomUUID();
  const manifest: RunManifest = {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    runId,
    createdAt: new Date().toISOString(),
    task: options.task,
    packetId: packet.packetId,
    bundleVersion: bundle.version,
    status: packet.status,
    selectedRules: packet.rules.map(rule => rule.id),
    selectedDocuments: packet.documents.map(document => document.path),
    freshness,
    validation: 'prepared'
  };

  const manifestPath = options.writeManifest === false
    ? undefined
    : await writeManifest(path.resolve(options.runsDir), manifest);

  return { packet, manifest, manifestPath };
}

export async function readRunManifest(runsDir: string, runId: string): Promise<RunManifest> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(runId)) {
    throw new Error('Run ID 格式无效。');
  }
  const manifestPath = path.resolve(runsDir, `${runId}.json`);
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`Run Manifest 不存在: ${runId}`);
  }
  return fs.readJson(manifestPath) as Promise<RunManifest>;
}
