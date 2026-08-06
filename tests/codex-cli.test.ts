import { describe, expect, it } from 'vitest';
import {
  checkCodexCliAvailability,
  runCodexRouteFallback,
  type CodexProcessRunner
} from '../src/runtime/adapters/codex-cli.js';

function missingCommand(): Error & { code: string } {
  return Object.assign(new Error('spawn codex ENOENT'), { code: 'ENOENT' });
}

describe('Codex CLI route fallback', () => {
  it('reports a missing Codex CLI without throwing', async () => {
    const runner: CodexProcessRunner = async () => { throw missingCommand(); };

    await expect(checkCodexCliAvailability({ runner })).resolves.toMatchObject({
      available: false,
      reason: 'not_found'
    });
  });

  it('reports an installed but unauthenticated Codex CLI', async () => {
    const runner: CodexProcessRunner = async (_command, args) => {
      if (args[0] === '--version') return { stdout: 'codex-cli 1.0.0', stderr: '' };
      throw new Error('Not logged in');
    };

    await expect(checkCodexCliAvailability({ runner })).resolves.toMatchObject({
      available: false,
      reason: 'not_authenticated',
      version: 'codex-cli 1.0.0'
    });
  });

  it('returns only known MOC paths from structured Codex output', async () => {
    const runner: CodexProcessRunner = async (_command, args) => {
      if (args[0] === '--version') return { stdout: 'codex-cli 1.0.0', stderr: '' };
      if (args[0] === 'login') return { stdout: 'Logged in', stderr: '' };
      return {
        stdout: JSON.stringify({
          matches: [
            { path: 'product/refund.md', reason: '退款申请流程', confidence: 0.9 },
            { path: '../secret.md', reason: 'invalid path', confidence: 1 }
          ]
        }),
        stderr: ''
      };
    };

    const result = await runCodexRouteFallback({
      question: '客户怎样申请退钱？',
      projectDir: process.cwd(),
      docsRoot: 'aictx-docs',
      documents: [{
        relativePath: 'product/refund.md',
        title: '售后退款',
        description: '退款申请与审核',
        tags: ['after-sales'],
        entities: ['Refund'],
        aliases: ['退钱']
      }],
      limit: 3,
      runner
    });

    expect(result).toMatchObject({
      status: 'success',
      matches: [{ path: 'product/refund.md', confidence: 0.9 }]
    });
  });

  it('degrades cleanly when Codex execution times out', async () => {
    let calls = 0;
    const runner: CodexProcessRunner = async () => {
      calls += 1;
      if (calls === 1) return { stdout: 'codex-cli 1.0.0', stderr: '' };
      if (calls === 2) return { stdout: 'Logged in', stderr: '' };
      throw Object.assign(new Error('Timed out'), { timedOut: true });
    };

    const result = await runCodexRouteFallback({
      question: 'ambiguous question',
      projectDir: process.cwd(),
      docsRoot: 'aictx-docs',
      documents: [],
      limit: 3,
      runner
    });

    expect(result.status).toBe('timed_out');
  });
});
