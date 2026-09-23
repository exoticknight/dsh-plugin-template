<!-- Writing guide: playbooks/reference/readme.md. Keep the same sections as README.md. -->

# {{PLUGIN_TITLE}}

[简体中文](README.md) | English

<!-- npm:start -->[![npm](https://img.shields.io/npm/v/dsh-plugin-template?logo=npm)](https://www.npmjs.com/package/dsh-plugin-template) <!-- npm:end -->[![CI](https://github.com/{{OWNER}}/dsh-plugin-template/actions/workflows/ci.yml/badge.svg)](https://github.com/{{OWNER}}/dsh-plugin-template/actions/workflows/ci.yml) [![Release](https://img.shields.io/github/v/release/{{OWNER}}/dsh-plugin-template?sort=semver)](https://github.com/{{OWNER}}/dsh-plugin-template/releases/latest) [![License](https://img.shields.io/github/license/{{OWNER}}/dsh-plugin-template)](LICENSE) ![DSH](https://img.shields.io/badge/DSH-{{DSH_VERSION_BADGE}}-blue) [![Maintained with RED](https://img.shields.io/badge/maintained_with-RED-C1121F)](https://github.com/exoticknight/red)

<!-- Listing badges: add a row here only after each listing is confirmed. See playbooks/reference/badges.md. -->

{{DESCRIPTION}}

<!-- client:start -->

<!-- Hero screenshot or GIF: store it in docs/images/ and use an absolute URL, e.g.
![{{PLUGIN_TITLE}} in DSH {{DSH_VERSION}}](https://raw.githubusercontent.com/{{OWNER}}/dsh-plugin-template/main/docs/images/hero.jpg)
-->

<!-- client:end -->

## Features

- TODO: **Benefit to the user**: how it works. 3–6 bullets, only what exists today.

## Install

Requirements: DeepSeek Harness `{{DSH_MIN_VERSION}}` or newer (verified on `{{DSH_VERSION}}`) with a `{{DSH_PROFILE}}` profile.

<!-- npm:start -->

### From npm (recommended)

```sh
dsh plugin --profile {{DSH_PROFILE}} add dsh-plugin-template
```

<!-- npm:end -->

### From GitHub

Pinned to a release tag:

```sh
dsh plugin --profile {{DSH_PROFILE}} add github:{{OWNER}}/dsh-plugin-template#v0.1.0
```

Or download the `.tgz` from [Releases](https://github.com/{{OWNER}}/dsh-plugin-template/releases) and install it offline with `dsh plugin --profile {{DSH_PROFILE}} add <absolute path to the .tgz>`.

Restart DSH (or the desktop app) and reload the page. The command installs into the DSH you normally use; if you set your own `DSH_HOME`, run it in that same environment.

Installing from source is for development; see [docs/development.md](docs/development.md).

## Usage

1. TODO: first-use steps with the real English UI labels, e.g. **Settings → Plugins → {{PLUGIN_TITLE}}**.

## Configuration

| Key       | Default | Description        |
| --------- | ------- | ------------------ |
| `enabled` | `true`  | Enable the plugin. |

TODO: where settings are stored; for API keys, that they go to the DSH credential store and are shown masked.

## Update, roll back, remove

To update or roll back, name the version, then restart DSH (for 24 hours after a release, an install without a version may still pick the previous one):

<!-- npm:start -->

```sh
dsh plugin --profile {{DSH_PROFILE}} add dsh-plugin-template@X.Y.Z
```

<!-- npm:end -->

```sh
dsh plugin --profile {{DSH_PROFILE}} add github:{{OWNER}}/dsh-plugin-template#vX.Y.Z
```

To remove:

```sh
dsh plugin --profile {{DSH_PROFILE}} remove dsh-plugin-template
```

TODO: what stays behind after removal (settings, browser storage, files), or "Nothing is left behind."

## Privacy and data

TODO: which network endpoints the plugin contacts, which files it writes, which credentials it stores. Write "None." when there are none.

## Compatibility

See [docs/compatibility.md](docs/compatibility.md).

## Development

See [docs/development.md](docs/development.md) and [CONTRIBUTING.md](CONTRIBUTING.md). When an AI agent develops, releases or maintains the plugin, have it read [AGENTS.md](AGENTS.md) first.

## License

[Apache License 2.0](LICENSE)
