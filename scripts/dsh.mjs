// Runs the real DSH CLI against an isolated DSH home, never the user's own.
//
// `dsh` on PATH may be a launcher shim that overwrites DSH_HOME (desktop
// apps do this), so isolation through the environment alone is unreliable.
// This module runs `@deepseek-ai/dsh/lib/bin.js` directly with node and
// verifies afterwards that the profile really lives in the isolated home.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
export const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
)
export const defaultProfile = pkg.dsh?.client ? 'web' : 'headless'

// A DSH CLI installed only for testing this plugin (`pnpm dev:cli`).
export const cliDir = path.join(root, '.dsh-cli')
const binSuffix = /[\\/]@deepseek-ai[\\/]dsh[\\/]lib[\\/]bin\.js$/

const isFile = (file) => {
  try {
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}

const versionOf = (bin) => {
  try {
    const manifest = path.join(path.dirname(bin), '..', 'package.json')
    return JSON.parse(fs.readFileSync(manifest, 'utf8')).version
  } catch {
    return 'unknown version'
  }
}

// The bin.js behind a `dsh` command: the file itself when it is a symlink
// (npm on Unix), otherwise the path written in the shim (npm/pnpm .cmd and
// sh shims, the desktop launcher's DSH_BIN).
function binFromCommand(file) {
  const real = fs.realpathSync(file)
  if (binSuffix.test(real)) return real
  if (fs.statSync(real).size > 64 * 1024) return undefined
  const text = fs.readFileSync(real, 'utf8')
  // Keep quoted paths intact, including spaces and the other quote character.
  // Desktop cmd shims quote the whole DSH_BIN=... assignment; npm/pnpm
  // shims quote the path itself. Read these forms without executing the shim.
  const refs = text.matchAll(/"([^"\r\n]*)"|'([^'\r\n]*)'|([^\s"'=]+)/g)
  for (const match of refs) {
    const ref = (match[1] ?? match[2] ?? match[3]).replace(/^DSH_BIN=/i, '')
    if (!binSuffix.test(ref)) continue
    const relative = ref.replace(/^(%~dp0|%dp0%|\$basedir|\$PSScriptRoot)/i, '.')
    const bin = path.resolve(path.dirname(real), relative)
    if (isFile(bin)) return bin
  }
}

// The DSH CLI this machine uses day to day, found through `dsh` on PATH.
function findLocalDsh() {
  const names =
    process.platform === 'win32' ? ['dsh.cmd', 'dsh.exe', 'dsh'] : ['dsh']
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)
  for (const dir of dirs)
    for (const name of names) {
      const command = path.join(dir, name)
      if (!isFile(command)) continue
      const bin = binFromCommand(command)
      if (bin) return { command, bin }
    }
}

// Asks before running the machine's own DSH CLI. Without a terminal to ask
// in (an agent, CI) it stops and explains how to opt in.
async function confirmLocal({ command, bin }) {
  const notice = [
    'No isolated DSH CLI found (DSH_BIN or .dsh-cli/).',
    `This machine's DSH CLI is available: ${bin}`,
    `  version ${versionOf(bin)}, found through ${command}`,
    'It is the installation you use every day. It would run with node against',
    'the isolated home only, and the install is verified afterwards, but its',
    'version is whatever that installation has, not one chosen for this plugin.',
    'Recommended instead: pnpm dev:cli [version]  (installs DSH into .dsh-cli/)',
  ].join('\n')
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error(
      `${notice}\nAsk the user first. To use it anyway, set DSH_BIN=${bin}`,
    )
  console.warn(notice)
  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const answer = await prompt.question("Use this machine's DSH CLI? [y/N] ")
  prompt.close()
  if (!/^y(es)?$/i.test(answer.trim()))
    throw new Error('Stopped. Run pnpm dev:cli to install an isolated DSH CLI.')
  return bin
}

let dshBin

// Picks the DSH CLI for isolated runs, in order: DSH_BIN, the isolated CLI
// in .dsh-cli/, then this machine's own CLI after the user agrees. Call once
// before runDsh. `dsh` on PATH is never executed: only its bin.js is.
export async function prepareDsh() {
  try {
    dshBin = await chooseDsh()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`DSH CLI ${versionOf(dshBin)}: ${dshBin}`)
  return dshBin
}

async function chooseDsh() {
  const explicit = process.env.DSH_BIN
  const isolated = path.join(cliDir, 'node_modules/@deepseek-ai/dsh/lib/bin.js')
  if (explicit) {
    if (!isFile(explicit)) throw new Error(`DSH_BIN ${explicit} does not exist.`)
    return path.resolve(explicit)
  }
  if (isFile(isolated)) return isolated
  const local = findLocalDsh()
  if (local) return confirmLocal(local)
  throw new Error(
    [
      'No DSH CLI found for isolated runs. Either:',
      '  pnpm dev:cli [version]   install one into .dsh-cli/ (recommended)',
      '  or set DSH_BIN to an installed .../@deepseek-ai/dsh/lib/bin.js',
    ].join('\n'),
  )
}

// Follows symlinks and junctions through the deepest existing ancestor, so a
// link that points at the daily home compares equal to it.
function realPath(file) {
  const resolved = path.resolve(file)
  const parent = path.dirname(resolved)
  try {
    return fs.realpathSync.native(resolved)
  } catch {
    if (parent === resolved) return resolved
    return path.join(realPath(parent), path.basename(resolved))
  }
}

// The user's own home must never be the target of an isolated run.
function assertIsolated(home) {
  const resolved = path.resolve(home)
  const real = realPath(resolved).toLowerCase()
  const daily = [
    path.join(os.homedir(), '.dsh'),
    process.env.DSH_HOME,
  ].filter(Boolean)
  if (daily.some((dir) => realPath(dir).toLowerCase() === real))
    throw new Error(`Refusing to use the daily DSH home ${resolved}.`)
  return resolved
}

// Returns the exit status; with `capture`, returns { status, stdout } instead.
export function runDsh(home, args, { capture = false } = {}) {
  const env = { ...process.env, DSH_HOME: assertIsolated(home) }
  if (!dshBin) throw new Error('Call prepareDsh() before runDsh().')
  const result = spawnSync(process.execPath, [dshBin, ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  })
  if (result.error) throw result.error
  const status = result.status ?? 1
  return capture ? { status, stdout: result.stdout } : status
}

// The composed config must contain this package's bundle section.
export function assertMounted(home, profile, name = pkg.name) {
  const { status, stdout } = runDsh(
    home,
    ['--profile', profile, '--dump-config'],
    { capture: true },
  )
  if (status !== 0 || !stdout.includes(`# == ${name}`))
    throw new Error(`--dump-config for ${profile} has no "# == ${name}" section.`)
}

// Proof that the install landed in `home`: the profile manifest exists there
// and lists this package as an active bundle.
export function assertInstalled(home, profile, name = pkg.name) {
  const manifest = path.join(home, 'profiles', profile, 'package.json')
  if (!fs.existsSync(manifest))
    throw new Error(
      `Isolation check failed: ${manifest} does not exist. The DSH CLI did not use DSH_HOME=${home}. Stop and check which home was modified.`,
    )
  const bundles =
    JSON.parse(fs.readFileSync(manifest, 'utf8')).dsh?.profile?.bundles ?? []
  if (!bundles.includes(name))
    throw new Error(`${name} is not an active bundle in ${manifest}.`)
}

// Create a fresh temporary home and hand back a cleanup that can only remove
// that exact directory.
export function createTempHome() {
  const base = fs.realpathSync(os.tmpdir())
  const home = fs.mkdtempSync(path.join(base, 'dsh-smoke-'))
  const cleanup = () => {
    if (path.dirname(home) !== base || !path.basename(home).startsWith('dsh-smoke-'))
      throw new Error(`Refusing to delete unexpected path ${home}.`)
    fs.rmSync(home, { recursive: true, force: true })
  }
  return { home, cleanup }
}
