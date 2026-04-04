import { getEncoding } from 'tiktoken';

export function countTokens(text: string): number {
  try {
    // 使用 gpt-3.5-turbo / gpt-4 通用的 cl100k_base 编码
    const encoding = getEncoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    // fallback: 粗略估算 (中文字符约占 1-2 tokens，英文单词约占 1.3 tokens)
    return Math.ceil(text.length * 1.5);
  }
}
