import type { ContextPacket } from '../../context/index.js';

export function renderCodexContextPacket(packet: ContextPacket): string {
  const lines = [
    `# aictx Context Packet`,
    ``,
    `- Status: ${packet.status}`,
    `- Bundle: ${packet.bundleVersion}`,
    `- Budget: ${packet.usedTokens}/${packet.budget}`,
    ``,
    ...(packet.status === 'context_stale'
      ? ['> Context is stale. Rebuild it before relying on this packet.', '']
      : []),
    ...(packet.budgetExceeded
      ? ['> Mandatory rules exceed the configured Token budget.', '']
      : []),
    `## Rules`,
    ...(packet.rules.length > 0
      ? packet.rules.flatMap(rule => [``, `### ${rule.sourcePath}`, ``, rule.content.trim()])
      : ['', '- No rules selected.']),
    ``,
    `## Documents`,
    ...(packet.documents.length > 0
      ? packet.documents.flatMap(document => [
        ``,
        `### ${document.path}`,
        ``,
        document.content.trim()
      ])
      : ['', '- No matching document within the current budget.']),
    ``,
    `## Graph`,
    packet.graph ? `- ${packet.graph.path} (${packet.graph.nodes} nodes, ${packet.graph.edges} edges)` : '- No graph in bundle.'
  ];

  return lines.join('\n');
}
