# 40 · Maintenance

## Dependabot

Dependabot opens weekly grouped PRs for GitHub Actions (pinned by SHA) and npm dev dependencies. Merge them when CI is green. Merging never releases anything.

`@deepseek-ai/*` packages are excluded on purpose. They follow the DSH host version; update them with the procedure below.

## New DSH version

1. Read the DSH release notes for changes to the services, slots, routes and DOM anchors listed in `docs/compatibility.md` → Integration contracts.
2. Keep `config.dshVersion` set to `stable`, and keep both `engines.dsh` and the optional `@deepseek-ai/dsh` peer at `*` so no DSH release is rejected by package metadata. `pnpm dev:cli` prefers the latest stable release and falls back to the highest published prerelease when no stable exists. Update any other `@deepseek-ai/*` dev/peer dependencies to the versions provided by that host, then run `pnpm install` and `pnpm verify`.
3. Audit client module requests against the selected DSH version: replace obsolete imports; declare non-baseline requests in `dsh.client.external` and Cordis services in source `inject`. `dsh.client.inject` is informational metadata. Run `pnpm dev:cli` to install the latest stable DSH or its prerelease fallback, then `pnpm dev`; confirm host activation and client activation in the browser, then repeat the checks in `docs/compatibility.md` → Manual verification.
4. Record the verified version in `docs/compatibility.md` and update any README compatibility statement that names a tested version. The package remains unbounded; do not add a version badge or minimum just because the development target advanced.
5. Release (30-release), even if no code changed, so users can see the plugin is verified on the new version.

## Node.js

`engines.node` and the CI matrix are `^22.19.0 || >=24.0.0` / `['22.19.0', '24']`. When DSH changes its Node requirement, update `package.json` `engines`, the CI matrix and `docs/compatibility.md` in the same change.

## Directory listings and badges

Submitting to plugin directories, following up, and adding listing badges are covered in [50-listings.md](50-listings.md). Re-check listings after a rename, a repository move, or a change to the install command.

## Keeping GitHub and npm in sync

- The GitHub description matches `package.json` `description`.
- GitHub topics match `package.json` `keywords`.
- Run through [reference/checklist.md](reference/checklist.md) after any infrastructure change.

## Pulling template improvements into an existing plugin

Only infrastructure files are shared: `.github/`, `scripts/` (except plugin-specific checks), `tsconfig.json`, `.gitignore`, `.gitattributes`, `.editorconfig`, `pnpm-workspace.yaml`, `playbooks/`.

```sh
git remote add template https://github.com/exoticknight/dsh-plugin-template.git   # once
git fetch template
git diff HEAD template/main -- .github scripts playbooks tsconfig.json .gitignore .gitattributes .editorconfig pnpm-workspace.yaml
```

Apply the relevant hunks by hand. Never merge the template branch: its `src/`, README and package metadata would overwrite the plugin's. Commit as `ci:` or `chore: sync template infrastructure`.
