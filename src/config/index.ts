import fs from 'fs-extra';
import path from 'path';
import { parseIdeOption } from '../core/ide/index.js';

export interface AictxConfig {
  $schema?: string;
  version: string;
  lang?: 'en' | 'zh';
  repository?: string;
  ides: string[];
  tags: string[];
  bootstrap?: {
    mode: 'blank' | 'from-docs';
    prdPath?: string;
    architecturePath?: string;
    hasArchitectureSummary?: boolean;
  };
  context?: {
    cacheDir?: string;
    docsDir?: string;
    graphPath?: string;
    bundlePath?: string;
  };
  runtime?: {
    runsDir?: string;
    defaultBudget?: number;
    documentLimit?: number;
  };
  development?: Record<string, unknown>;
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
      return this.validate(config);
    } catch (error: any) {
      throw new Error(`解析 ${CONFIG_FILE} 失败: ${error.message}`);
    }
  }

  private validate(config: any): AictxConfig {
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('配置文件必须是 JSON 对象。');
    }

    if (!Array.isArray(config.ides) || config.ides.length === 0) {
      throw new Error('配置文件缺少 ides 字段或为空。');
    }

    if (config.repository !== undefined && typeof config.repository !== 'string') {
      throw new Error('repository 必须是字符串。');
    }

    if (config.tags !== undefined && !Array.isArray(config.tags)) {
      throw new Error('tags 必须是字符串数组。');
    }

    const invalidTags = (config.tags ?? []).filter((tag: unknown) => typeof tag !== 'string');
    if (invalidTags.length > 0) {
      throw new Error('tags 必须是字符串数组。');
    }

    if (config.context !== undefined && (!config.context || typeof config.context !== 'object' || Array.isArray(config.context))) {
      throw new Error('context 必须是对象。');
    }
    if (config.runtime !== undefined && (!config.runtime || typeof config.runtime !== 'object' || Array.isArray(config.runtime))) {
      throw new Error('runtime 必须是对象。');
    }
    for (const field of ['cacheDir', 'docsDir', 'graphPath', 'bundlePath']) {
      if (config.context?.[field] !== undefined && typeof config.context[field] !== 'string') {
        throw new Error(`context.${field} 必须是字符串。`);
      }
    }
    for (const field of ['runsDir']) {
      if (config.runtime?.[field] !== undefined && typeof config.runtime[field] !== 'string') {
        throw new Error(`runtime.${field} 必须是字符串。`);
      }
    }
    for (const field of ['defaultBudget', 'documentLimit']) {
      if (config.runtime?.[field] !== undefined && (!Number.isFinite(config.runtime[field]) || config.runtime[field] < 0)) {
        throw new Error(`runtime.${field} 必须是非负数字。`);
      }
    }

    return {
      ...config,
      ides: parseIdeOption(config.ides.join(',')),
      tags: config.tags ?? []
    } as AictxConfig;
  }
}
