# Agent guide

<!-- template:start -->

## This repository is still the template

`package.json` `name` is `dsh-plugin-template`, so nothing has been initialized yet. Do not write plugin features first. Follow [`playbooks/00-init.md`](playbooks/00-init.md) from the top. It covers both cases:

- **You only have this template's URL** (the user said something like "use <url> to make a DSH plugin that …"). Create the user's own repository from the template first (00-init §2A), then continue inside the new clone.
- **You are inside a copy** of the template (the user clicked "Use this template" or cloned it). Start at 00-init §1.

Initialization removes this section.

<!-- template:end -->

This repository is a DeepSeek Harness (DSH) plugin, distributed through npm and/or GitHub Releases and installed by users with `dsh plugin add`.

This file is loaded for every task. It holds only what always applies. Everything else is in the document the routing table points to; read that one document, not all of them.

## Always true in this repository

- **pnpm only.** Do not add `package-lock.json`.
- **`lib/` is committed build output.** `src/host/index.ts` → `lib/index.js`, `src/client/` → `lib/client.js` (`scripts/build.mjs`; the version is baked in). Never edit `lib/` by hand; rebuild and commit it with the source. The pre-commit hook does this and CI rejects a stale `lib/`.
- **The package must install cleanly with pnpm 11 in a user's DSH profile:** no `prepare`/`prepack`/`preinstall`/`install`/`postinstall` scripts, runtime dependencies from the npm registry only, peers only `@deepseek-ai/*`. A test enforces this. Why: [installing.md](playbooks/reference/installing.md).
- **READMEs are for plugin users.** `README.md` (Chinese, primary) and `README.en.md` never contain agent instructions; those live here and in `playbooks/`.
- **Document files need approval.** `README*`, `CONTRIBUTING.md` and `docs/**` change only with the user's approval unless the task asks for it ([RED.md](RED.md)).
- **Keep the `template` field in `package.json`.** It credits the template.

## Ask first, never do

- **Ask first:** anything needing the user's credentials or hard to undo (`npm login`/OTP, manual `npm publish`, npmjs.com settings, deleting or moving a pushed tag or a release, `npm deprecate`/`unpublish`), and any public action in the user's name (directory submissions, issues or PRs on other repositories, deleting forks).
- **Never** grant third-party OAuth access to the user's accounts.
- **Never touch the user's own DSH home.** Test installs only with `pnpm dev*` (isolated `.dsh-dev/`) and `pnpm smoke` (throwaway home). Never run `dsh` from PATH with a custom `DSH_HOME`, and never delete a directory whose path comes from an environment variable. See [installing.md](playbooks/reference/installing.md#development-installs).
- **Ask before using the user's own DSH CLI.** The recommended CLI for test installs is an isolated one in `.dsh-cli/` (`pnpm dev:cli [version]`). When only the machine's own DSH is available, the scripts stop and print its path: tell the user, and set `DSH_BIN` to it only if they agree.
- **Never commit** `.dsh-dev/`, `.dsh-cli/`, `.env*`, keys, `.research/` or `.evolve/`.
- **Never change the release trust model** (OIDC, `environment: npm`, no `NPM_TOKEN`) without the user's decision.

## Commands

```sh
pnpm install && pnpm hooks:install
pnpm verify          # what CI runs: typecheck, build, tests, package check
pnpm dev:cli [ver]   # isolated DSH CLI in .dsh-cli (default: latest)
pnpm dev             # this checkout linked into the isolated DSH home .dsh-dev
pnpm smoke <spec>    # a published version installed into a throwaway DSH home
pnpm check:release   # release gate
```

## Implementing features

DSH plugin APIs change quickly, so this repository does not document them. Before using a DSH service, slot, setting or UI API, look it up live for the DSH version in `docs/compatibility.md`: the docs in [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) and the source of the matching `@deepseek-ai/*` packages. Record each contract the plugin relies on in `docs/compatibility.md` → Integration contracts, and try the change in `pnpm dev`.

## Where to look

- `playbooks/NN-*.md` are **procedures**: goal, preconditions, numbered steps with commands, "Done when". A new plugin goes through 00 → 10 → 20 → 30 → 50; later tasks open only the one they need.
- `playbooks/reference/*.md` are **lookups** the procedures link to. Those describing outside services carry a "Last verified" date: re-check before acting, and update them when they are out of date.
- `docs/` is for human contributors: development setup and the compatibility record.

| Task                                                         | Read                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Create or initialize a plugin from the template              | [`playbooks/00-init.md`](playbooks/00-init.md)                           |
| Implement or change plugin behavior                          | [Implementing features](#implementing-features), then [`docs/development.md`](docs/development.md) |
| Create or configure the GitHub repository                    | [`playbooks/10-github.md`](playbooks/10-github.md)                       |
| First npm publish, Trusted Publishing, GitHub-only switch    | [`playbooks/20-npm.md`](playbooks/20-npm.md)                             |
| Release a version or recover a failed release                | [`playbooks/30-release.md`](playbooks/30-release.md)                     |
| New DSH or Node version, Dependabot, template updates        | [`playbooks/40-maintain.md`](playbooks/40-maintain.md)                   |
| Directory submissions, follow-up, listing badges             | [`playbooks/50-listings.md`](playbooks/50-listings.md)                   |
| Install commands, test installs, install problems            | [`playbooks/reference/installing.md`](playbooks/reference/installing.md) |
| Write or update the README                                   | [`playbooks/reference/readme.md`](playbooks/reference/readme.md)         |
| Change any README badge                                      | [`playbooks/reference/badges.md`](playbooks/reference/badges.md)         |
| Audit repository, GitHub, npm and listings                   | [`playbooks/reference/checklist.md`](playbooks/reference/checklist.md)   |
