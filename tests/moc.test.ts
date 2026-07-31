import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  buildMocRouteIndex,
  findMocIndexFiles,
  rankMocDocuments,
  updateMocIndexFile
} from '../src/core/moc/index.js';

describe('MOC routing', () => {
  const testDir = path.join(process.cwd(), '.test-aictx-moc');
  const docsRoot = path.join(testDir, 'aictx-docs');
  const productDir = path.join(docsRoot, 'product');
  const indexPath = path.join(productDir, '00-Index.md');

  beforeEach(async () => {
    await fs.ensureDir(productDir);
    await fs.writeFile(indexPath, `---
tags:
  - aictx
  - moc
---
# Product MOC

<!-- aictx-index-start -->
pending
<!-- aictx-index-end -->
`);
    await fs.writeFile(path.join(productDir, 'order-flow.md'), `---
tags:
  - product
  - checkout
entities:
  - Order
  - Payment
aliases:
  - Checkout
description: 用户下单和支付路径
---
# Order Flow

用户提交订单并完成支付。
`);
    await fs.ensureDir(path.join(productDir, 'billing'));
    await fs.writeFile(path.join(productDir, 'billing', 'order-flow.md'), `---
tags:
  - finance
entities:
  - Invoice
aliases:
  - Billing
---
# Billing Order Flow

财务账单流。
`);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('generates a richer route table with paths, tags, entities, aliases and updated dates', async () => {
    const indexedCount = await updateMocIndexFile(indexPath, docsRoot);
    const content = await fs.readFile(indexPath, 'utf-8');

    expect(indexedCount).toBe(2);
    expect(content).toContain('| Doc Route (Bi-link) | Path | Tags | Core Entities | Aliases | Updated | Description |');
    expect(content).toContain('`product/order-flow.md`');
    expect(content).toContain('`product/billing/order-flow.md`');
    expect(content).toContain('[[billing/order-flow]]');
    expect(content).toContain('`product, checkout`');
    expect(content).toContain('`Order, Payment`');
  });

  it('ranks route candidates from frontmatter and document metadata', async () => {
    const documents = await buildMocRouteIndex(docsRoot);
    const matches = rankMocDocuments('支付 Checkout 订单 Order', documents);

    expect(matches[0].document.relativePath).toBe('product/order-flow.md');
    expect(matches[0].matchedTerms).toEqual(expect.arrayContaining(['Order', 'Checkout']));
  });

  it('discovers MOC index templates by anchor', async () => {
    await fs.writeFile(path.join(docsRoot, 'README.md'), '# Plain readme\n');

    await expect(findMocIndexFiles(docsRoot)).resolves.toEqual([indexPath]);
  });
});
