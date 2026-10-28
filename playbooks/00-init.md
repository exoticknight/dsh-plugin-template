# 00 · Initialize a plugin from the template

Goal: a local repository for `<owner>/<name>` with every placeholder replaced, `pnpm verify` passing and a first commit. Pushing and GitHub settings come next (10), then npm (20).

## 1. Collect parameters

Do not ask for a DSH target. Plugins built from this template admit every DSH version; local development selects the newest stable npm release. Do not inspect the user’s own CLI without permission. Infer other values where possible.

| Parameter         | init flag        | How to decide                                                                                                                |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Package/repo name | `--name`         | `dsh-<slug>`, lowercase, unscoped. Must be free on both npm and GitHub (see below).                                          |
| GitHub owner      | `--owner`        | The user's account (`gh api user --jq .login`) or an organization they name.                                                 |
| Display title     | `--title`        | Human name for README headings. Defaults to the name without `dsh-`, title-cased.                                            |
| Description       | `--description`  | One English sentence ending with "for DeepSeek Harness." Reused for npm and the GitHub description.                          |
| Author            | `--author`       | Defaults to the owner. Ask only if the user wants a different credit.                                                        |
| Client entry      | `--host-only`    | Omit when the plugin has any UI in the DSH web page (themes, settings cards, buttons). Use for host-only services and tools. |
| Distribution      | `--no-npm`       | Default: npm and GitHub Releases. Use `--no-npm` for GitHub-only plugins.                                                    |
| Extra keywords    | `--keywords a,b` | 2–6 domain words. `deepseek-harness`, `dsh` and `dsh-plugin` are already included.                                           |

Check that the name is free:

```sh
npm view <name> name            # E404 = available on npm
gh repo view <owner>/<name>     # "Could not resolve" = available on GitHub
```

npm also rejects names that are too similar to existing packages (punctuation-only differences). If the first publish later fails with that error, choose another name before anything is released.

## 2. Get a working copy

### 2A. You only have the template URL

Create the user's repository from the template on GitHub, then clone it. The commands use the upstream template `exoticknight/dsh-plugin-template`. If the user gave a different URL (a fork), use that one instead.

```sh
gh repo create <owner>/<name> --template exoticknight/dsh-plugin-template --public --clone
cd <name>
```

If `gh` says the repository is not a template, copy it without its history instead:

```sh
git clone --depth 1 https://github.com/exoticknight/dsh-plugin-template.git <name>
cd <name>
rm -rf .git
git init -b main
```

Create the GitHub repository later, in 10-github §1.

### 2B. You are already inside a copy

- Check `git remote -v`. If `origin` still points at the template repository, remove it (`git remote remove origin`); 10-github adds the right one.
- If the copy has the template's commit history and the user wants a clean start: `rm -rf .git && git init -b main`. Ask first if there are commits that are not from the template.

## 3. Run init

```sh
pnpm install
node scripts/init.mjs --name <name> --owner <owner> \
  --title "<title>" --description "<sentence>" [--keywords a,b] [--host-only] [--no-npm]
```

Init sets `config.dshVersion` to `stable` and declares `*` in both `engines.dsh` and the optional `@deepseek-ai/dsh` peer, so DSH admission has no version boundary. `pnpm dev:cli` resolves the highest published stable SemVer version from npm, ignoring prereleases and dist-tags; it reports an error if npm has no stable DSH release yet. It always uses that stable release. `pnpm-workspace.yaml` disables automatic peer installation; the optional host peer allows development without a workspace CLI.

Add `--dry-run` first if you want to see which files change. Init replaces every placeholder, removes the template-only blocks (and the npm or client blocks when those flags are set), adjusts `package.json`, and deletes itself. It also replaces the template's own `README.md` / `README.en.md` with the plugin README skeletons from `.template/` and removes that directory. The `playbooks/` stay because they are needed for releases.

Verify that nothing is left over:

```sh
git grep -nE "\{\{[A-Z_]+\}\}|dsh-plugin-template" -- . ":!playbooks" ":!scripts/check-release.mjs" ":!lib"
```

The only expected hits are the `template` credit lines in `package.json`; keep them. `lib/` still has the template name until step 4 rebuilds it.

## 4. Install and verify

```sh
pnpm install
pnpm hooks:install
pnpm verify
```

`pnpm install` updates the lockfile, and `pnpm hooks:install` installs the pre-commit hook (check that `.git/hooks/pre-commit` exists). `pnpm verify` must pass before you continue.

## 5. Tailor to the plugin

Do what the user asked for and fill in the TODOs:

- `src/host/index.ts`: `Config` schema and `apply`. Put the defaults in `cordis.patch.yml` `config:` as well.
- `src/client/index.ts` (if present): Cordis service names in source `inject`; non-baseline module requests in `package.json` `dsh.client.external`. `dsh.client.inject` is informational package metadata, not service injection.
- Runtime dependencies go in `dependencies`. Keep the CLI itself as an optional host peer, installed separately with `pnpm dev:cli`. `@deepseek-ai/*` packages that DSH provides go in `peerDependencies` + `devDependencies` and stay external in the build.
- `README.md` (Chinese, primary) and `README.en.md` (English): fill every TODO following [reference/readme.md](reference/readme.md). The release gate rejects a README that still contains `TODO`.
- `docs/compatibility.md`: integration contracts.
- `.github/ISSUE_TEMPLATE/bug_report.yml`: add plugin-specific fields (for example the mode or setting in use).
- Add tests under `tests/` for the behavior you write.

Run `pnpm verify` again.

## 6. Try it in DSH (optional but recommended)

```sh
pnpm dev
```

It needs a DSH CLI for isolated runs: run `pnpm dev:cli` first (installs the latest stable release into `.dsh-cli/`). If no stable DSH release is published yet, the command explains that and stops. If `pnpm dev` stops because only the user's own DSH was found, ask the user before using it ([installing.md § Development installs](reference/installing.md#development-installs)). Give the printed link to the user. It contains a login token, so do not paste it anywhere public. Manual checks that pass go into `docs/compatibility.md` → Manual verification.

## 7. First commit

```sh
git add -A
git commit -m "feat: scaffold <name>"
```

The pre-commit hook rebuilds `lib/` and stages it.

## Done when

- [ ] No placeholders left (the grep in §3)
- [ ] `pnpm verify` passes and `git status` is clean after committing
- [ ] README (both languages) describes the real plugin
- [ ] Next: [10-github.md](10-github.md), then [20-npm.md](20-npm.md) unless `--no-npm`
