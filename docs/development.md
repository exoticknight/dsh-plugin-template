# Development

AI agents: start at [AGENTS.md](../AGENTS.md), which routes each task to a playbook in `playbooks/`.

## Requirements

- Node.js `^22.19.0 || >=24.0.0`
- pnpm, at the version pinned by `packageManager` (`corepack enable` picks it up)
- A DSH CLI for local testing: `pnpm dev:cli [version]` installs one into `.dsh-cli/`, used only for this repository (see Isolated DSH).

## Setup

```sh
pnpm install
pnpm hooks:install
pnpm verify
```

`pnpm hooks:install` installs the git pre-commit hook. Run it once per clone: pnpm may skip the automatic install when packages come from its cache.

## Layout

| Path                 | Role                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `src/host/index.ts`  | Host entry. Runs in the DSH Node process and builds to `lib/index.js` (ESM) |
| `src/client/`        | Client entry. Runs in the DSH web page and builds to `lib/client.js`        |
| `cordis.patch.yml`   | DSH bundle patch: mounts the host entry with its default config             |
| `package.json` `dsh` | Bundle patch path, client platform and the client packages it injects       |
| `scripts/build.mjs`  | esbuild for both entries                                                    |
| `scripts/dev.mjs`    | Isolated development DSH in `.dsh-dev`                                      |
| `tests/`             | `node --test` contract tests against the built `lib/`                       |

`lib/index.js` and `lib/client.js` are committed on purpose. `github:` installs and source-backed registries such as dsh.pub read the entry files from the git tree. The pre-commit hook rebuilds them, and CI fails when they are stale.

## Scripts

| Script               | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `pnpm build`         | Build `lib/`                                                |
| `pnpm typecheck`     | TypeScript check                                            |
| `pnpm test`          | Contract tests (build first)                                |
| `pnpm check:package` | List the npm tarball contents and check them                |
| `pnpm check:release` | Release gate: tag, version, metadata, leftover placeholders |
| `pnpm verify`        | Everything CI runs                                          |
| `pnpm dev:cli [ver]` | Install DSH (default: latest) into `.dsh-cli` for testing   |
| `pnpm dev`           | Link this checkout into `.dsh-dev` and start the web profile |
| `pnpm dev:install`   | Link into `.dsh-dev` without starting DSH                   |
| `pnpm dev:dsh …`     | Run any dsh command against `.dsh-dev`                      |
| `pnpm dev:clean`     | Delete `.dsh-dev`                                           |
| `pnpm smoke <spec>`  | Install a published version into a throwaway DSH home       |

## Isolated DSH

All local testing happens in `.dsh-dev/`, a DSH home inside the repository. Your daily DSH home (`~/.dsh`) is never used.

- `pnpm dev` links this checkout into `.dsh-dev` with `dsh plugin --profile <profile> add .`, checks that the install really landed there, and starts the web profile on a free port without opening a browser. The printed link contains a login token; do not share it.
- The install is a link: after a change, run `pnpm build`, stop DSH with `Ctrl+C`, and run `pnpm dev` again.
- `DSH_PROFILE` overrides the profile (default `web`, or `headless` without a client entry). For headless, use `pnpm dev:dsh --profile headless "<task>"`.
- `.dsh-dev/` holds conversations, settings and credentials. Git ignores it; never commit it. `pnpm dev:clean` deletes it.

The DSH CLI comes from `DSH_BIN`, then `.dsh-cli/`. If neither exists but your own DSH is installed, the scripts show where it is and ask before using it; they run its `bin.js` with node against `.dsh-dev`, never the `dsh` command itself, because launcher shims can redirect installs to your daily home. `.dsh-cli/` is ignored by git and kept by `pnpm dev:clean`. Details: `playbooks/reference/installing.md` → Development installs.

To try the plugin in your everyday DSH, install it there yourself with the user commands from the README.

## Code style and linting

There is no formatter. `.editorconfig` sets UTF-8, LF and 2-space indentation; otherwise follow the style of the surrounding code (no semicolons, single quotes). `pnpm typecheck` is the main static check.

If the plugin grows enough to need a linter, add ESLint with a flat config and include it in `verify`:

```sh
pnpm add -D eslint @eslint/js typescript-eslint
```

```js
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['lib/', '.dsh-dev/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
)
```

Then add `"lint": "eslint ."` and put `pnpm lint` into the `verify` script. Check first that the installed typescript-eslint supports the project's TypeScript major version. If it does not, lint only `scripts/` and `tests/` with `js.configs.recommended`.

## Releasing

Maintainers: see `playbooks/30-release.md`.
