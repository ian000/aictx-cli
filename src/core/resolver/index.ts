import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'tinyglobby';

export interface Conflict {
  entity: string;
  files: string[];
}

export async function scanConflicts(sourceDir: string): Promise<Conflict[]> {
  const mdFiles = await glob('**/*.md', { cwd: sourceDir, absolute: true });
  
  // 建立实体到文件的反向索引: Map<EntityName, Set<FilePath>>
  const entityIndex = new Map<string, Set<string>>();

  for (const filePath of mdFiles) {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(rawContent);
    const entities: string[] = parsed.data.entities || [];

    for (const entity of entities) {
      if (!entityIndex.has(entity)) {
        entityIndex.set(entity, new Set());
      }
      entityIndex.get(entity)!.add(path.basename(filePath));
    }
  }

  // 筛选出被多个文件同时描述的 Entity (冲突)
  const conflicts: Conflict[] = [];
  for (const [entity, fileSet] of entityIndex.entries()) {
    if (fileSet.size > 1) {
      conflicts.push({
        entity,
        files: Array.from(fileSet)
      });
    }
  }

  return conflicts;
}
