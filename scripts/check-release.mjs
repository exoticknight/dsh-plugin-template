// Release gate. Usage: node scripts/check-release.mjs [vX.Y.Z]
// In GitHub Actions the tag comes from GITHUB_REF_NAME and the results are
// written to GITHUB_OUTPUT (version, dist_tag, prerelease).
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME ?? `v${pkg.version}`
const errors = []

if (tag !== `v${pkg.version}`)
  errors.push(`Tag ${tag} does not match package.json version v${pkg.version}.`)
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version))
  errors.push(`Unsupported version ${pkg.version}.`)
if (!pkg.license || pkg.license === 'UNLICENSED')
  errors.push('Choose a license before publishing.')

const repository = process.env.GITHUB_REPOSITORY
if (
  repository &&
  pkg.repository?.url !== `git+https://github.com/${repository}.git`
)
  errors.push(
    `repository.url must be git+https://github.com/${repository}.git (found ${pkg.repository?.url}).`,
  )

// An uninitialized template must never be released.
const placeholder = /{{[A-Z_]+}}|dsh-plugin-template/
// package.json `template` credits the template on purpose.
const { template, ...pkgWithoutCredit } = pkg
const sources = {
  'package.json': JSON.stringify(pkgWithoutCredit),
  'cordis.patch.yml': fs.readFileSync('cordis.patch.yml', 'utf8'),
  'README.md': fs.readFileSync('README.md', 'utf8'),
  'README.en.md': fs.readFileSync('README.en.md', 'utf8'),
}
for (const [file, text] of Object.entries(sources)) {
  if (placeholder.test(text))
    errors.push(`${file} still contains template placeholders; run init.`)
}

// Users read the README before installing; unfinished sections must not ship.
for (const file of ['README.md', 'README.en.md']) {
  if (/\bTODO\b/.test(sources[file]))
    errors.push(
      `${file} still has TODO sections; see playbooks/reference/readme.md.`,
    )
}

if (errors.length) {
  for (const error of errors) console.error(`::error::${error}`)
  process.exit(1)
}

const prerelease = pkg.version.includes('-')
if (process.env.GITHUB_OUTPUT)
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${pkg.version}\ndist_tag=${prerelease ? 'next' : 'latest'}\nprerelease=${prerelease}\n`,
  )
console.log(
  `Release ${tag} verified (${prerelease ? 'prerelease' : 'stable'}).`,
)
