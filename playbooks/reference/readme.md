# Writing the plugin README

How to write and update `README.md` (Chinese, primary) and `README.en.md` (English). Both files have the same sections in the same order; only the language differs.

## Who reads it

1. **People deciding whether to install.** They read the first screen: what it does, what it looks like, how to install.
2. **People who installed it.** They look for where the feature is, how to configure it, and how to remove it.
3. **Machines.** npm, dsh.pub and other directories copy the first paragraph and the install command, and show the README on their pages. They cannot render relative image paths.

Write for 1 first, keep 2 complete, and never break 3.

## Sections, in this order

| Section                       | Required                   | What goes in it                                                                                                                                               |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title + language switch       | yes                        | Display name. `简体中文 \| [English](README.en.md)` and the reverse in the English file.                                                                       |
| Badges                        | yes                        | Two rows, see [badges.md](badges.md).                                                                                                                         |
| One-sentence description      | yes                        | What the plugin does for the user, in one sentence. The English one equals `package.json` `description` and the GitHub description.                          |
| Hero image or GIF             | for anything with UI       | One screenshot or short GIF of the main feature in use. Caption with the DSH version it was captured on.                                                     |
| Features (功能)               | yes                        | 3–6 bullets. Start each with the benefit in bold, then how. Only what exists today.                                                                           |
| Install (安装)                | yes                        | Requirements (minimum and verified DSH, profile), npm command, pinned GitHub command, "restart DSH". Facts: [installing.md](installing.md).                  |
| Usage (使用)                  | yes                        | Numbered first-use steps. Name the exact UI path with its real labels, e.g. **设置 → 插件 → Foo** / **Settings → Plugins → Foo**.                              |
| Configuration (配置)          | if there are settings      | Table: key, default, meaning. Say where each value is stored. Credentials: say they go to the DSH credential store and are masked.                           |
| Update, roll back, remove     | yes                        | Commands with an exact version (`<name>@X.Y.Z`, `#vX.Y.Z`), and what stays behind after removal (settings, browser storage, files).                           |
| Privacy and data (隐私与数据) | yes                        | Network requests (to where, when), files written, credentials, telemetry. Write "none" explicitly when there are none.                                      |
| Compatibility                 | yes                        | Link to `docs/compatibility.md`; name known limits in one line each.                                                                                          |
| FAQ / troubleshooting         | when issues repeat         | Symptom → cause → fix.                                                                                                                                        |
| Development                   | yes                        | Links to `docs/development.md`, `CONTRIBUTING.md`, `AGENTS.md`. Nothing more; developer detail stays in `docs/`.                                             |
| License                       | yes                        | One line.                                                                                                                                                     |

## Images

- Store them in `docs/images/` (already `export-ignore`d and outside the npm `files` list).
- Link them with absolute URLs so npm and directories render them: `https://raw.githubusercontent.com/<owner>/<name>/main/docs/images/<file>`.
- Prefer JPEG or WebP under ~300 KB; a GIF should stay under ~5 MB and show one action.
- Use a clean DSH profile: no private workspace names, paths, prompts, account details or keys in the picture.
- Alt text describes what the picture shows, in the file's language.
- Retake screenshots when the UI they show changes.

## Style

- Factual and specific. Say what the user can do ("点击侧栏的 **快速对话** 立即开始新对话"), not how impressive it is. Avoid words like 强大、无缝、极致、革命性 / powerful, seamless, ultimate.
- Use the plugin's real UI labels in the matching language. Put the English label in the English README, the Chinese label in the Chinese one.
- One command per code block, ready to copy. Use placeholders only where the value really varies (`vX.Y.Z`).
- Describe what exists. No "coming soon", no roadmap, no TODO.
- Keep each file readable on its own; do not mix languages beyond UI labels and code.

## Never put in the README

- Agent instructions (they belong in `AGENTS.md` and `playbooks/`)
- Directory submission routes, PR or issue links, review status, scores (local tracker, see `../50-listings.md`)
- Research notes, verification logs, internal decisions (RED Research / Evolve, or `docs/`)
- Relative image paths, secrets, personal data, links carrying login tokens

## When to update

| Change                                   | Update                                                          |
| ---------------------------------------- | --------------------------------------------------------------- |
| New or changed feature, setting, UI path | Features, Usage, Configuration, screenshots                     |
| New network access, stored data, or file | Privacy and data                                                |
| Release                                  | Pinned `#vX.Y.Z` install command (30-release)                   |
| New verified DSH version                 | Requirements line, DSH badge, Compatibility                     |
| Confirmed directory listing              | Badge row 2 (50-listings)                                       |

README changes are Document changes under RED: propose them with the code change and get the user's approval before committing.

## Before a release

- `pnpm check:release` passes; it rejects READMEs that still contain `TODO`
- Both files have the same sections, the same badges and the same commands
- The description matches `package.json` and the GitHub description
- Every image URL loads (`curl -sIL <url>` returns 200) and every link works
- The install command was tested in a clean DSH home
