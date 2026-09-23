# README badges

Reference for the badge block at the top of `README.md` (Chinese) and `README.en.md` (English). The two files carry an identical badge block.

## Rules

1. **Every badge about the plugin points at the plugin itself.** Use the plugin's own `<owner>/<name>` (and npm name) in both the image URL and the link. Never copy badge lines from another plugin's README without replacing every owner and name.
2. **Tool badges link to the tool.** The RED badge links to the RED project because it describes how the repository is maintained, not the plugin. Keep it only while the repository uses RED.
3. **Listing badges only after the listing is confirmed.** A directory's badge is added when its detail page for this plugin loads (see [../50-listings.md](../50-listings.md)). No listing badge is present by default, dsh.pub included.
4. **Only per-plugin badges.** If a directory has no badge for individual plugins, add none. Never use a list's own badge (for example an "Awesome" badge for the list itself) as if it were a listing badge.
5. **Prefer the directory's official snippet.** When the directory shows a Markdown snippet on the plugin page or submit page, use it (with this plugin's owner and name). Otherwise use the table below.
6. **Check that each image renders:** `curl -sIL "<image url>"` returns `200` with an image content type.
7. shields.io static badges use `-` as a separator: write a `-` inside a value as `--` and `_` as `__` (for example `DSH-0.1.5--rc.2-blue`).

## Layout

Two rows, separated by a blank line.

**Row 1: project status**, in this order:

| Badge          | Markdown                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| npm (npm only) | `[![npm](https://img.shields.io/npm/v/<name>?logo=npm)](https://www.npmjs.com/package/<name>)`                                                   |
| CI             | `[![CI](https://github.com/<owner>/<name>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<name>/actions/workflows/ci.yml)`      |
| Release        | `[![Release](https://img.shields.io/github/v/release/<owner>/<name>?sort=semver)](https://github.com/<owner>/<name>/releases/latest)`            |
| License        | `[![License](https://img.shields.io/github/license/<owner>/<name>)](LICENSE)`                                                                   |
| DSH version    | `![DSH](https://img.shields.io/badge/DSH-<verified version, escaped>-blue)`                                                                      |
| RED            | `[![Maintained with RED](https://img.shields.io/badge/maintained_with-RED-C1121F)](https://github.com/exoticknight/red)`                        |

**Row 2: directory listings**, absent until the first listing is confirmed; then one badge per confirmed listing, in the order they were confirmed:

| Directory                  | Markdown                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dsh.pub                    | `[![dsh.pub registry status](https://dsh.pub/api/badges/<owner>/<name>.svg)](https://dsh.pub/en/plugins/?q=<owner>%2F<name>)`                                                            |
| DSH Market                 | `[![Listed on DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/?q=<owner>%2F<name>)`                     |
| dsh-plugin.org             | `[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/<owner>/<name>)`                                                                 |
| Awesome DSH Plugin         | `[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)` (official snippet; links to the directory)                                            |
| dsh-xray                   | `[![dsh-xray](https://img.shields.io/endpoint?url=https%3A%2F%2Funstone.github.io%2Fdsh-xray%2Fbadge%2F<owner>__<name>.json)](https://unstone.github.io/dsh-xray/p/<owner>__<name>.html)` |
| DeepSeek Harness Plugins   | `[![DeepSeek Harness Plugin](https://deepseekharnessplugins.com/api/badge/<owner>/<name>)](https://deepseekharnessplugins.com/plugins/<owner>/<name>)`                                   |
| dshplugin.me               | `[![dshplugin.me](https://dshplugin.me/badge.svg)](https://dshplugin.me)` (check the site for a per-plugin link)                                                                          |

dsh-xray shows an automated capability analysis. It is not a quality or security endorsement; do not describe it as one.

In a new plugin, an HTML comment below row 1 marks where row 2 goes.
