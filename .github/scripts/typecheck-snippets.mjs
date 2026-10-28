// Typechecks MDX code snippets that import from `checkly` against the
// installed Checkly CLI constructs, so docs examples don't drift from the CLI.
//
// Complete snippets (ones with a `checkly` import) are checked. Fragments are
// checked when `{/* typecheck-wrap: ApiCheck */}` (or `{/* typecheck-wrap */}`
// for statements) is on the line before their fence. Snippets with a `/* More options... */` comment may omit required
// props. Opt a block out with `{/* typecheck-skip */}` on the line before it.
//
// Usage: node .github/scripts/typecheck-snippets.mjs [root]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SKIP_MARKER = '{/* typecheck-skip */}';
const WRAP_MARKER = /^\{\/\* typecheck-wrap(?:: (\w+))? \*\/\}$/;
const LANGS = { ts: 'ts', typescript: 'ts', js: 'js', javascript: 'js' };
const CHECKLY_IMPORT = /from\s+['"]checkly(\/[\w-]+)?['"]/;

export function extractSnippets(mdx, file) {
  const lines = mdx.split('\n');
  const snippets = [];
  let open = null;

  lines.forEach((text, i) => {
    if (!open) {
      const match = text.match(/^(\s*)```(\S*)/);
      if (!match) return;
      let prev = i - 1;
      while (prev >= 0 && lines[prev].trim() === '') prev--;
      const marker = prev >= 0 ? lines[prev].trim() : '';
      const wrap = marker.match(WRAP_MARKER);
      open = { indent: match[1].length, ext: LANGS[match[2]], start: i + 1, body: [], skip: marker === SKIP_MARKER, wrap: wrap ? wrap[1] ?? true : undefined };
      return;
    }
    if (/^\s*```\s*$/.test(text)) {
      const code = open.body.join('\n');
      if (open.ext && !open.skip && (open.wrap || CHECKLY_IMPORT.test(code))) {
        snippets.push({ file, line: open.start + 1, ext: open.ext, code, ...(open.wrap && { wrap: open.wrap }) });
      }
      open = null;
      return;
    }
    open.body.push(text.slice(Math.min(open.indent, text.length - text.trimStart().length)));
  });

  return snippets;
}

const compilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowJs: true,
  checkJs: true,
  skipLibCheck: true,
  noEmit: true,
  types: ['node'],
};

// Multi-file examples import siblings like `./group.check`. Those can't
// resolve here; the imports become `any`, which keeps the `checkly` usage checked.
const isUnresolvedRelativeImport = d => d.code === 2307 && /module '\.\.?\//.test(ts.flattenDiagnosticMessageText(d.messageText, '\n'));

// Usage snippets mark omitted props with `/* More options... */`. In those,
// a missing required prop is intended; wrong or unknown props still fail.
const PARTIAL_MARKER = /\/\*\s*More options/i;
const MISSING_PROPS = new Set([2739, 2740, 2741]);
const isOnlyMissingProps = d => d.code === 2345 && typeof d.messageText === 'object'
  && d.messageText.next?.length > 0 && d.messageText.next.every(n => MISSING_PROPS.has(n.code));

// Marked fragments get every runtime export of `checkly/constructs` and
// `checkly/util` imported, plus `defineConfig` and `path` for
// `path.join(__dirname, ...)` entrypoints. Property fragments (first code line
// is `key: ...`) are wrapped in the named construct as a partial snippet;
// statements like `new ApiCheck(...)` or `const x = ...` only get the imports.
const AUTO_IMPORTS = [
  `import { ${Object.keys(await import('checkly/constructs')).join(', ')} } from 'checkly/constructs'`,
  `import { ${Object.keys(await import('checkly/util')).join(', ')} } from 'checkly/util'`,
  `import { defineConfig } from 'checkly'`,
  `import * as path from 'node:path'`,
].join('; ');

const isPropertyFragment = code => /^\w+\??:\s/.test(code.split('\n').map(l => l.trim()).find(l => l && !l.startsWith('//')) ?? '');

function source(snippet) {
  if (!snippet.wrap) return { code: snippet.code, offset: 0 };
  if (typeof snippet.wrap !== 'string' || !isPropertyFragment(snippet.code)) return { code: `${AUTO_IMPORTS}\n${snippet.code}`, offset: 1 };
  return { code: `${AUTO_IMPORTS}\nnew ${snippet.wrap}('snippet', {\n/* More options... */\n${snippet.code}\n})`, offset: 3 };
}

export function typecheckSnippets(snippets) {
  const virtual = new Map(snippets.map((s, i) => [join(repoRoot, '.snippets', `${i}.${s.ext}`).split(sep).join('/'), { ...s, ...source(s) }]));
  const host = ts.createCompilerHost(compilerOptions);
  const { getSourceFile, fileExists, readFile } = host;
  host.fileExists = f => virtual.has(f) || fileExists(f);
  host.readFile = f => virtual.get(f)?.code ?? readFile(f);
  host.getSourceFile = (f, lang, ...rest) => virtual.has(f)
    ? ts.createSourceFile(f, virtual.get(f).code, lang, true)
    : getSourceFile(f, lang, ...rest);

  const program = ts.createProgram([...virtual.keys()], compilerOptions, host);
  const errors = [];

  for (const [path, snippet] of virtual) {
    const source = program.getSourceFile(path);
    const syntactic = program.getSyntacticDiagnostics(source);
    // Type errors on code that doesn't parse are noise; report the parse errors only.
    const partial = PARTIAL_MARKER.test(snippet.code);
    const diagnostics = syntactic.length > 0 ? syntactic : program.getSemanticDiagnostics(source)
      .filter(d => !isUnresolvedRelativeImport(d) && !(partial && isOnlyMissingProps(d)));
    for (const d of diagnostics) {
      const { line, character } = source.getLineAndCharacterOfPosition(d.start ?? 0);
      // Errors in generated wrapper lines point at the fragment's first line.
      errors.push({
        file: snippet.file,
        line: snippet.line + Math.max(0, line - snippet.offset),
        column: line < snippet.offset ? 1 : character + 1,
        message: `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`,
      });
    }
  }

  return errors;
}

function mdxFiles(root) {
  const ignoredDirs = ['node_modules', 'samples', '.git'];
  const mintignore = join(root, '.mintignore');
  if (existsSync(mintignore)) {
    for (const entry of readFileSync(mintignore, 'utf8').split('\n')) {
      const dir = entry.trim().match(/^([^*#][^*]*?)\/\*\*/)?.[1];
      if (dir) ignoredDirs.push(dir);
    }
  }

  const files = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.includes(relative(root, path).split(sep).join('/'))) walk(path);
      } else if (entry.name.endsWith('.mdx')) {
        files.push(path);
      }
    }
  };
  walk(root);
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? process.cwd();
  const snippets = mdxFiles(root).flatMap(path => extractSnippets(readFileSync(path, 'utf8'), relative(root, path).split(sep).join('/')));
  const errors = typecheckSnippets(snippets);

  for (const e of errors) {
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error file=${e.file},line=${e.line},col=${e.column}::${e.message.replace(/\n/g, '%0A')}`);
    } else {
      console.error(`${e.file}:${e.line}:${e.column} - ${e.message}`);
    }
  }

  const checklyVersion = JSON.parse(readFileSync(join(repoRoot, 'node_modules/checkly/package.json'), 'utf8')).version;
  console.log(`Typechecked ${snippets.length} snippets against checkly@${checklyVersion}: ${errors.length} error(s).`);
  if (errors.length > 0) process.exitCode = 1;
}
