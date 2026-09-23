// Development install: this checkout, linked into the isolated DSH home
// `.dsh-dev/` inside the repository. Your daily DSH home is never touched.
//
//   node scripts/dev.mjs install        link this checkout into .dsh-dev
//   node scripts/dev.mjs start          install, then start the web profile on a free port
//   node scripts/dev.mjs run <args...>  run any dsh command against .dsh-dev
//   node scripts/dev.mjs clean          delete .dsh-dev
//
// DSH_PROFILE overrides the profile (default: web, or headless without a client).
// See scripts/dsh.mjs for how the DSH CLI is located and isolation is verified.
import fs from 'node:fs'
import path from 'node:path'
import {
  assertInstalled,
  assertMounted,
  defaultProfile,
  pkg,
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
