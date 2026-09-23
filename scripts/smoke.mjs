// Install a published version exactly as a user would, into a throwaway DSH
// home, and check that it becomes an active, mounted bundle.
//
//   node scripts/smoke.mjs <name>@X.Y.Z [profile]                  npm
//   node scripts/smoke.mjs github:<owner>/<name>#vX.Y.Z [profile]  GitHub release
//   node scripts/smoke.mjs /absolute/path/<name>-X.Y.Z.tgz [profile] local `npm pack` output
//
// Always name an exact version: pnpm prefers releases older than 24 hours.
import {
  assertInstalled,
  assertMounted,
  createTempHome,
  defaultProfile,
  runDsh,
} from './dsh.mjs'

const [spec, profile = defaultProfile] = process.argv.slice(2)
if (!spec || !/[@#]|\.tgz$/.test(spec.replace(/^@/, ''))) {
  console.error(
    'Usage: node scripts/smoke.mjs <name>@X.Y.Z | github:<owner>/<name>#vX.Y.Z | <path>.tgz [profile]',
  )
  process.exit(1)
}

const { home, cleanup } = createTempHome()
try {
  const status = runDsh(home, ['plugin', '--profile', profile, 'add', spec])
  if (status !== 0) throw new Error(`dsh plugin add ${spec} failed (${status}).`)
  assertInstalled(home, profile)
  assertMounted(home, profile)
  console.log(`Smoke test passed: ${spec} is active in a fresh ${profile} profile.`)
} finally {
  cleanup()
}
