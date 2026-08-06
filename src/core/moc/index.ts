import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { findSharedSearchTerms } from '../../context/search.js';

export const MOC_INDEX_START = '<!-- aictx-index-start -->';
export const MOC_INDEX_END = '<!-- aictx-index-end -->';

export interface MocDocument {
  filePath: string;
  relativePath: string;
  routePath: string;
  linkTarget: string;
  linkLabel: string;
  title: string;
  description: string;
  tags: string[];
  entities: string[];
  aliases: string[];
  searchText: string;
  updated: string;
  sourceIndexPath: string;
}

export interface MocRouteMatch {
  document: MocDocument;
  score: number;
  matchedTerms: string[];
}

export interface MocTableLabels {
  link: string;
  path: string;
  tags: string;
  entities: string;
  aliases: string;
  updated: string;
  description: string;
}

const DEFAULT_TABLE_LABELS: MocTableLabels = {
  link: 'Doc Route (Bi-link)',
  path: 'Path',
  tags: 'Tags',
  entities: 'Core Entities',
  aliases: 'Aliases',
  updated: 'Updated',
  description: 'Description'
};

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function stripMarkdownExtension(filePath: string): string {
  return filePath.replace(/\.md$/i, '');
}

function flattenStrings(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenStrings);
  }
  return [];
}

function escapeTableCell(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function firstHeading(content: string): string | undefined {
  const match = content.match(/^#+\s+(.*)$/m);
  return match?.[1]?.trim();
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(await walkMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

export async function findMocIndexFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(await findMocIndexFiles(fullPath));
    } else if (entry === '00-Index.md' || entry.toLowerCase() === 'readme.md') {
      const content = await fs.readFile(fullPath, 'utf-8');
      if (content.includes(MOC_INDEX_START)) {
        results.push(fullPath);
      }
    }
  }
  return results.sort();
}

export async function parseMocDocument(
  filePath: string,
  indexDir: string,
  docsRoot: string,
  sourceIndexPath: string
): Promise<MocDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(content);
  const data = parsed.data || {};
  const stat = await fs.stat(filePath);
  const routePath = toPosix(path.relative(indexDir, filePath));
  const relativePath = toPosix(path.relative(docsRoot, filePath));
  const routeWithoutExt = stripMarkdownExtension(routePath);
  const linkLabel = path.basename(filePath, '.md');
  const title = firstHeading(parsed.content) || linkLabel;
  const description = String(data.description || title || '-');

  return {
    filePath,
    relativePath,
    routePath,
    linkTarget: routeWithoutExt,
    linkLabel,
    title,
    description,
    tags: flattenStrings(data.tags),
    entities: flattenStrings(data.entities),
    aliases: flattenStrings(data.aliases),
    searchText: parsed.content,
    updated: stat.mtime.toISOString().slice(0, 10),
    sourceIndexPath
  };
}

export async function collectMocDocumentsForIndex(indexPath: string, docsRoot: string): Promise<MocDocument[]> {
  const indexDir = path.dirname(indexPath);
  const files = await walkMarkdownFiles(indexDir);
  const documents: MocDocument[] = [];

  for (const file of files) {
    if (file === indexPath) continue;
    const content = await fs.readFile(file, 'utf-8');
    if (content.includes(MOC_INDEX_START)) continue;
    documents.push(await parseMocDocument(file, indexDir, docsRoot, indexPath));
  }

  return documents;
}

export function renderMocTable(documents: MocDocument[], labels: MocTableLabels = DEFAULT_TABLE_LABELS): string {
  const rows = [
    `| ${labels.link} | ${labels.path} | ${labels.tags} | ${labels.entities} | ${labels.aliases} | ${labels.updated} | ${labels.description} |`,
    '| --- | --- | --- | --- | --- | --- | --- |'
  ];

  for (const document of documents) {
    const link = `[[${document.linkTarget}]]`;
    rows.push([
      `| ${escapeTableCell(link)}`,
      `\`${escapeTableCell(document.relativePath)}\``,
      `\`${escapeTableCell(document.tags.join(', ') || '-')}\``,
      `\`${escapeTableCell(document.entities.join(', ') || '-')}\``,
      `\`${escapeTableCell(document.aliases.join(', ') || '-')}\``,
      escapeTableCell(document.updated),
      `${escapeTableCell(document.description)} |`
    ].join(' | '));
  }

  return rows.join('\n');
}

export async function updateMocIndexFile(
  indexPath: string,
  docsRoot: string,
  labels?: MocTableLabels
): Promise<number> {
  const documents = await collectMocDocumentsForIndex(indexPath, docsRoot);
  const indexContent = await fs.readFile(indexPath, 'utf-8');
  const table = renderMocTable(documents, labels);
  const regex = new RegExp(`(${MOC_INDEX_START})[\\s\\S]*?(${MOC_INDEX_END})`, 'g');

  if (!regex.test(indexContent)) return 0;
  const updatedContent = indexContent.replace(regex, `$1\n\n${table}\n\n$2`);
  await fs.writeFile(indexPath, updatedContent, 'utf-8');
  return documents.length;
}

export async function buildMocRouteIndex(docsRoot: string): Promise<MocDocument[]> {
  const indexFiles = await findMocIndexFiles(docsRoot);
  const byPath = new Map<string, MocDocument>();

  for (const indexPath of indexFiles) {
    const documents = await collectMocDocumentsForIndex(indexPath, docsRoot);
    for (const document of documents) {
      byPath.set(document.filePath, document);
    }
  }

  return [...byPath.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function addScore(
  query: string,
  terms: string[],
  weight: number,
  matched: Map<string, number>
) {
  for (const rawTerm of terms) {
    const term = normalizeText(rawTerm.trim());
    if (!term) continue;
    if (query.includes(term)) {
      matched.set(rawTerm, Math.max(matched.get(rawTerm) || 0, weight));
    }
  }
}

export function rankMocDocuments(question: string, documents: MocDocument[]): MocRouteMatch[] {
  const query = normalizeText(question);

  return documents
    .map((document) => {
      const matched = new Map<string, number>();
      addScore(query, document.entities, 8, matched);
      addScore(query, document.aliases, 7, matched);
      addScore(query, document.tags, 5, matched);
      addScore(query, [document.title, document.linkLabel, stripMarkdownExtension(document.relativePath)], 4, matched);
      addScore(query, [document.description], 2, matched);

      const metadata = [
        document.relativePath,
        document.title,
        document.description,
        ...document.tags,
        ...document.entities,
        ...document.aliases
      ].join(' ');
      for (const term of findSharedSearchTerms(question, metadata)) {
        matched.set(term, Math.max(matched.get(term) || 0, 1));
      }

      const contentTerms = findSharedSearchTerms(question, document.searchText);
      if (contentTerms.length >= 2) {
        for (const term of contentTerms) {
          matched.set(term, Math.max(matched.get(term) || 0, 1));
        }
      }

      const score = [...matched.values()].reduce((sum, value) => sum + value, 0);
      return {
        document,
        score,
        matchedTerms: [...matched.keys()]
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score || a.document.relativePath.localeCompare(b.document.relativePath));
}
