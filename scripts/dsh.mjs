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
import { fileURLToPath } from 'node:url'

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
export const pkg = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
)
export const defaultProfile = pkg.dsh?.client ? 'web' : 'headless'

// DSH_BIN, then a project-local dev dependency. Never a PATH shim.
export function resolveDshBin() {
  const candidates = [
    process.env.DSH_BIN,
    path.join(root, 'node_modules/@deepseek-ai/dsh/lib/bin.js'),
  ].filter(Boolean)
  const bin = candidates.find((file) => fs.existsSync(file))
  if (bin) return path.resolve(bin)
  throw new Error(
    [
      'No DSH CLI found for isolated runs. Either:',
      `  pnpm add -D @deepseek-ai/dsh@<verified DSH version>`,
      '  or set DSH_BIN to an installed .../@deepseek-ai/dsh/lib/bin.js',
      '`dsh` on PATH is not used: launcher shims may ignore DSH_HOME.',
    ].join('\n'),
  )
}

// The user's own home must never be the target of an isolated run.
function assertIsolated(home) {
  const resolved = path.resolve(home)
  const daily = [
    path.join(os.homedir(), '.dsh'),
    process.env.DSH_HOME && path.resolve(process.env.DSH_HOME),
  ].filter(Boolean)
  if (daily.some((dir) => resolved.toLowerCase() === dir.toLowerCase()))
    throw new Error(`Refusing to use the daily DSH home ${resolved}.`)
  return resolved
}

// Returns the exit status; with `capture`, returns { status, stdout } instead.
export function runDsh(home, args, { capture = false } = {}) {
  const env = { ...process.env, DSH_HOME: assertIsolated(home) }
  const result = spawnSync(process.execPath, [resolveDshBin(), ...args], {
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
