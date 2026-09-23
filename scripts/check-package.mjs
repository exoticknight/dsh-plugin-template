// Checks the npm tarball contents without publishing: required entry files
// are present and nothing outside the files whitelist leaks in.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const result = spawnSync('npm pack --dry-run --json --ignore-scripts', {
  encoding: 'utf8',
  shell: true,
})
if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(1)
}
const [{ files, size }] = JSON.parse(result.stdout)
const packed = new Set(files.map((file) => file.path))

const required = ['package.json', 'lib/index.js', 'cordis.patch.yml', 'LICENSE']
if (pkg.dsh?.client) required.push('lib/client.js')
const missing = required.filter((file) => !packed.has(file))
const leaked = [...packed].filter((file) =>
  /^(src|tests|scripts|playbooks|docs|\.github)\//.test(file),
)

if (missing.length || leaked.length) {
  if (missing.length)
    console.error(`Missing from package: ${missing.join(', ')}`)
  if (leaked.length)
    console.error(`Unexpected in package: ${leaked.join(', ')}`)
  process.exit(1)
}
console.log(`Package ok: ${packed.size} files, ${size} bytes.`)
