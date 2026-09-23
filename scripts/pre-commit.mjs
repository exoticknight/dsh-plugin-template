// Rebuilds lib/ before each commit so source-backed installs (github:, dsh.pub)
// always see artifacts that match the committed source.
import { spawnSync } from 'node:child_process'

const buildInputs = [
  'src',
  'scripts/build.mjs',
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
]

const git = (args, options = {}) =>
  spawnSync('git', args, { encoding: 'utf8', ...options })

const staged = git(['diff', '--cached', '--name-only', '--', ...buildInputs])
if (staged.status !== 0) {
  console.error('Could not read staged files.')
  process.exit(1)
}
if (!staged.stdout.trim()) process.exit(0)

// lib must be built from exactly what is being committed.
const unstaged = git(['diff', '--quiet', '--', ...buildInputs])
if (unstaged.status === 1) {
  console.error(
    'Stage or stash the remaining build-input changes so lib matches the commit.',
  )
  process.exit(1)
}
const untracked = git([
  'ls-files',
  '--others',
  '--exclude-standard',
  '--',
  'src',
])
if (untracked.stdout.trim()) {
  console.error('Stage new source files so lib matches the commit.')
  process.exit(1)
}

const build =
  process.platform === 'win32'
    ? spawnSync('pnpm.cmd build', { stdio: 'inherit', shell: true })
    : spawnSync('pnpm', ['build'], { stdio: 'inherit' })
if (build.error || build.status !== 0) process.exit(build.status ?? 1)

const add = git(['add', '--', 'lib'], { stdio: 'inherit' })
process.exit(add.status ?? 1)
