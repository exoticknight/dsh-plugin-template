// Development install: this checkout, linked into the isolated DSH home
// `.dsh-dev/` inside the repository. Your daily DSH home is never touched.
//
//   node scripts/dev.mjs cli            install the latest stable DSH into .dsh-cli
//   node scripts/dev.mjs install        link this checkout into .dsh-dev
//   node scripts/dev.mjs start          install, then start the web profile on a free port
//   node scripts/dev.mjs run <args...>  run any dsh command against .dsh-dev
//   node scripts/dev.mjs clean          delete .dsh-dev
//
// DSH_PROFILE overrides the profile (default: web, or headless without a client).
// See scripts/dsh.mjs for how the DSH CLI is located and isolation is verified.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  DEFAULT_DSH_SELECTOR,
  latestStableDshVersion,
} from './dsh-version.mjs'
import {
  assertInstalled,
  assertMounted,
  cliDir,
  defaultProfile,
  pkg,
  prepareDsh,
  root,
  runDsh,
} from './dsh.mjs'

const home = path.join(root, '.dsh-dev')
const profile = process.env.DSH_PROFILE ?? defaultProfile
const [command = 'start', ...rest] = process.argv.slice(2)

const check = (status) => {
  if (status !== 0) process.exit(status)
}

if (command === 'clean') {
  // Only ever the literal .dsh-dev directory of this repository.
  if (path.basename(home) !== '.dsh-dev' || path.dirname(home) !== root)
    throw new Error(`Refusing to delete ${home}.`)
  fs.rmSync(home, { recursive: true, force: true })
  console.log(`Removed ${home}.`)
  process.exit(0)
}

if (command === 'cli') {
  if (rest.length) {
    console.error(
      'dev: pnpm dev:cli always installs the latest stable DSH release; pass no version.',
    )
    process.exit(1)
  }
  const requested = pkg.config?.dshVersion ?? DEFAULT_DSH_SELECTOR
  if (requested !== 'stable')
    throw new Error(`Expected config.dshVersion to be "stable", found "${requested}".`)
  let version
  try {
    version = latestStableDshVersion()
  } catch (error) {
    console.error(`dev: ${error.message}`)
    process.exit(1)
  }
  console.log(`Installing latest stable DSH ${version} into ${cliDir}.`)
  // npm, not pnpm: .dsh-cli is a standalone tool directory outside this
  // workspace. No install scripts run; DSH works without them.
  const install = spawnSync(
    `npm install --prefix "${cliDir}" --ignore-scripts --no-package-lock --no-audit --no-fund @deepseek-ai/dsh@${version}`,
    { stdio: 'inherit', shell: true },
  )
  if (install.error || install.status !== 0) process.exit(install.status ?? 1)
  await prepareDsh()
  process.exit(0)
}

await prepareDsh()
fs.mkdirSync(home, { recursive: true })

if (command === 'run') process.exit(runDsh(home, rest))

// `add .` links the checkout: rebuild and restart to pick up changes.
check(runDsh(home, ['plugin', '--profile', profile, 'add', '.']))
assertInstalled(home, profile)
assertMounted(home, profile)
console.log(`${pkg.name} is linked into ${home} (${profile} profile).`)

if (command === 'start') {
  if (profile !== 'web') {
    console.log(
      `Start is for the web profile. Run the ${profile} profile with: pnpm dev:dsh --profile ${profile} ...`,
    )
    process.exit(0)
  }
  check(runDsh(home, ['--profile', 'web', '--no-open', '--port', '0']))
}
