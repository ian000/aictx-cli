import { en } from './en.js';
import { zh } from './zh.js';
import fs from 'fs-extra';
import path from 'path';

const dictionaries = { en, zh };

export type Language = keyof typeof dictionaries;

let currentLang: Language = 'en';

export function setLanguage(lang: Language) {
  if (dictionaries[lang]) {
    currentLang = lang;
  }
}

export function getLanguage(): Language {
  return currentLang;
}

export async function initI18n() {
  const configPath = path.resolve(process.cwd(), 'aictx.json');
  if (await fs.pathExists(configPath)) {
    try {
      const config = await fs.readJson(configPath);
      if (config.lang && (config.lang === 'en' || config.lang === 'zh')) {
        setLanguage(config.lang);
      }
    } catch (e) {
      // ignore
    }
  }
}

export function t(key: keyof typeof en, ...args: any[]): string {
  const dict = dictionaries[currentLang];
  let text = dict[key] || en[key] || key;
  
  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      text = text.replace(`{${i}}`, String(args[i]));
    }
  }
  
  return text;
}
