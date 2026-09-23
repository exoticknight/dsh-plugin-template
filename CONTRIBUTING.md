# Contributing

Thanks for helping improve {{PLUGIN_TITLE}}.

Working with an AI agent? Point it at [AGENTS.md](AGENTS.md); it links the step-by-step playbooks for development, releases and maintenance.

1. Open an issue before changing behavior, so the approach can be agreed first.
2. Set up the project as described in [docs/development.md](docs/development.md).
3. Keep changes focused. Update README and docs when user-visible behavior changes.
4. Run `pnpm verify` before pushing. Commit the rebuilt `lib/` with the source change; the pre-commit hook does this for you.
5. Write commit messages as [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).

Contributions are licensed under the Apache License 2.0.
