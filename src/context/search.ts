const LATIN_STOP_WORDS = new Set([
  'about',
  'does',
  'from',
  'have',
  'how',
  'into',
  'that',
  'the',
  'this',
  'what',
  'when',
  'where',
  'which',
  'with',
  'work',
  'works'
]);

const CJK_STOP_TERMS = new Set([
  '什么',
  '如何',
  '怎么',
  '怎样',
  '这个',
  '那个',
  '是否',
  '工作',
  '进行',
  '实现',
  '相关'
]);

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase();
}

export function tokenizeSearchText(value: string): string[] {
  const normalized = normalize(value);
  const tokens = new Set<string>();

  for (const segment of normalized.match(/\p{Script=Han}+/gu) ?? []) {
    for (let index = 0; index < segment.length - 1; index += 1) {
      const term = segment.slice(index, index + 2);
      if (!CJK_STOP_TERMS.has(term)) tokens.add(term);
    }
  }

  const withoutHan = normalized.replace(/\p{Script=Han}+/gu, ' ');
  for (const word of withoutHan.match(/[\p{L}\p{N}]+/gu) ?? []) {
    if (word.length >= 2 && !LATIN_STOP_WORDS.has(word)) tokens.add(word);
  }

  return [...tokens];
}

export function findSharedSearchTerms(query: string, target: string): string[] {
  const targetTerms = new Set(tokenizeSearchText(target));
  return tokenizeSearchText(query).filter(term => targetTerms.has(term));
}
