import { describe, expect, it } from 'vitest';
import cac from 'cac';
import { contextCommand } from '../src/commands/context.js';
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
});
