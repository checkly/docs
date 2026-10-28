// Typechecks MDX code snippets that import from `checkly` against the
// installed Checkly CLI constructs, so docs examples don't drift from the CLI.
//
// Only complete snippets (ones with a `checkly` import) are checked. Opt a
// block out by putting `{/* typecheck-skip */}` on the line before its fence.
//
// Usage: node .github/scripts/typecheck-snippets.mjs [root]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SKIP_MARKER = '{/* typecheck-skip */}';
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
      open = { indent: match[1].length, ext: LANGS[match[2]], start: i + 1, body: [], skip: prev >= 0 && lines[prev].trim() === SKIP_MARKER };
      return;
    }
    if (/^\s*```\s*$/.test(text)) {
      const code = open.body.join('\n');
      if (open.ext && !open.skip && CHECKLY_IMPORT.test(code)) {
        snippets.push({ file, line: open.start + 1, ext: open.ext, code });
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

export function typecheckSnippets(snippets) {
  const virtual = new Map(snippets.map((s, i) => [join(repoRoot, '.snippets', `${i}.${s.ext}`).split(sep).join('/'), s]));
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
    const diagnostics = syntactic.length > 0 ? syntactic : program.getSemanticDiagnostics(source).filter(d => !isUnresolvedRelativeImport(d));
    for (const d of diagnostics) {
      const { line, character } = source.getLineAndCharacterOfPosition(d.start ?? 0);
      errors.push({
        file: snippet.file,
        line: snippet.line + line,
        column: character + 1,
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
