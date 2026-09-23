# 50 · Directory listings and badges

Goal: the plugin appears in the community directories, every submission is tracked, and the README shows badges for confirmed listings only.

Data lives in [reference/directories.md](reference/directories.md) (where to submit) and [reference/badges.md](reference/badges.md) (what to add to the README). This file is the procedure.

## Preconditions

- The first release is out (30-release or 20-npm §3): the GitHub Release exists, and the npm package exists for npm plugins.
- The repository is public and has the topics from 10-github §2, including `dsh-plugin` and `deepseek-harness`.
- The README install command works from a clean DSH home (30-release §6).

Directories copy the README description and install command, so check the README against [reference/readme.md](reference/readme.md) before submitting.

## 1. Prepare the facts once

Write them into a local tracker `.research/listings.md` (RED Research, ignored by Git). Every submission reuses them word for word:

- Repository URL and npm package name
- One factual sentence in English and in Chinese: what the plugin does, no marketing
- Install command, license, required DSH version and profile
- Category (UI and themes, tools, models, workflow, …)
- Permissions and data flow: network access, credentials, files written. Directories ask, and users care.

Only public project information goes into submissions. Never keys, cookies, local paths, or conversation content.

## 2. Check the current rules

For each directory in [reference/directories.md](reference/directories.md), open its current submission rules (contributing file, issue template, or submit page) before acting. If a site is down, paused, or its rules changed, note it in the tracker and update `reference/directories.md` in this repository.

## 3. Automatic directories

Section A needs no submission. Wait a day after the topics are set, then search each site for the plugin and record the result.

## 4. Submit to the others (with the user's approval)

Submissions are public actions taken in the user's name. First show the user one list: each directory, the route (form, issue or PR), and the text that will be sent. Continue only with the ones they approve.

- **Web forms** (dsh.pub, dshplugin.dev, DSH Plugin Store): give the user the URL and the prepared text; the user submits. Start with dsh.pub.
- **Issues** (for example HackSing, cccakeee, dshplugin-me): `gh issue create -R <repo> --title "…" --body-file <file>`, or the site's issue form in the browser when it uses one.
- **Pull requests** to curated lists:

  ```sh
  gh repo fork <upstream> --clone --default-branch-only
  cd <repo>
  git switch -c add-<name>
  # edit exactly as the list's contributing guide says; update both language files if the list has two
  git commit -am "docs: add <name>"
  git push -u origin add-<name>
  gh pr create -R <upstream> --title "docs: add <name>" --body-file <file>
  ```

  After the PR is merged or closed, the fork is no longer needed. Ask the user before deleting it (`gh repo delete <user>/<fork>`).

- **Never** grant a directory third-party OAuth access to the user's GitHub account, and never create accounts on the user's behalf.
- Submit to each directory at most once. If an earlier submission exists, follow up on it instead of opening another one.

Record every submission in the tracker: directory, route, URL or reference number, date, status.

## 5. Follow up

Check only the entries that are still pending. For each one, record whether a detail page exists, what it shows (description, install command, compatibility), and any maintainer response. Stop checking an entry once it is listed. After a week without response, mention the entry to the user instead of re-submitting.

## 6. Add badges for confirmed listings

When a directory's detail page for this plugin loads and the directory offers a per-plugin badge, add it following [reference/badges.md](reference/badges.md). Batch the badges, get the user's approval (README is a Document file), and commit with `docs: add listing badges`.

Submission routes, links and statuses stay in the tracker, never in the README ([reference/readme.md](reference/readme.md)).

## Done when

- [ ] dsh.pub lists the plugin
- [ ] Every approved submission has been made once and is recorded in `.research/listings.md`
- [ ] Every confirmed listing that has a per-plugin badge shows it in both READMEs, pointing at this plugin
- [ ] `reference/directories.md` reflects any rule changes found along the way
