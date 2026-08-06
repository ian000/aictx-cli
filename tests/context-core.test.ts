import { describe, expect, it } from 'vitest';
import {
  CONTEXT_SCHEMA_VERSION,
  prepareContextFromBundle,
  stableHash,
  type ContextBundle,
  type ContextFreshness
} from '../src/context/index.js';

const fresh: ContextFreshness = {
  status: 'fresh',
  checkedAt: '2026-08-01T00:00:00.000Z',
  issues: []
};

function bundle(): ContextBundle {
  return {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    version: 'bundle-v1',
    generatedAt: '2026-08-01T00:00:00.000Z',
    rules: [{
      id: 'common.md',
      sourcePath: '.aictx-cache/common.md',
      alwaysApply: true,
      content: '# Common',
      tokens: 20,
      tags: ['common'],
      hash: 'rule-hash'
    }],
    documents: [
      {
        path: 'aictx-docs/product/checkout.md',
        title: 'Checkout Flow',
        description: 'Order and payment flow',
        tags: ['payment'],
        entities: ['Order'],
        aliases: ['Checkout'],
        updated: '2026-08-01',
        content: '# Checkout',
        tokens: 30,
        hash: 'checkout-hash'
      },
      {
        path: 'aictx-docs/architecture/runtime.md',
        title: 'Runtime',
        description: 'Agent runtime architecture',
        tags: ['runtime'],
        entities: ['Context Packet'],
        aliases: [],
        updated: '2026-08-01',
        content: '# Runtime',
        tokens: 30,
        hash: 'runtime-hash'
      }
    ],
    sources: [],
    sourceRoots: []
  };
}

describe('shared context core', () => {
  it('selects the most relevant document within the token budget', () => {
    const packet = prepareContextFromBundle(bundle(), {
      task: 'Fix Checkout payment for an Order',
      budget: 55,
      documentLimit: 2,
      freshness: fresh
    });

    expect(packet.status).toBe('ready');
    expect(packet.usedTokens).toBe(50);
    expect(packet.documents.map(document => document.path)).toEqual([
      'aictx-docs/product/checkout.md'
    ]);
    expect(packet.provenance).toContain('.aictx-cache/common.md');
  });

  it('selects a document from natural-language terms found in its content', () => {
    const value = bundle();
    value.documents[0].content = '# 用车流程\n\n教师提交用车需求后进入询价。';

    const packet = prepareContextFromBundle(value, {
      task: '用车需求提交是怎么工作的？',
      budget: 55,
      documentLimit: 2,
      freshness: fresh
    });

    expect(packet.documents.map(document => document.path)).toEqual([
      'aictx-docs/product/checkout.md'
    ]);
  });

  it('selects optional rules only when the task matches and budget allows them', () => {
    const value = bundle();
    value.rules.push({
      id: 'payment.md',
      sourcePath: '.aictx-cache/payment.md',
      description: 'Checkout payment policy',
      alwaysApply: false,
      content: '# Payment',
      tokens: 15,
      tags: ['payment'],
      hash: 'payment-rule-hash'
    });

    const packet = prepareContextFromBundle(value, {
      task: 'Fix checkout payment',
      budget: 70,
      documentLimit: 1,
      freshness: fresh
    });

    expect(packet.rules.map(rule => rule.id)).toContain('payment.md');
  });

  it('always carries mandatory rules and reports a budget overflow', () => {
    const packet = prepareContextFromBundle(bundle(), {
      task: 'runtime',
      budget: 10,
      documentLimit: 3,
      freshness: fresh
    });

    expect(packet.rules).toHaveLength(1);
    expect(packet.documents).toHaveLength(0);
    expect(packet.budgetExceeded).toBe(true);
  });

  it('hashes equivalent objects deterministically', () => {
    expect(stableHash({ b: 2, a: 1 })).toBe(stableHash({ a: 1, b: 2 }));
  });
});
