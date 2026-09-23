# 20 · npm publishing

Goal: the package exists on npm, releases publish from GitHub Actions through **Trusted Publishing** (OIDC, no stored token, automatic provenance), and token publishing is turned off.

Why the first version is manual: a Trusted Publisher is configured in the package's settings on npmjs.com, and a new package has no settings page until it has been published once. After this one-time step, every release comes from CI.

Skip this playbook for GitHub-only plugins (`NPM_PUBLISH=false`, see 10-github §4).

## 1. Preconditions

- 10-github is done and CI on `main` is green.
- The name is still free: `npm view <name> name` returns E404.
- `pnpm verify` and `pnpm check:release` pass locally.

## 2. npm account (user action)

```sh
npm whoami
```

If this fails, ask the user to run `npm login` themselves. Never type passwords or OTPs for them. Their account should have 2FA enabled.

## 3. First publish (user action)

Check what will be uploaded first:

```sh
pnpm check:package
npm pack --dry-run
```

Then ask the user to run this from the repository root. npm asks for an OTP when 2FA is on:

```sh
npm publish --access public
```

Confirm: `npm view <name> version` prints `0.1.0`.

Then tag the same commit so the GitHub Release exists too. The workflow sees that the version is already on npm, skips the npm step, and creates the Release:

```sh
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## 4. Configure the Trusted Publisher (user action on npmjs.com)

Open `https://www.npmjs.com/package/<name>/access` → **Trusted Publisher** → **GitHub Actions** and fill in exactly:

| Field                | Value                      |
| -------------------- | -------------------------- |
| Organization or user | `<owner>` (case-sensitive) |
| Repository           | `<name>`                   |
| Workflow filename    | `release.yml`              |
| Environment name     | `npm`                      |

On the same page, under **Publishing access**, choose **Require two-factor authentication and disallow tokens**. From then on, only the workflow can publish.

## 5. Verify with the next release

After the next tag (30-release):

```sh
npm view <name>@<version> dist.attestations.provenance --json   # shows an SLSA predicateType
```

## Reference

- The workflow runs `npm publish --provenance --access public --ignore-scripts --tag <latest|next>`. It installs npm ≥ 11.5.1 itself; Trusted Publishing needs npm ≥ 11.5.1 and Node ≥ 22.14.
- Versions with a prerelease suffix (`1.2.0-rc.1`) go to the `next` dist-tag and never become `latest` on their own.
- Move `latest` by hand: `npm dist-tag add <name>@<version> latest` (user action).
- Published versions can never be overwritten. A bad release gets a new patch version plus `npm deprecate <name>@<bad> "<reason>"` (user action). Unpublishing is limited by npm policy and breaks installs; avoid it.

## Troubleshooting

| Symptom in the `npm` job                   | Cause and fix                                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ENEEDAUTH`, `E401` or `E404` on publish   | The Trusted Publisher does not match. Check owner case, repository, `release.yml`, environment `npm`. Then **Re-run failed jobs**. |
| `E403 ... cannot publish over`             | The version already exists. Bump the version (30-release, Recovery).                                                               |
| `E403 ... too similar to existing package` | Only possible on the first manual publish. Rename (redo 00-init with a new name) before any release.                               |
| Job waits for approval                     | The `npm` environment has a required reviewer. Approve it in the Actions run page.                                                 |
| Job skipped                                | The repository variable `NPM_PUBLISH` is `false`.                                                                                  |

## Done when

- [ ] `npm view <name>` shows the package with the expected maintainer
- [ ] The Trusted Publisher is set to `<owner>/<name>`, `release.yml`, environment `npm`
- [ ] Token publishing is disallowed
- [ ] GitHub Release `v0.1.0` exists
- [ ] Next: [50-listings.md](50-listings.md)
