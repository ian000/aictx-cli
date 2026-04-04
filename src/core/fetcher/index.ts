import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { consola } from 'consola';
import pc from 'picocolors';

/**
 * 从远程 Meta 仓库或本地目录拉取规则资产到本地缓存
 */
export async function fetchRules(metaRepo: string, cacheDir: string): Promise<string> {
  await fs.ensureDir(cacheDir);
  
  const isGitRepo = metaRepo.startsWith('http') || metaRepo.startsWith('git@');

  if (isGitRepo) {
    consola.start(`[Fetcher] 正在从远程 Git 仓库拉取规则: ${pc.cyan(metaRepo)}`);
    await fs.emptyDir(cacheDir);
    try {
      // MVP 阶段：直接 clone，忽略 .git 目录记录
      execSync(`git clone --depth 1 ${metaRepo} .`, { cwd: cacheDir, stdio: 'ignore' });
      // 移除 .git 目录，仅保留文件
      await fs.remove(path.join(cacheDir, '.git'));
      consola.success('[Fetcher] 远程规则拉取成功');
    } catch (e: any) {
      throw new Error(`Git clone 失败，请检查仓库地址或网络权限: ${e.message}`);
    }
  } else {
    // 处理本地路径
    const sourcePath = path.resolve(process.cwd(), metaRepo);
    consola.start(`[Fetcher] 正在从本地路径拉取规则: ${pc.cyan(sourcePath)}`);
    
    if (!(await fs.pathExists(sourcePath))) {
      throw new Error(`指定的本地规则目录不存在: ${sourcePath}`);
    }
    
    await fs.emptyDir(cacheDir);
    // 拷贝所有文件到缓存目录，排除可能存在的 .git
    await fs.copy(sourcePath, cacheDir, {
      filter: (src) => !src.includes('.git')
    });
    consola.success('[Fetcher] 本地规则拉取成功');
  }

  return cacheDir;
}
