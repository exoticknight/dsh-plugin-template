import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import {
  DEFAULT_DSH_SELECTOR,
  latestDshVersion,
} from '../scripts/dsh-version.mjs'

test('the newest stable release is preferred, with the newest prerelease as fallback', () => {
  assert.equal(DEFAULT_DSH_SELECTOR, 'stable')
  assert.deepEqual(latestDshVersion({
    getVersions: () => ['0.9.0', '1.1.0-rc.1', '1.0.0', '1.0.1-alpha.1'],
  }), { version: '1.0.0', channel: 'stable' })
  assert.deepEqual(latestDshVersion({
    getVersions: () => ['0.2.1-rc.2', '0.2.1-rc.4', '0.2.1-alpha.5'],
  }), { version: '0.2.1-rc.4', channel: 'prerelease' })
  assert.throws(
    () => latestDshVersion({ getVersions: () => [] }),
    /No @deepseek-ai\/dsh version is published/,
  )
})

function fixture(t) {
  const base = path.resolve('.tmp')
  fs.mkdirSync(base, { recursive: true })
  const root = fs.mkdtempSync(path.join(base, 'init-'))
  for (const item of ['scripts', 'src', '.template', 'docs', 'package.json', 'cordis.patch.yml', 'AGENTS.md'])
    fs.cpSync(path.resolve(item), path.join(root, item), { recursive: true })
  fs.mkdirSync(path.join(root, '.dsh-cli'))
  fs.writeFileSync(path.join(root, '.dsh-cli', 'untouched.md'), 'dsh-plugin-template')
  t.after(() => {
    assert.equal(path.dirname(root), base)
    assert.match(path.basename(root), /^init-/)
    fs.rmSync(root, { recursive: true, force: true })
  })
  return {
    root,
    run: (...args) => spawnSync(process.execPath, ['scripts/init.mjs', '--name', 'dsh-fixture', '--owner', 'fixture', ...args], { cwd: root, encoding: 'utf8' }),
    read: (p) => fs.readFileSync(path.join(root, p), 'utf8'),
  }
}

const initialized = !fs.existsSync('scripts/init.mjs')
test('init permits every DSH version and leaves isolated tools alone', { skip: initialized }, (t) => {
  const f = fixture(t)
  const result = f.run()
  assert.equal(result.status, 0, result.stderr)
  const pkg = JSON.parse(f.read('package.json'))
  assert.equal(pkg.config.dshVersion, 'stable')
  assert.equal(pkg.engines.dsh, '*')
  assert.equal(pkg.peerDependencies['@deepseek-ai/dsh'], '*')
  assert.equal(pkg.peerDependenciesMeta['@deepseek-ai/dsh'].optional, true)
  assert.equal(f.read('.dsh-cli/untouched.md'), 'dsh-plugin-template')
  for (const file of ['README.md', 'README.en.md', 'docs/compatibility.md'])
    assert.doesNotMatch(f.read(file), /\{\{[A-Z_]+\}\}/, `${file} has a leftover placeholder`)
  assert.match(f.read('README.md'), /不声明 DSH 安装版本门槛/)
  assert.match(f.read('README.en.md'), /No DSH version floor is declared/)
  for (const file of ['README.md', 'README.en.md'])
    assert.doesNotMatch(f.read(file), /badge\/DSH-/)
  assert.match(f.read('docs/compatibility.md'), /DSH install gate\s+\| None/)
  assert.match(f.read('docs/compatibility.md'), /engines\.dsh: "\*"/)
  assert.equal(fs.existsSync(path.join(f.root, 'scripts/init.mjs')), false)
})

test('host-only and no-npm work together without version flags', { skip: initialized }, (t) => {
  const f = fixture(t)
  const result = f.run('--host-only', '--no-npm')
  assert.equal(result.status, 0, result.stderr)
  const pkg = JSON.parse(f.read('package.json'))
  assert.equal(pkg.engines.dsh, '*')
  assert.equal(pkg.peerDependencies['@deepseek-ai/dsh'], '*')
  assert.equal(pkg.dsh.client, undefined)
  assert.equal(pkg.exports['./client'], undefined)
  assert.doesNotMatch(f.read('README.en.md'), /From npm/)
})

test('removed version flags and dry runs do not mutate the scaffold', { skip: initialized }, (t) => {
  const f = fixture(t)
  const before = f.read('package.json')
  assert.equal(f.run('--dsh-version', '1.2.3').status, 1)
  assert.equal(f.run('--dsh-min', '1.2.3').status, 1)
  assert.equal(f.run('--dry-run').status, 0)
  assert.equal(f.read('package.json'), before)
  assert.ok(fs.existsSync(path.join(f.root, 'scripts/init.mjs')))
})

test('dev:cli refuses a version override', () => {
  const result = spawnSync(process.execPath, ['scripts/dev.mjs', 'cli', '0.2.0-rc.2'], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /latest stable DSH, or the latest prerelease when no stable exists/)
})
