// Builds lib/index.js (host, Node ESM) and lib/client.js (client, lazy-CJS
// factory for the DSH module loader). The client build is skipped when the
// package declares no dsh.client entry.
import { build } from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lib = path.join(root, 'lib')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const define = {
  __PLUGIN_NAME__: JSON.stringify(pkg.name),
  __PLUGIN_VERSION__: JSON.stringify(pkg.version),
}

// Build output must be byte-identical on Windows and Linux.
const normalizeTextNewlines = {
  name: 'normalize-text-newlines',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path: file }) => ({
      contents: (await fs.promises.readFile(file, 'utf8')).replace(
        /\r\n?/g,
        '\n',
      ),
      loader: 'text',
    }))
  },
}

// Host: DSH packages and node builtins resolve from the install tree.
await build({
  define,
  entryPoints: [path.join(root, 'src/host/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: path.join(lib, 'index.js'),
  external: ['@deepseek-ai/*', 'node:*'],
  logLevel: 'info',
})

if (pkg.dsh?.client) {
  const client = await build({
    define,
    entryPoints: [path.join(root, 'src/client/entry.ts')],
    bundle: true,
    platform: 'browser',
    format: 'cjs',
    target: 'es2020',
    jsx: 'automatic',
    plugins: [normalizeTextNewlines],
    external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
    write: false,
    logLevel: 'info',
  })
  const wrapped = [
    'window.__ModuleLoader__.load({',
    `  id: ${JSON.stringify(pkg.name)},`,
    '  factory: (require) => {',
    '    var module = { exports: {} };',
    '    var exports = module.exports;',
    client.outputFiles[0].text,
    '    return module.exports;',
    '  },',
    '});',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(lib, 'client.js'), wrapped)
}

console.log(`built ${pkg.name}@${pkg.version}`)
