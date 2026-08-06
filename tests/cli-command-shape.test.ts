import { describe, expect, it } from 'vitest';
import cac from 'cac';
import { contextCommand } from '../src/commands/context.js';
import { routeCommand, shouldUseCodexRouteFallback } from '../src/commands/route.js';
import { runCommand } from '../src/commands/run.js';

describe('runtime CLI command shape', () => {
  it('registers real top-level commands instead of unsupported pseudo-subcommands', () => {
    const cli = cac('aictx-test');
    contextCommand(cli);
    runCommand(cli);

    expect(cli.commands.map(command => command.name)).toEqual(['context', 'run']);
    expect(cli.commands.map(command => command.rawName)).toEqual([
      'context <action> [...args]',
      'run <action> [run-id]'
    ]);
  });

  it('registers optional Codex fallback without changing the default route command', () => {
    const cli = cac('aictx-test');
    routeCommand(cli);
    const route = cli.commands[0];

    expect(route.options.map(option => option.rawName)).toEqual(expect.arrayContaining([
      '--ai-fallback',
      '--codex-command <command>',
      '--ai-timeout <seconds>'
    ]));
  });

  it('uses Codex only for empty, weak or tied local results', () => {
    const document = {
      filePath: '/tmp/doc.md',
      relativePath: 'doc.md',
      routePath: 'doc.md',
      linkTarget: 'doc',
      linkLabel: 'doc',
      title: 'Doc',
      description: 'Doc',
      tags: [],
      entities: [],
      aliases: [],
      searchText: '',
      updated: '2026-08-06',
      sourceIndexPath: '/tmp/00-Index.md'
    };
    const match = (score: number, relativePath: string) => ({
      document: { ...document, relativePath },
      score,
      matchedTerms: []
    });

    expect(shouldUseCodexRouteFallback([])).toBe(true);
    expect(shouldUseCodexRouteFallback([match(3, 'weak.md')])).toBe(true);
    expect(shouldUseCodexRouteFallback([match(5, 'a.md'), match(5, 'b.md')])).toBe(true);
    expect(shouldUseCodexRouteFallback([match(5, 'a.md'), match(3, 'b.md')])).toBe(false);
  });
});
