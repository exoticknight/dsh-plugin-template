# 10 · GitHub repository setup

Goal: the repository exists, is pushed, and has the same settings as every other plugin. Set `O=<owner>` and `N=<name>`. Every step can be re-run safely.

Requires `gh auth status` to show a login with `repo` and `workflow` scopes. If it does not, ask the user to run `gh auth login` themselves.

## 1. Create and push

Skip creation if 00-init §2A already made the repository.

```sh
gh repo create $O/$N --public --source . --remote origin --description "<package.json description>"
git push -u origin main
```

If the repository already exists: `git remote add origin https://github.com/$O/$N.git && git push -u origin main`.

## 2. Metadata

```sh
gh repo edit $O/$N \
  --description "<package.json description>" \
  --homepage "https://github.com/$O/$N#readme" \
  --add-topic deepseek-harness,dsh,dsh-plugin,dsh-bundle,<keyword>,<keyword> \
  --enable-wiki=false \
  --enable-issues \
  --delete-branch-on-merge
```

Use the `package.json` keywords as topics, plus `dsh-bundle`. Most plugin directories find plugins through the `dsh-plugin` and `deepseek-harness` topics, so never remove those (see `reference/directories.md`). For npm plugins you can set `--homepage https://www.npmjs.com/package/$N` instead, after the first publish.

## 3. Actions permissions

The workflows declare their own permissions. Keep the default token read-only:

```sh
gh api -X PUT repos/$O/$N/actions/permissions/workflow \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
```

## 4. `npm` environment (npm plugins only)

The npm Trusted Publisher is bound to this environment. Only `v*` tags may deploy to it.

```sh
echo '{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}' \
  | gh api -X PUT repos/$O/$N/environments/npm --input -
gh api -X POST repos/$O/$N/environments/npm/deployment-branch-policies -f name='v*' -f type=tag
```

A second policy call that fails with "already exists" is fine. Optionally add the user as a required reviewer in **Settings → Environments → npm** so each publish waits for their approval.

For a GitHub-only plugin, skip the environment and turn the npm job off:

```sh
gh variable set NPM_PUBLISH --body false -R $O/$N
```

## 5. Protect release tags

Stops `v*` tags from being moved or deleted by accident. Repository admins can still bypass it for a deliberate fix (30-release, Recovery).

```sh
gh api -X POST repos/$O/$N/rulesets --input - <<'JSON'
{
  "name": "release tags",
  "target": "tag",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [{ "type": "deletion" }, { "type": "non_fast_forward" }, { "type": "update" }],
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }]
}
JSON
```

Protecting `main` is optional for solo maintainers. If the user wants it, add a branch ruleset that blocks deletion and force pushes. Only require the CI checks if all changes will go through pull requests.

## 6. Security features

```sh
gh api -X PUT repos/$O/$N/vulnerability-alerts
gh api -X PUT repos/$O/$N/automated-security-fixes
gh api -X PUT repos/$O/$N/private-vulnerability-reporting
```

`SECURITY.md` points reporters to private vulnerability reporting.

## 7. Confirm

```sh
gh run list -R $O/$N -L 3          # CI on main must be green
gh repo view $O/$N --json description,repositoryTopics,homepageUrl,hasWikiEnabled
gh api repos/$O/$N/environments --jq '.environments[].name'
```

## Done when

- [ ] CI on `main` is green on all four matrix jobs
- [ ] Description, topics and homepage are set; wiki is off
- [ ] Default workflow permissions are `read`
- [ ] `npm` environment is limited to `v*` tags, or `NPM_PUBLISH=false` is set
- [ ] The `release tags` ruleset is active
- [ ] Next: [20-npm.md](20-npm.md) (npm plugins) or [30-release.md](30-release.md) (GitHub-only)
