import { get_encoding } from 'tiktoken';

/**
 * 估算字符串的 Token 消耗
 * 采用 cl100k_base 编码（gpt-4 / gpt-3.5 通用）
 * 如果 tiktoken 初始化失败，回退到按字符长度估算
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  try {
    const enc = get_encoding('cl100k_base');
    const tokens = enc.encode(text).length;
    enc.free();
    return tokens;
  } catch (err) {
    // 降级回退策略：中文大致 1 字符=1.5 Token，英文大致 4 字符=1 Token
    // 这里采用一个粗略的平均折中值：长度 / 2
    return Math.ceil(text.length / 2);
  }
}
