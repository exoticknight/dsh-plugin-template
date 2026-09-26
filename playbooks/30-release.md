# 30 · Release a version

Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`:

```
gate (tag == v<package.json version>, metadata, no placeholders)
  → ci (full matrix: ubuntu/windows × Node 22.19/24)
  → npm (OIDC Trusted Publishing; skipped if the version is already on npm or NPM_PUBLISH=false)
  → github-release (auto-generated notes + optional introduction; GitHub adds the source archives)
```

For an npm plugin's very first release, do 20-npm §3 instead; it covers `v0.1.0`. For a GitHub-only plugin's first release, the version is already `0.1.0`, so start at step 3.

## Preconditions

- On `main`, working tree clean, up to date with `origin/main`.
- The latest CI run on `main` is green: `gh run list --workflow ci.yml -b main -L 1`.

## Release notes during development

GitHub Releases are the version history; the plugin READMEs link there, including on npm. There is no separately maintained `CHANGELOG.md`.

Use descriptive PR titles: they become the release entries. For categorization, apply labels to the PR itself (an issue's labels are not enough):

| PR label | Release section |
| --- | --- |
| `breaking-change` | Breaking Changes |
| `enhancement` | Features |
| `bug` | Fixes |
| Anything else or no label | Other Changes |

The first matching category in `.github/release.yml` wins. GitHub supplies author attribution, contributor information and the full comparison link. It does not infer features from source code. PRs are optional: direct pushes still release, but changes without PRs may need a written introduction to be described clearly.

GitHub chooses the previous release automatically. Check the comparison range during release verification, especially when using prereleases or maintaining multiple release lines. If a plugin needs a fixed baseline, adapt its workflow to pass `--notes-start-tag` before tagging. See [GitHub's generated notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).

## 1. Choose the version

Semantic Versioning. Before 1.0.0, a breaking change bumps the minor version (0.3.x → 0.4.0) and everything else bumps the patch. Use a prerelease (`0.4.0-rc.1`) to let users try a change early; it goes to npm `next` and is marked as a GitHub prerelease.

## 2. Update files

- Optional: `docs/release-notes/vX.Y.Z.md` for highlights or migration steps prepended to the automatic GitHub Release notes. See [the example](../docs/release-notes/README.md).
- `README.md` and `README.en.md`: check them against the "When to update" table in [reference/readme.md](reference/readme.md), and update the pinned `github:<owner>/<name>#vX.Y.Z` install command.
- If the verified DSH version changed: update the places listed in [40-maintain.md](40-maintain.md) § New DSH version, step 4.

## 3. Bump, build, check

```sh
npm version X.Y.Z --no-git-tag-version
pnpm verify
pnpm check:release vX.Y.Z
```

The version is baked into `lib/`, so `pnpm verify` rebuilds it and `lib/` changes.

## 4. Commit and wait for CI

```sh
git add -A
git commit -m "chore: release vX.Y.Z"
git push origin main
gh run watch "$(gh run list --workflow ci.yml -b main -L 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

## 5. Tag

```sh
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
gh run watch "$(gh run list --workflow release.yml -L 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

## 6. Verify

```sh
gh release view vX.Y.Z --json tagName,isPrerelease,url,body
npm view <name>@X.Y.Z version dist.attestations.provenance --json    # npm plugins
```

Reproduce a user install in a throwaway DSH home. Always name the exact version: for 24 hours pnpm prefers the previous release ([reference/installing.md](reference/installing.md)).

```sh
pnpm smoke <name>@X.Y.Z                    # npm plugins
pnpm smoke github:<owner>/<name>#vX.Y.Z
```

Each run must end with "Smoke test passed". The script never touches the user's own DSH home; do not replace it with hand-written `DSH_HOME=… dsh …` commands.

## Recovery

Find the failed job first: `gh run view <run-id> --log-failed`.

| Where it failed       | What was published  | Do this                                                                                                                                                                                                                   |
| --------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gate` or `ci`        | Nothing             | Fix on `main`. Ask the user before moving the tag, then delete it (`git push origin :refs/tags/vX.Y.Z`, `git tag -d vX.Y.Z`; the tag ruleset needs admin bypass) and tag the fixed commit. Alternatively release X.Y.Z+1. |
| `npm`, config problem | Nothing             | Fix the Trusted Publisher or environment (20-npm Troubleshooting), then **Re-run failed jobs** on the same run.                                                                                                           |
| `github-release`      | npm has the version | **Re-run failed jobs** only. The npm job skips because the version exists. Never re-tag a version npm already has.                                                                                                        |
| Released but broken   | Everything          | Never reuse the number. Fix, release X.Y.Z+1, then ask the user to run `npm deprecate <name>@X.Y.Z "<reason>"`.                                                                                                           |

## Done when

- [ ] The release workflow is green
- [ ] The GitHub Release `vX.Y.Z` contains the optional introduction and generated notes; check the PR categories, attribution and comparison range
- [ ] npm shows the version with provenance (npm plugins)
- [ ] The smoke install works
- [ ] After the first release, continue with [50-listings.md](50-listings.md). After later releases, only when the description or install command changed
