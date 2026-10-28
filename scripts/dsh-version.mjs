import semver from 'semver'
import { spawnSync } from 'node:child_process'

// Development tracks the newest non-prerelease npm version. This is a policy
// alias, not an admission range; the package's DSH compatibility is unbounded.
export const DEFAULT_DSH_SELECTOR = 'stable'

export function latestStableDshVersion({
  getVersions = readPublishedVersions,
} = {}) {
  const version = semver.maxSatisfying(getVersions(), '*')
  if (!version)
    throw new Error('No stable @deepseek-ai/dsh version is published on npm yet.')
  return version
}

function readPublishedVersions() {
  const [command, args] = process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', 'npm view @deepseek-ai/dsh versions --json']]
    : ['npm', ['view', '@deepseek-ai/dsh', 'versions', '--json']]
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.error)
    throw new Error(`Could not query npm for DSH versions: ${result.error.message}`)
  if (result.status !== 0)
    throw new Error(
      `Could not query npm for DSH versions: ${result.stderr.trim() || `npm exited ${result.status}`}`,
    )
  try {
    const versions = JSON.parse(result.stdout)
    if (Array.isArray(versions)) return versions
  } catch {}
  throw new Error('npm returned an invalid @deepseek-ai/dsh version list.')
}
