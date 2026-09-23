# Plugin checklist

Everything a DSH plugin built from this template should have, inside and outside the repository. Use it to audit a new plugin, or an older plugin being brought in line. Set `O=<owner>`, `N=<name>`.

## Repository

| Item                         | Expectation                                                                                                                                                                             | Check                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Name                         | Package name = repository name = `dsh-<slug>`, unscoped                                                                                                                                 | `node -p "require('./package.json').name"`  |
| `package.json` metadata      | `type: module`, `license: Apache-2.0`, `author`, `description`, `repository`/`homepage`/`bugs` pointing at `github.com/$O/$N`, keywords include `deepseek-harness`, `dsh`, `dsh-plugin` | `pnpm test`                                 |
| `package.json` `dsh`         | `bundle.patch: ./cordis.patch.yml`; `client: { platform, inject }` when there is a client entry                                                                                         | `pnpm test`                                 |
| Entry points                 | `exports` `.` → `lib/index.js`, `./client` → `lib/client.js`, `./package.json`                                                                                                          | `pnpm test`                                 |
| `files` whitelist            | Only `lib/index.js`, `lib/client.js`, `cordis.patch.yml`, READMEs, LICENSE                                                                                                              | `pnpm check:package`                        |
| `publishConfig`              | `access: public`, npm registry                                                                                                                                                          |                                             |
| `engines` / `packageManager` | `^22.19.0 \|\| >=24.0.0` / pinned pnpm                                                                                                                                                  |                                             |
| `cordis.patch.yml`           | `- insert: - id: $N, name: $N, config: {...}`                                                                                                                                           | `pnpm test`                                 |
| Committed `lib/`             | Present and current (source-backed installs and dsh.pub need it)                                                                                                                        | `pnpm build && git diff --exit-code -- lib` |
| Pre-commit hook              | simple-git-hooks runs `scripts/pre-commit.mjs`                                                                                                                                          | `cat .git/hooks/pre-commit`                 |
| Line endings                 | `.gitattributes` `* text=auto eol=lf`, binaries marked                                                                                                                                  |                                             |
| `.gitignore`                 | `node_modules/`, `*.tgz`, `.env*`, `.dsh-dev/`, `.research/`, `.evolve/`, `lib/*.map`                                                                                                   |                                             |
| TypeScript                   | strict, NodeNext, ES2022                                                                                                                                                                | `pnpm typecheck`                            |
| Style / lint                 | No formatter. `.editorconfig` (UTF-8, LF, 2 spaces); follow the surrounding code. ESLint only when a plugin needs it (see `docs/development.md`)                                          | `pnpm typecheck`                            |
| Install safety               | No `prepare`/`prepack`/`preinstall`/`install`/`postinstall` scripts; runtime deps from the registry without build scripts; peers only `@deepseek-ai/*` (`installing.md`) | `pnpm test` |
| Dev isolation                | `pnpm dev*` and `pnpm smoke` run the DSH CLI via `scripts/dsh.mjs` (isolated homes, verified, no PATH shim) | `pnpm dev:install` |
| Tests                        | `node --test` against built `lib/`; host mounts/unmounts in Cordis; client registers with the module loader                                                                             | `pnpm test`                                 |
| CI workflow                  | push `main`, PRs, `workflow_call`; ubuntu+windows × Node 22.19/24; `pnpm verify`; stale-`lib` check; read-only permissions; actions pinned by SHA                                       | `.github/workflows/ci.yml`                  |
| Release workflow             | tag `v*` → gate → CI → npm OIDC (idempotent) → GitHub Release (notes only, no uploaded assets); prerelease → `next`                                                                                | `.github/workflows/release.yml`             |
| Dependabot                   | Actions + npm dev dependencies weekly; `@deepseek-ai/*` ignored                                                                                                                         | `.github/dependabot.yml`                    |
| Issue templates              | Bug report asks for plugin and DSH version                                                                                                                                              | `.github/ISSUE_TEMPLATE/`                   |
| Docs                         | `README.md` (Chinese) + `README.en.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/development.md`, `docs/compatibility.md`                                                       |                                             |
| README badges | Row 1: npm (if published), CI, Release, License, DSH version, RED. Row 2: confirmed listings only, none by default. Every plugin badge uses this plugin's owner/name (`badges.md`) | |
| Images                       | Under `docs/images/`, `export-ignore`, linked by absolute `raw.githubusercontent.com` URLs so npm renders them                                                                          |                                             |
| RED                          | `red.toml` + `RED.md`; `.research/` and `.evolve/` local-only                                                                                                                           | `red check --json`                          |
| Agent entry                  | `AGENTS.md` (+ `CLAUDE.md` → `@AGENTS.md`) and `playbooks/`                                                                                                                             |                                             |
| README content               | Sections and style per `readme.md`; no `TODO`; description matches `package.json`; images use absolute URLs | `pnpm check:release` |
| No leftovers                 | No template placeholders                                                                                                                                                                | `pnpm check:release`                        |

## GitHub (not in the repository)

| Item                        | Expectation                                                                 | Check                                                                           |
| --------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Visibility / default branch | Public, `main`                                                              | `gh repo view $O/$N --json visibility,defaultBranchRef`                         |
| Description / homepage      | Same as `package.json` description; homepage set                            | `gh repo view $O/$N --json description,homepageUrl`                             |
| Topics                      | `deepseek-harness`, `dsh`, `dsh-plugin` + domain words                      | `gh repo view $O/$N --json repositoryTopics`                                    |
| Features                    | Issues on, wiki off, delete branch on merge                                 | `gh repo view $O/$N --json hasIssuesEnabled,hasWikiEnabled,deleteBranchOnMerge` |
| Workflow token              | Default permissions `read`, cannot approve PRs                              | `gh api repos/$O/$N/actions/permissions/workflow`                               |
| `npm` environment           | Exists; deployments only from `v*` tags (npm plugins)                       | `gh api repos/$O/$N/environments/npm/deployment-branch-policies`                |
| `NPM_PUBLISH` variable      | Unset (npm) or `false` (GitHub-only)                                        | `gh variable list -R $O/$N`                                                     |
| Tag ruleset                 | `release tags`: no deleting or moving `v*` tags, admin bypass               | `gh api repos/$O/$N/rulesets`                                                   |
| Secrets                     | None; npm uses OIDC                                                         | `gh secret list -R $O/$N`                                                       |
| Security                    | Dependabot alerts and security fixes on; private vulnerability reporting on | `gh api repos/$O/$N/private-vulnerability-reporting`                            |
| Releases                    | One per tag with notes, no uploaded assets, latest marked                                | `gh release list -R $O/$N -L 3`                                                 |

## npm (not in the repository)

| Item              | Expectation                                                     | Check                                             |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Package           | Exists, unscoped, public, correct maintainer                    | `npm view $N name maintainers --json`             |
| Trusted Publisher | GitHub Actions: `$O` / `$N` / `release.yml` / environment `npm` | npmjs.com → package → Settings (user)             |
| Publishing access | "Require two-factor authentication and disallow tokens"         | npmjs.com → package → Settings (user)             |
| Provenance        | Present on releases published by CI                             | `npm view $N dist.attestations.provenance --json` |
| dist-tags         | `latest` = newest stable; `next` only for prereleases           | `npm view $N dist-tags --json`                    |

## Listings and local tools

| Item        | Expectation                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| dsh.pub | Listed; badge added after the listing was confirmed |
| Directories | Automatic ones picked up; approved submissions made once and tracked in `.research/listings.md` (`50-listings.md`) |
| Local tools | `gh` logged in, pnpm, a DSH CLI via `DSH_BIN` or a project-local `@deepseek-ai/dsh` (never PATH, see `installing.md`); `npm login` only for the first publish; `red` CLI optional |
