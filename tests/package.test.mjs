// Package-level contract tests. Run after `pnpm build`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const patch = fs.readFileSync('cordis.patch.yml', 'utf8')

test('package metadata points at the bundle patch and entries', () => {
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(pkg.files.includes('cordis.patch.yml'))
  assert.ok(pkg.keywords.includes('deepseek-harness'))
  assert.equal(pkg.exports['.'], './lib/index.js')
  if (pkg.dsh.client) assert.equal(pkg.exports['./client'], './lib/client.js')
})

// `dsh plugin add` installs with pnpm 11 in the user's profile, which blocks
// lifecycle scripts and non-registry sub-dependencies and skips peers.
// See playbooks/reference/installing.md.
test('package installs cleanly into a DSH profile', () => {
  const lifecycle = ['preinstall', 'install', 'postinstall', 'prepare', 'prepack']
  for (const script of lifecycle)
    assert.equal(pkg.scripts?.[script], undefined, `remove the "${script}" script`)
  for (const [dep, spec] of Object.entries(pkg.dependencies ?? {}))
    assert.doesNotMatch(
      spec,
      /^(git|github:|https?:|file:|link:)|\.git(#|$)|\.tgz$/,
      `dependency ${dep} must come from the npm registry`,
    )
  for (const peer of Object.keys(pkg.peerDependencies ?? {}))
    assert.match(peer, /^@deepseek-ai\//, `peer ${peer} is not provided by DSH`)
})

test('cordis patch inserts this package', () => {
  assert.match(patch, new RegExp(`^\\s+name: ${pkg.name}$`, 'm'))
})

test('host entry mounts and unloads in Cordis', async () => {
  const plugin = await import('../lib/index.js')
  assert.equal(plugin.name, pkg.name)
  assert.equal(typeof plugin.apply, 'function')
  const ctx = new Context()
  const fiber = await ctx.plugin(plugin, {})
  await fiber.dispose()
})

test('client bundle registers with the DSH module loader', async (t) => {
  if (!pkg.dsh.client) return t.skip('host-only plugin')
  const source = fs.readFileSync('lib/client.js', 'utf8')
  let loaded
  const window = { __ModuleLoader__: { load: (entry) => (loaded = entry) } }
  new Function('window', source)(window)
  assert.equal(loaded.id, pkg.name)
  const exports = loaded.factory(() => ({}))
  assert.equal(typeof exports.apply, 'function')
})
