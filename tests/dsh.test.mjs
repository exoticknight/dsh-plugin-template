import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const dshSource = fileURLToPath(new URL('../scripts/dsh.mjs', import.meta.url))

function runPrepareDsh(t, shim, layout) {
  const tempBase = fs.realpathSync(os.tmpdir())
  const tempRoot = fs.mkdtempSync(path.join(tempBase, 'dsh-bin-from-command-'))
  const pluginRoot = path.join(tempRoot, 'plugin')
  const scriptPath = path.join(pluginRoot, 'scripts', 'dsh.mjs')
  const commandDir = path.join(tempRoot, 'path with spaces')
  const marker = path.join(tempRoot, 'cli-executed')

  t.after(() => {
    assert.ok(path.isAbsolute(tempRoot))
    assert.equal(path.dirname(tempRoot).toLowerCase(), tempBase.toLowerCase())
    assert.match(path.basename(tempRoot), /^dsh-bin-from-command-/)
    fs.rmSync(tempRoot, { recursive: true, force: true })
  })

  fs.mkdirSync(path.dirname(scriptPath), { recursive: true })
  fs.copyFileSync(dshSource, scriptPath)
  fs.writeFileSync(path.join(pluginRoot, 'package.json'), '{"name":"test-plugin"}')
  fs.mkdirSync(commandDir, { recursive: true })

  const bin = layout(commandDir, tempRoot)
  fs.mkdirSync(path.dirname(bin), { recursive: true })
  fs.writeFileSync(bin, `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran')`)
  fs.writeFileSync(
    path.join(path.dirname(bin), '..', 'package.json'),
    '{"version":"0.0.0-test"}',
  )
  const command = path.join(commandDir, process.platform === 'win32' ? 'dsh.cmd' : 'dsh')
  fs.writeFileSync(command, shim(bin))

  const env = { ...process.env }
  for (const key of Object.keys(env))
    if (['path', 'dsh_bin', 'dsh_home'].includes(key.toLowerCase())) delete env[key]
  env.PATH = commandDir

  const bootstrap = `import(${JSON.stringify(pathToFileURL(scriptPath).href)}).then(({ prepareDsh }) => prepareDsh())`
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', bootstrap], {
    cwd: pluginRoot,
    env,
    encoding: 'utf8',
    timeout: 10000,
  })
  return { result, marker, bin }
}

function assertAskFirst({ result, marker, bin }) {
  assert.equal(result.error, undefined, result.error?.message)
  assert.equal(result.status, 1, result.stderr)
  assert.match(result.stderr, /Ask the user first\./)
  assert.ok(result.stderr.includes(bin), result.stderr)
  assert.equal(fs.existsSync(marker), false, 'the fake CLI must not run')
}

test('asks before using a desktop DSH_BIN path with spaces and a single quote', (t) => {
  const { result, marker, bin } = runPrepareDsh(
    t,
    (absoluteBin) => `@echo off\r\nset "DSH_BIN=${absoluteBin}"\r\n`,
    (_commandDir, tempRoot) =>
      path.join(tempRoot, "user's DSH installation", 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
  )
  assertAskFirst({ result, marker, bin })
})

test('asks before using an npm-style relative DSH path', (t) => {
  const { result, marker, bin } = runPrepareDsh(
    t,
    () =>
      process.platform === 'win32'
        ? '"%dp0%\\node_modules\\@deepseek-ai\\dsh\\lib\\bin.js"\r\n'
        : '"$basedir/node_modules/@deepseek-ai/dsh/lib/bin.js"\n',
    (commandDir) => path.join(commandDir, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
  )
  assertAskFirst({ result, marker, bin })
})
