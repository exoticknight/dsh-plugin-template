import semver from 'semver'
import { spawnSync } from 'node:child_process'

// Development prefers the newest stable npm version, then falls back to the
// newest prerelease. This is a selection policy, not an admission range.
export const DEFAULT_DSH_SELECTOR = 'stable'

export function latestDshVersion({
  getVersions = readPublishedVersions,
} = {}) {
  const versions = getVersions()
  const stable = semver.maxSatisfying(versions, '*')
  if (stable) return { version: stable, channel: 'stable' }

  const prerelease = semver.maxSatisfying(versions, '*', { includePrerelease: true })
  if (prerelease) return { version: prerelease, channel: 'prerelease' }

  throw new Error('No @deepseek-ai/dsh version is published on npm.')
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
