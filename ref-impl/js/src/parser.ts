import { XMLParser } from 'fast-xml-parser';

export interface RevisionNode { tag: string; content: string; attrs?: Record<string,string>; }

const fxp = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  preserveOrder: true
});

/* ---------------------------------------------------------------------------
   Walk every node in document order, **including whitespace-only #text nodes**.
   --------------------------------------------------------------------------- */
export function parse(xml: string): RevisionNode[] {
  const wrapped = `<root>${xml}</root>`;
  const parsed  = fxp.parse(wrapped) as any;        // obj or array
  const rootArr = Array.isArray(parsed)
      ? (parsed.find((n: any) => n.root)?.root as any[] ?? [])
      : (parsed.root as any[] ?? []);

  const out: RevisionNode[] = [];
  recurse(rootArr, out);
  return out;
}

const edits = new Set(['ins','del','sub']);

function recurse(nodes: any[], out: RevisionNode[]) {
  for (const n of nodes) {
    const [k, v] = Object.entries(n)[0];

    if (k === '#text') {                    // keep ALL text – even whitespace
      out.push({ tag: 'text', content: v as string });
      continue;
    }

    const obj   = v as any;
    const attrs = obj[':@'] ?? undefined;
    const kids  = Array.isArray(obj) ? obj : (obj as any[]);

    if (edits.has(k)) {
      const text = kids.map((c: any) => ('#text' in c ? c['#text'] : '')).join('');
      out.push({ tag: k, content: text, attrs });
    } else {
      out.push({ tag: 'text', content: `<${k}${attrsToStr(attrs)}>` });
      if (Array.isArray(kids)) recurse(kids, out);
      out.push({ tag: 'text', content: `</${k}>` });
    }
  }
}

function attrsToStr(at?: Record<string,string>) {
  if (!at) return '';
  return ' ' + Object.entries(at).map(([k,v]) => `${k}="${v}"`).join(' ');
}
