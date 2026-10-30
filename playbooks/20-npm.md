# 20 · npm publishing

Goal: the package exists on npm, releases publish from GitHub Actions through **Trusted Publishing** (OIDC, no stored token, automatic provenance), and token publishing is turned off.

The first version is published manually because a new package has no npm settings page yet. Trusted Publishing is configured after that first publish, then validated by a later, new version from CI.

Skip this playbook for GitHub-only plugins (`NPM_PUBLISH=false`, see 10-github §4).

## Browser first, CLI for operations the site cannot do

For npm account and package settings, first check whether browser automation and a suitable npm session are available. Use npmjs.com to guide the user through supported settings and verify the saved state. If the user needs to sign in or enter 2FA, let them do that in the browser or directly at a CLI prompt; never ask for passwords, OTPs or recovery codes in chat.

If no suitable browser is available or a specific operation has no supported UI, explain why and use its documented CLI path when one exists. A permission denial or user refusal is a stop, not a reason to switch tools. The user's request to configure npm publishing authorizes the requested setup; the browser-first preference alone does not authorize account changes or a public publish. The existing ask-first rules in `AGENTS.md` still apply.

`npm publish` uploads a package from the repository through the CLI; npm's site is for package settings and review, not uploading the project. `npm trust github` is a CLI alternative for creating a Trusted Publisher, but it does not set the package's token-publishing policy.

## 1. Preconditions

- 10-github is done and CI on `main` is green.
- The name is still free: `npm view <name> name` returns E404.
- `pnpm verify` and `pnpm check:release` pass locally.
- Account-level 2FA is enabled before configuring a Trusted Publisher.

## 2. Confirm the npm account

Open npmjs.com in the available browser and confirm the signed-in account. If the user needs to sign in, hand them the page to complete it. If no suitable browser is available, `npm whoami` is a read-only CLI check; if it fails, ask the user to sign in themselves rather than attempting `npm login` for them.

## 3. Publish the first version

Check what will be uploaded:

```sh
pnpm check:package
pnpm check:release
npm pack --dry-run
```

Publishing a public version is difficult to undo. Ask for approval unless the user has already explicitly authorized this publish. After approval, run this from the repository root; the user enters any 2FA challenge at the prompt:

```sh
npm publish --access public
```

Confirm that the actual version is live with `npm view <name>@0.1.0 version` or the npm package page. A `0.0.0-stage` placeholder alone does not mean the version is published.

If the package was staged, inspect it first in npmjs.com → **Staged Packages**. Show the version and package details, then ask the user before approving it; approval publishes the version. If the site is unavailable and the user authorizes the operation, `npm stage approve <stage-id>` is the CLI alternative, with 2FA entered at the prompt. If neither the registry nor the staged-package list shows the expected version, stop and diagnose before continuing.

Then push the tag for the same commit so the first GitHub Release is created. The release workflow skips the npm job because `0.1.0` is already live:

```sh
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## 4. Configure the Trusted Publisher when the next release is ready

Do not create this configuration months before the next release. npm requires a new Trusted Publisher to complete its first successful publish within **2 days**; otherwise it expires and must be recreated. Wait until the next version is prepared, pushed to `main`, and CI is green so its tag can be pushed promptly.

In npmjs.com, open `https://www.npmjs.com/package/<name>/access` → **Trusted Publisher** → **GitHub Actions** and fill in:

| Field | Value |
| --- | --- |
| Organization or user | `<owner>` (case-sensitive) |
| Repository | `<name>` |
| Workflow filename | `release.yml` |
| Environment name | `npm` |

The template workflow runs `npm publish`, so enable **Allow npm publish**. Do not enable **Allow npm dist-tag**; the workflow does not need it. Review the values, save, and let the user handle any sign-in or 2FA challenge. Verify the saved publisher details before continuing.

If browser automation is unavailable or the page cannot perform this setup, the supported CLI alternative is:

```sh
npm trust github <name> --file=release.yml --repo=<owner>/<name> --env=npm --allow-publish
```

This requires a published package, write access, account-level 2FA, and npm CLI 11.15.0 or later. Check `npm --version` first. Do not auto-confirm prompts; the user handles any 2FA challenge. If the installed CLI lacks `npm trust`, use the browser flow or guide the user to it instead of silently upgrading global npm.

## 5. Validate Trusted Publishing on the next release

Within 2 days of creating the Trusted Publisher, publish a **new** version through the release workflow. The workflow skips npm when that version already exists, so re-tagging `v0.1.0` will not validate the configuration. Follow [30-release.md](30-release.md), then verify:

```sh
npm view <name>@<version> dist.attestations.provenance --json
```

The public package should show a provenance attestation. GitHub Actions Trusted Publishing generates provenance automatically for a public repository and public package.

If the configuration expires before a successful publish, recreate it when the next release is ready and push a new version tag within 2 days.

## 6. Restrict token publishing after OIDC succeeds

After the successful OIDC publish, open npmjs.com → package → **Settings** → **Publishing access**, select **Require two-factor authentication and disallow tokens**, then **Update Package Settings**. Let the user complete 2FA and verify the setting afterward.

This blocks granular access tokens from publishing. Maintainers can still publish interactively with account-level 2FA; Trusted Publishing continues to work through OIDC. `npm access 2fa-required` is not an equivalent substitute because it does not disallow tokens. If the exact setting is unavailable in the browser, guide the user through npmjs.com rather than applying a weaker CLI setting.

## Reference

- The workflow uses `npm publish --provenance --access public --ignore-scripts --tag <latest|next>`. It installs npm ≥ 11.5.1 itself; Trusted Publishing needs npm ≥ 11.5.1 and Node ≥ 22.14.
- Versions with a prerelease suffix (`1.2.0-rc.1`) go to the `next` dist-tag and never become `latest` on their own.
- Move `latest` by hand: `npm dist-tag add <name>@<version> latest` (user action).
- Published versions can never be overwritten. A bad release gets a new patch version plus `npm deprecate <name>@<bad> "<reason>"` (user action). Unpublishing is limited by npm policy and breaks installs; avoid it.
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/), [npm trust](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [staged publishing](https://docs.npmjs.com/staged-publishing/), and [npm publish](https://docs.npmjs.com/cli/commands/npm-publish/).

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `ENEEDAUTH`, `E401` or `E404` in the `npm` job | Check owner case, repository, `release.yml`, environment `npm`, `Allow npm publish`, `id-token: write`, and `package.json` `repository.url`. After correcting the setup, rerun the failed job if the trust configuration is still within its 2-day validation window. |
| `E403 ... cannot publish over` | The version already exists. Bump the version (30-release, Recovery). |
| `E403 ... too similar to existing package` | Only possible on the first manual publish. Rename (redo 00-init with a new name) before any release. |
| Only `0.0.0-stage` appears | Check **Staged Packages** in npmjs.com and `npm stage list`. Approve a pending stage only after the user reviews and authorizes the exact version; otherwise diagnose why the intended version is absent. |
| Job waits for approval | The GitHub `npm` environment has a required reviewer. Approve it in the Actions run page. |
| Job skipped | The repository variable `NPM_PUBLISH` is `false`, or the npm version already exists. |
| Trusted Publisher expired | Its first successful publish did not happen within 2 days. Recreate it when a new version is ready, then publish that new version promptly. |

## Done when

- [ ] `npm view <name>` shows the package with the expected maintainer
- [ ] The Trusted Publisher matches `<owner>/<name>`, `release.yml`, environment `npm`, and allows `npm publish`
- [ ] A new version was published by OIDC within 2 days of configuring the Trusted Publisher, with provenance
- [ ] Token publishing is disallowed after OIDC was verified
- [ ] GitHub Release `v0.1.0` exists
- [ ] Next: [50-listings.md](50-listings.md)
