import fs from 'fs-extra';
import path from 'path';

export interface AictxConfig {
  $schema?: string;
  version: string;
  lang?: 'en' | 'zh';
  repository?: string;
  ides: string[];
  tags: string[];
  overrides?: Record<string, any>;
}

const CONFIG_FILE = 'aictx.json';

export class ConfigParser {
  private configPath: string;

  constructor(cwd: string = process.cwd()) {
    this.configPath = path.resolve(cwd, CONFIG_FILE);
  }

  public async exists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  public async read(): Promise<AictxConfig> {
    if (!(await this.exists())) {
      throw new Error(`未找到 ${CONFIG_FILE} 配置文件，请先运行 'aictx init'。`);
    }

    try {
      const config = await fs.readJson(this.configPath);
      this.validate(config);
      return config as AictxConfig;
    } catch (error: any) {
      throw new Error(`解析 ${CONFIG_FILE} 失败: ${error.message}`);
    }
  }

  private validate(config: any) {
    if (!Array.isArray(config.ides) || config.ides.length === 0) {
      throw new Error('配置文件缺少 ides 字段或为空。');
    }
  }
}
