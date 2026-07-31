import fs from 'fs-extra';
import path from 'path';
import { consola } from 'consola';
import { x } from 'tinyexec';
import { fileURLToPath } from 'url';

async function createStagingDir(cacheDir: string): Promise<string> {
  await fs.ensureDir(path.dirname(cacheDir));
  return fs.mkdtemp(path.join(path.dirname(cacheDir), `${path.basename(cacheDir)}.tmp-`));
}

async function replaceCache(cacheDir: string, stagingDir: string): Promise<void> {
  const backupDir = `${cacheDir}.bak-${process.pid}-${Date.now()}`;
  const hadCache = await fs.pathExists(cacheDir);

  if (hadCache) {
    await fs.move(cacheDir, backupDir, { overwrite: true });
  }

  try {
    await fs.move(stagingDir, cacheDir, { overwrite: false });
  } catch (error) {
    if (hadCache && await fs.pathExists(backupDir) && !(await fs.pathExists(cacheDir))) {
      await fs.move(backupDir, cacheDir, { overwrite: true });
    }
    throw error;
  }

  if (hadCache) {
    await fs.remove(backupDir);
  }
}

async function replaceCacheWithCopy(cacheDir: string, sourceDir: string): Promise<void> {
  const stagingDir = await createStagingDir(cacheDir);
  try {
    await fs.copy(sourceDir, stagingDir, { overwrite: true });
    await replaceCache(cacheDir, stagingDir);
  } catch (error) {
    await fs.remove(stagingDir);
    throw error;
  }
}

export async function fetchRules(
  repository: string | undefined,
  cacheDir: string,
  options: { silent?: boolean } = {}
): Promise<void> {
  if (!repository || repository.trim() === '' || repository === 'builtin') {
    // 采用内置模板 (Builtin fallback)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // 兼容开发环境和 tsup 打包后的环境
    const isDist = __dirname.endsWith('dist');
    const templatesDir = path.resolve(__dirname, isDist ? 'templates/.trae/rules' : '../../templates/.trae/rules');
    
    if (fs.existsSync(templatesDir)) {
      await replaceCacheWithCopy(cacheDir, templatesDir);
    } else {
      throw new Error(`未找到内置规则模板目录: ${templatesDir}`);
    }
    return;
  }

  // 如果是本地路径，则直接复制
  if (repository.startsWith('.') || repository.startsWith('/') || /^[a-zA-Z]:\\/.test(repository)) {
    const localPath = path.resolve(process.cwd(), repository);
    if (!fs.existsSync(localPath)) {
      throw new Error(`本地仓库路径不存在: ${localPath}`);
    }
    if (!options.silent) consola.start(`正在从本地目录同步规则: ${localPath}`);
    await replaceCacheWithCopy(cacheDir, localPath);
    if (!options.silent) consola.success(`本地规则同步完成 -> ${cacheDir}`);
    return;
  }

  // 否则认为是 Git URL
  if (!options.silent) consola.start(`正在从远程 Meta-Repo 同步规则: ${repository}`);

  const stagingDir = await createStagingDir(cacheDir);
  try {
    const { exitCode, stderr } = await x('git', ['clone', '--depth', '1', repository, stagingDir]);
    if (exitCode !== 0) {
      throw new Error(`Git Clone 失败: ${stderr}`);
    }

    // 清理 .git 目录以防嵌套仓库问题
    await fs.remove(path.join(stagingDir, '.git'));
    await replaceCache(cacheDir, stagingDir);
  } catch (error) {
    await fs.remove(stagingDir);
    throw error;
  }

  if (!options.silent) consola.success(`远程规则 Clone 成功 -> ${cacheDir}`);
}
