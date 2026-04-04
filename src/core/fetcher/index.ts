import fs from 'fs-extra';
import path from 'path';
import { consola } from 'consola';
import { x } from 'tinyexec';

export async function fetchRules(repository: string, cacheDir: string): Promise<void> {
  // 如果是本地路径，则直接复制
  if (repository.startsWith('.') || repository.startsWith('/') || /^[a-zA-Z]:\\/.test(repository)) {
    const localPath = path.resolve(process.cwd(), repository);
    if (!fs.existsSync(localPath)) {
      throw new Error(`本地仓库路径不存在: ${localPath}`);
    }
    consola.start(`正在从本地目录同步规则: ${localPath}`);
    await fs.emptyDir(cacheDir);
    await fs.copy(localPath, cacheDir);
    consola.success(`本地规则同步完成 -> ${cacheDir}`);
    return;
  }

  // 否则认为是 Git URL
  consola.start(`正在从远程 Meta-Repo 同步规则: ${repository}`);
  
  if (fs.existsSync(cacheDir)) {
    // 尝试 git pull
    try {
      const { exitCode } = await x('git', ['pull'], { nodeOptions: { cwd: cacheDir } });
      if (exitCode === 0) {
        consola.success(`远程规则拉取更新成功 -> ${cacheDir}`);
        return;
      }
    } catch (e) {
      consola.warn(`增量拉取失败，尝试重新克隆...`);
    }
  }

  // 如果不存在或 pull 失败，重新 clone
  await fs.emptyDir(cacheDir);
  const { exitCode, stderr } = await x('git', ['clone', '--depth', '1', repository, cacheDir]);
  
  if (exitCode !== 0) {
    throw new Error(`Git Clone 失败: ${stderr}`);
  }
  
  // 清理 .git 目录以防嵌套仓库问题
  await fs.remove(path.join(cacheDir, '.git'));
  consola.success(`远程规则 Clone 成功 -> ${cacheDir}`);
}
