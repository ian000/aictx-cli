import fs from 'fs-extra';
import path from 'path';
import { consola } from 'consola';
import pc from 'picocolors';

/**
 * 目标注入的 IDE/CLI 枚举
 */
export type TargetIDE = 'trae' | 'cursor' | 'antigravity' | 'claude';

/**
 * aictx 配置文件结构定义 (Schema)
 */
export interface AictxConfig {
  /** 
   * 中央 Meta 仓库地址 (支持 Git URL 或本地绝对/相对路径) 
   * 例如: "git@github.com:my-org/meta-rules.git" 或 "../meta-repo"
   */
  metaRepo: string;

  /** 
   * 当前项目所需的规则标签 (用于过滤无关规则，防止 Context Bloat) 
   * 例如: ["frontend", "payment"]
   */
  tags: string[];

  /** 
   * 需要注入的目标终端/IDE 列表
   */
  ide: TargetIDE[];

  /** 
   * 本地缓存目录路径 (选填，默认将缓存在 ~/.aictx-cache) 
   */
  cacheDir?: string;
}

export const CONFIG_FILE_NAME = 'aictx.json';

/**
 * 解析并加载当前工作目录下的 aictx.json 配置
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<AictxConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  
  if (!(await fs.pathExists(configPath))) {
    consola.error(pc.red(`未找到配置文件: ${CONFIG_FILE_NAME}`));
    consola.info(`请先运行 ${pc.cyan('npx aictx init')} 初始化该项目，或手动创建该文件。`);
    return null;
  }

  try {
    const config = await fs.readJson(configPath) as AictxConfig;
    // 基础的字段校验
    if (!config.metaRepo) {
      throw new Error("缺少必填字段: 'metaRepo'");
    }
    if (!Array.isArray(config.tags) || !Array.isArray(config.ide)) {
      throw new Error("'tags' 和 'ide' 必须是数组格式");
    }
    
    return config;
  } catch (err: any) {
    consola.error(pc.red(`配置文件 (${CONFIG_FILE_NAME}) 解析失败: ${err.message}`));
    return null;
  }
}

/**
 * 写入或更新配置 (主要供 init 命令使用)
 */
export async function saveConfig(config: AictxConfig, cwd: string = process.cwd()): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  await fs.writeJson(configPath, config, { spaces: 2 });
  consola.success(pc.green(`配置已成功写入: ${configPath}`));
}
