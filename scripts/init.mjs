// Turns this template into a concrete plugin. Runs once; deletes itself.
//
//   node scripts/init.mjs --name dsh-foo --owner my-github \
//     --dsh-version 0.1.5-rc.2 [--title "Foo"] [--description "..."]
//     [--author "Me"] [--dsh-min 0.1.5-rc.2] [--keywords a,b]
//     [--host-only] [--no-npm] [--dry-run]
//
// See playbooks/00-init.md for how to choose each value.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATE_NAME = 'dsh-plugin-template'

const fail = (message) => {
  console.error(`init: ${message}`)
  process.exit(1)
}

const flags = new Set(['host-only', 'no-npm', 'dry-run'])
const options = new Set([
  'name',
  'owner',
  'dsh-version',
  'title',
  'description',
  'author',
  'dsh-min',
  'keywords',
])
const args = {}
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const key = argv[i].replace(/^--/, '')
  if (flags.has(key)) args[key] = true
  else if (options.has(key)) {
    const value = argv[++i]
    if (value === undefined || value.startsWith('--'))
      fail(`--${key} needs a value.`)
    args[key] = value
  } else fail(`unknown argument ${argv[i]}.`)
}

const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/

const pkgPath = path.join(root, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
if (pkg.name !== TEMPLATE_NAME)
  fail(`already initialized as ${pkg.name}; nothing to do.`)

const name = args.name
if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
  fail('--name must be a lowercase npm name, e.g. dsh-foo.')
if (name === TEMPLATE_NAME)
  fail(`--name must be the plugin's own name, not ${name}.`)
if (!name.startsWith('dsh-'))
  console.warn(
    `init: warning: ${name} does not follow the dsh-<slug> convention.`,
  )
if (!args.owner) fail('--owner (GitHub user or organization) is required.')
if (!/^[A-Za-z0-9](?:-?[A-Za-z0-9])*$/.test(args.owner))
  fail(`--owner ${args.owner} is not a GitHub user or organization name.`)
if (!args['dsh-version'])
  fail('--dsh-version (verified DSH version) is required.')
for (const key of ['dsh-version', 'dsh-min'])
  if (args[key] !== undefined && !semver.test(args[key]))
    fail(`--${key} must be an exact version such as 0.1.5 or 0.1.5-rc.2.`)

const hostOnly = Boolean(args['host-only'])
const title =
  args.title ??
  name
    .replace(/^dsh-/, '')
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
const values = {
  [TEMPLATE_NAME]: name,
  '{{PLUGIN_TITLE}}': title,
  '{{DESCRIPTION}}': args.description ?? `${title} for DeepSeek Harness.`,
  '{{OWNER}}': args.owner,
  '{{AUTHOR}}': args.author ?? args.owner,
  '{{DSH_VERSION}}': args['dsh-version'],
  // shields.io static badges use '-' as a separator.
  '{{DSH_VERSION_BADGE}}': args['dsh-version'].replace(/-/g, '--').replace(/_/g, '__'),
  '{{DSH_MIN_VERSION}}': args['dsh-min'] ?? args['dsh-version'],
  '{{DSH_PROFILE}}': hostOnly ? 'headless' : 'web',
}

const dryRun = Boolean(args['dry-run'])
const changes = []
const write = (file, content) => {
  changes.push(`write  ${path.relative(root, file)}`)
  if (!dryRun) fs.writeFileSync(file, content)
}
const remove = (file) => {
  if (!fs.existsSync(file)) return
  changes.push(`remove ${path.relative(root, file)}`)
  if (!dryRun) fs.rmSync(file, { recursive: true, force: true })
}

// Files that talk about the template itself keep its name.
const skipDirs = new Set(['.git', 'node_modules', 'lib', 'playbooks'])
const skipFiles = new Set([
  'LICENSE',
  'pnpm-lock.yaml',
  'scripts/init.mjs',
  'scripts/check-release.mjs',
  // Rewritten structurally below; text substitution could break the JSON.
  'package.json',
  // The template's own READMEs are replaced by .template/ below.
  'README.md',
  'README.en.md',
])
const skeletons = path.join(root, '.template')
const readmes = ['README.md', 'README.en.md']
if (readmes.some((file) => !fs.existsSync(path.join(skeletons, file))))
  fail('.template/README.md and .template/README.en.md are missing.')
const textExt = /\.(md|json|ya?ml|toml|ts|tsx|mjs|js|css)$|^\.[a-z]+$/

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(root, full).split(path.sep).join('/')
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name) && !skipDirs.has(rel)) yield* walk(full)
    } else if (!skipFiles.has(rel) && textExt.test(entry.name)) yield full
  }
}

const substitute = (text, escape = (value) => value) =>
  Object.entries(values).reduce(
    (out, [token, value]) => out.split(token).join(escape(value)),
    text,
  )

const dropBlock = (text, tag) =>
  text.replace(
    new RegExp(
      `[ \\t]*<!-- ${tag}:start -->[\\s\\S]*?<!-- ${tag}:end -->\\n?`,
      'g',
    ),
    '',
  )

for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8')
  let text = before
  if (file.endsWith('.md')) {
    text = dropBlock(text, 'template')
    if (args['no-npm']) text = dropBlock(text, 'npm')
    if (hostOnly) text = dropBlock(text, 'client')
    text = text.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '')
  }
  // Tokens in YAML sit inside single-quoted scalars, where ' is written ''.
  const escape = /\.ya?ml$/.test(file)
    ? (value) => value.replace(/'/g, "''")
    : (value) => value
  text = substitute(text, escape)
  if (text !== before) write(file, text)
}

// package.json gets its tokens replaced inside parsed string values, so any
// quote or backslash in --description or --author is escaped on write.
const nextPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'), (_, value) =>
  typeof value === 'string' ? substitute(value) : value,
)
nextPkg.version = '0.1.0'
delete nextPkg.scripts.init
// The token pass renamed the template; restore its credit.
nextPkg.template = pkg.template
if (args.keywords)
  nextPkg.keywords = [
    ...new Set([
      ...nextPkg.keywords,
      ...args.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    ]),
  ]
if (hostOnly) {
  delete nextPkg.dsh.client
  delete nextPkg.exports['./client']
  nextPkg.files = nextPkg.files.filter((file) => file !== 'lib/client.js')
  remove(path.join(root, 'src/client'))
  remove(path.join(root, 'lib/client.js'))
}
write(pkgPath, JSON.stringify(nextPkg, null, 2) + '\n')

// The plugin README skeletons (already filled in above) replace the template's.
for (const file of readmes) {
  changes.push(`copy   .template/${file} -> ${file}`)
  if (!dryRun)
    fs.copyFileSync(path.join(skeletons, file), path.join(root, file))
}
remove(skeletons)
remove(path.join(root, 'scripts/init.mjs'))

console.log(changes.join('\n'))
console.log(
  dryRun
    ? '\nDry run: nothing was written.'
    : `\nInitialized ${name}. Next: pnpm install && pnpm hooks:install && pnpm verify (playbooks/00-init.md step 4).`,
)
