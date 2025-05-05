import chalk from 'chalk';
import { RevisionNode } from './parser.js';

/* ------------------------------------------------------------------
   render(nodes, showEdits)
   • Always puts ONE space before & after every non-whitespace token.
   • ins / del / sub blocks get ASCII diff boxes when showEdits=true.
   • Collapse any accidental duplicate spaces at the end.
   -----------------------------------------------------------------*/
export function render(nodes: RevisionNode[], showEdits = true): string {
  const out: string[] = [];

  const push = (s: string) => {
    if (!s) return;
    // ensure a single leading space unless we're at the beginning
    if (out.length) out.push(' ');
    out.push(s);
  };

  for (const n of nodes) {
    if (n.tag === 'text') {
      // plain text, keep exactly as is
      push(n.content.trim() === '' ? n.content : n.content);
      continue;
    }

    /* ---- edit tags ------------------------------------------------ */
    if (n.tag === 'ins') {
      push(showEdits ? chalk.green(`[+${n.content}]`) : n.content);
      continue;
    }
    if (n.tag === 'del') {
      if (showEdits) push(chalk.red(`[-${n.content}]`));
      continue; // in clean mode deletions disappear
    }
    if (n.tag === 'sub') {
      push(showEdits ? chalk.yellow(`[~${n.content}]`) : n.content);
      continue;
    }

    /* ---- any other inline tag ------------------------------------ */
    const open  = `<${n.tag}>`;
    const close = `</${n.tag}>`;
    if (showEdits) {
      push(`${open}${n.content}${close}`);
    } else {
      push(n.content);
    }
  }

  /* Collapse multiple spaces/newlines that may have accumulated */
  return out.join('').replace(/\s+/g, ' ').trim();
}
