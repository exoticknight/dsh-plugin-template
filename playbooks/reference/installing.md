# Installing the plugin

## User installs

What the README gives users. Replace `web` with the profile the plugin targets.

| Source                | Command                                                      |
| --------------------- | ------------------------------------------------------------ |
| npm                   | `dsh plugin --profile web add <name>`                        |
| npm, exact version    | `dsh plugin --profile web add <name>@X.Y.Z`                  |
| GitHub release        | `dsh plugin --profile web add github:<owner>/<name>#vX.Y.Z`  |
| Remove                | `dsh plugin --profile web remove <name>`                     |

Users restart DSH afterwards. For updates and rollbacks, always give an exact version: pnpm prefers releases older than 24 hours.

To check a release the way users install it (throwaway DSH home, cleaned up afterwards):

```sh
pnpm smoke <name>@X.Y.Z
pnpm smoke github:<owner>/<name>#vX.Y.Z
```

## Development installs

Only into the repository's own `.dsh-dev/`:

```sh
pnpm dev             # link this checkout into .dsh-dev and start DSH
pnpm dev:install     # link only
pnpm dev:dsh <args>  # any dsh command against .dsh-dev
pnpm dev:clean       # delete .dsh-dev
```

After a change: `pnpm build`, then restart DSH. The scripts need `DSH_BIN` (path to an installed `@deepseek-ai/dsh/lib/bin.js`) or a local `pnpm add -D @deepseek-ai/dsh@<version>`.

Do not replace these scripts with `DSH_HOME=… dsh …`: `dsh` on PATH may be a launcher that ignores `DSH_HOME` and writes to the user's real home.

## Package rules

`dsh plugin add` runs pnpm 11 inside the user's profile, so the package must:

- have no `prepare` script: pnpm blocks it on `github:` installs, which then fail
- have no `preinstall`, `install` or `postinstall` script: pnpm blocks build scripts in the user's profile
- have no `prepack` script: it does not break installs, but the committed `lib/` is the build, and a pack-time rebuild could ship something other than what CI tested
- take runtime dependencies only from the npm registry, without build scripts
- list only `@deepseek-ai/*` packages as peers (peers are not installed for users)

`pnpm test` checks all three.

## What each install downloads

| Install                              | What pnpm downloads                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `<name>` / `<name>@X.Y.Z`            | The npm tarball the release workflow published                                                        |
| `github:<owner>/<name>#vX.Y.Z`       | GitHub's own source archive of that tag (`codeload.github.com/.../tar.gz/<commit>`), repacked by pnpm using the `files` whitelist |

So:

- Do not upload `.tgz` or checksum files to GitHub Releases. Neither install uses them; the release workflow only writes release notes.
- `github:` installs work only because `lib/` is committed. A plugin that builds on install instead has to ship a tarball, which is what this template avoids.
- GitHub's archive honours `export-ignore` in `.gitattributes`. Never mark a file that `files` needs (`lib/`, `cordis.patch.yml`, `package.json`, `README*`, `LICENSE`) as `export-ignore`, or `github:` installs lose it. `pnpm test` checks this.
