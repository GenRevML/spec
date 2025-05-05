#!/usr/bin/env node
import fs from 'node:fs';
import { parse } from './parser.js';
import { render } from './renderer.js';

/* helper makes whitespace visible in debug */
const vis = (ch: string) =>
  ch === ' '  ? '␠' :
  ch === '\n' ? '␤' :
  ch;

const [, , file, ...flags] = process.argv;
if (!file) {
  console.error('Usage: genrexml <file.grml> [--clean] [--debug]');
  process.exit(1);
}

const showEdits = !flags.includes('--clean');
const debug     =  flags.includes('--debug');

const data  = fs.readFileSync(file, 'utf8');
const nodes = parse(data);

if (debug) {
  console.log('\n--- PARSER OUTPUT ---');
  nodes.forEach((n, i) =>
    console.log(
      `${String(i).padStart(3)} ${n.tag.padEnd(8)}│ ${
        [...n.content].map(vis).join('') || '·'
      }`
    )
  );
  console.log('---------------------\n');
}

console.log(render(nodes, showEdits));
