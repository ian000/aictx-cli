// import { getEncoding } from 'tiktoken';

export function countTokens(text: string): number {
  try {
    // 暂时移除 tiktoken 以避免 wasm 二进制在 tsup 打包时可能产生的 ESM 加载问题
    // const encoding = getEncoding('cl100k_base');
    // const tokens = encoding.encode(text);
    // const count = tokens.length;
    // encoding.free();
    // return count;
    return Math.ceil(text.length * 1.5);
  } catch (error) {
    // fallback: 粗略估算 (中文字符约占 1-2 tokens，英文单词约占 1.3 tokens)
    return Math.ceil(text.length * 1.5);
  }
}
