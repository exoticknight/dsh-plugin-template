# DSH plugin directories

Known places where DSH plugins are listed, how each one takes plugins in, and whether it offers a per-plugin badge. The procedure that uses this table is [../50-listings.md](../50-listings.md).

**Last verified: 2026-09-20**, from submission records of four published plugins. The ecosystem changes quickly: sites pause, move, or change their rules. Open the directory's current rules before submitting, and update this file (and the date) when something has changed.

## Common requirements

Almost every directory checks the same things. 00-init and 10-github already cover them:

- Public GitHub repository with the installable DSH bundle at the repository root (`package.json` `dsh.bundle`, `cordis.patch.yml`, an `apply(ctx)` entry)
- Topics `dsh-plugin` and `deepseek-harness` (many directories only scan topics); `dsh` and `dsh-bundle` help some scanners
- A README with a factual description and a working `dsh plugin add …` install command
- A LICENSE file
- Committed entry files (`lib/`), because several sites read the git tree instead of npm

## A. Automatic (topic scan, nothing to submit)

These pick up public repositories with the `dsh-plugin` topic, usually within a day.

| Directory                        | URL / search                                     | Badge | Notes                                                                                         |
| -------------------------------- | ------------------------------------------------ | ----- | --------------------------------------------------------------------------------------------- |
| dsh-plugin.org                   | `https://dsh-plugin.org/plugins?q=<name>`        | yes   | Manual submit at `https://dsh-plugin.org/submit` if not picked up.                            |
| dsh-xray                         | `https://unstone.github.io/dsh-xray/p/<owner>__<name>.html` | yes | Capability card, not an endorsement.                                                       |
| DSH Marketplace                  | `https://dshmarketplace.dev/plugins?q=<name>`    | no    | Also has a curated list that takes PRs (section B).                                           |
| DSH Market                       | `https://dsh.market/?q=<owner>%2F<name>`         | yes   | Daily scan; alternatively an issue with the `submit_plugin` template at `2BingLing/dsh-market`. |
| dsh-plugins.org                  | `https://github.com/lwmxiaobei/dsh-plugins`      | no    | Periodic README snapshot.                                                                     |
| dshplugin.market                 | `https://dshplugin.market`                       | no    | No backend; topic scan only.                                                                  |
| DSH Plugin Hub                   | `https://dshpluginhub.dev/en/plugins?q=<name>`   | no    | Daily scan. Its formal submission asks for third-party GitHub OAuth; do not grant it.          |

## B. Submission needed

| Directory                    | Route                                                                                                                                             | Badge | Notes                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------- |
| **dsh.pub**                  | Form at `https://dsh.pub/en/submit/`; it opens a PR on `dsh-pub/dsh-pub` for you. The user fills in the form.                                   | yes   | Checks metadata, patch, runtime entry, README and license; never runs code. Usually merged within minutes. Highest priority. |
| Awesome DSH Plugin           | PR to `awesome-dsh-plugin/awesome-dsh-plugin` per its `contributing.md` (recently a data file `data/plugins/<owner>__<name>.yml`)                | yes   | Review queue can take days; green checks are informational.                                            |
| DSH Marketplace curated list | PR to `DshMarketPlace/awesome-dsh-plugin`, add `- repo: <owner>/<name>` under a category in `data/curated.yml`                                  | no    | Requires both topics, install command, license.                                                        |
| Awesome DeepSeek Harness     | PR to `0xsline/awesome-deepseek-harness`: one factual line in the matching category of both language lists; title `docs: add <name>`           | no    | Do not use the list's own Awesome badge.                                                                |
| DSH Plugin Radar             | PR to `AdamPlatin123/dsh-plugin-radar` (`PLUGINS.md`)                                                                                             | no    | Also runs its own install verification.                                                                 |
| HackSing DSH Plugins         | Issue form `submit-plugin.yml` at `HackSing/dsh-plugins`                                                                                           | no    |                                                                                                         |
| DeepSeek Harness Plugins     | Issue or PR at `cccakeee/awesome-dsh-plugins`; the site `deepseekharnessplugins.com` syncs from it                                                 | yes   |                                                                                                         |
| dshplugin.me                 | Issue or PR at `dshplugin-me/dsh-plugin-radar`                                                                                                     | yes   |                                                                                                         |
| dshplugin.dev                | Web form at `https://dshplugin.dev/submit` (user fills it in); manual editorial review                                                            | no    | Keep the reference number the form returns.                                                            |
| dshplugin.world              | Open an issue titled `[dshplugin.world] list this` **in the plugin's own repository**                                                            | no    |                                                                                                         |
| DSH Plugin Store             | Web form at `https://dshpluginstore.com/submit` (user fills it in); periodic review rounds                                                       | no    | No public queue.                                                                                        |
| dshplugin.io                 | Issue at `tjsdyy/dshplugin`                                                                                                                        | no    | Slow; issues have gone unanswered.                                                                      |
| 1024Store                    | Issue at `imsai-sh/awesome-deepseek-harness-plugins`                                                                                               | no    | Slow; issues have gone unanswered.                                                                      |

## C. Not a fit for code plugins

- **DSH Themes** (`dsh-themes.com`) takes declarative themes, full skins and visual concepts, not `dsh.bundle` code plugins.
