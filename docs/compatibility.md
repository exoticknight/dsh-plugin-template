# Compatibility

| Item            | Value                                                               |
| --------------- | ------------------------------------------------------------------- |
| DSH install gate | None (`engines.dsh` and optional host peer are `*`)                 |
| Local dev CLI    | Latest stable; highest prerelease if no stable is published        |
| Verified DSH     | Pending plugin-specific verification                                |
| Node.js          | `^22.19.0 \|\| >=24.0.0`                                           |
| Profile          | `{{DSH_PROFILE}}`                                                   |

## Integration contracts

List each DSH service, slot, route or DOM anchor the plugin relies on, and how the plugin behaves when it is missing. Check this list again whenever the verified DSH version changes.

- Host admission: DSH checks `engines.dsh` when present and falls back to `@deepseek-ai/dsh` peer ranges only when it is absent. This template uses `engines.dsh: "*"` and an optional `@deepseek-ai/dsh: "*"` peer, so DSH metadata does not impose a version floor; DSH's SemVer check includes prereleases, so the wildcard accepts RC and alpha versions too. `config.dshVersion: "stable"` is read by this template's development scripts, not by DSH. The wildcard is not a claim that every DSH release exposes the APIs a plugin may use. See [DSH's plugin compatibility rules](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md).
- Client: `./client` registers a lazy CommonJS factory through `window.__ModuleLoader__.load`. Source `inject` lists Cordis services; `dsh.client.external` lists module requests beyond the platform baseline. `dsh.client.inject` is informational metadata. This scaffold has no client module or service dependencies.
- Plugin Manager icon: DSH reads a package-root plugin's top-level `icon` from its exported `package.json`; the path is relative to the package root. This template declares `./icon.svg` and ships it in the npm package. Missing or invalid icons use DSH's default artwork. See the [versioned metadata guide](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.0-rc.2/docs/cookbook/adding-a-package.md).
- These contracts were inspected in the published `0.2.0-rc.2` packages `@deepseek-ai/dsh-app-boot`, `@deepseek-ai/dsh-client-modules` and `@deepseek-ai/dsh-package-manifest`. See the [versioned module documentation](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.0-rc.2/packages/client/modules/README.md). Recheck the live contract before relying on a DSH API, then record plugin-specific services and tested behavior here.

## Manual verification

<!-- template:start -->

Template baseline checked on 2026-10-04 with Windows, Node 24.20.0 and DSH 0.2.0-rc.2: the template and a generated plugin both logged host `loaded` and browser `client 0.1.0 ready` in isolated homes. The generated plugin installed from the frozen lockfile without pulling the CLI into its dependencies. This evidence covers the blank scaffold; initialization removes this note so new plugin behavior starts with a pending verification record.

<!-- template:end -->

Record the exact DSH version and observed host/client behavior for each verification. A wildcard install gate does not verify runtime compatibility. `pnpm smoke` checks installation and merged configuration only; confirm runtime activation with `pnpm dev` and the browser. `pnpm dev:cli` prefers the latest stable npm release and falls back to the highest published prerelease SemVer version only when no stable version exists; it does not rely on the `latest` dist-tag.

- TODO
