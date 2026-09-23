# RED Agent Instructions

This project uses RED Protocol 1 to keep unresolved research, ongoing change and accepted knowledge apart. Paths are declared in `red.toml`.

## Repository mapping

- **Document**: `README.md`, `README.en.md`, `CONTRIBUTING.md` and `docs/**`. Accepted user, compatibility and maintainer guidance. Treat it as the normative baseline.
- **Research**: `.research/`. Unresolved questions, evidence, experiments and conflicting claims. Not requirements.
- **Evolve**: `.evolve/`. Proposed or active changes with rationale, scope, acceptance conditions and open questions.
- Research and Evolve are local-only working records ignored by Git. Create the directories when needed.

## Workflow

1. Read `AGENTS.md` and `red.toml` before starting.
2. Load only the Document, Evolve, Research and code relevant to the task.
3. Implement directly when accepted knowledge already specifies the work.
4. Use Research when an unknown could change the decision. Report findings and wait for explicit approval before entering Evolve.
5. Use Evolve when the task changes accepted behavior, public interfaces, configuration, architecture or engineering rules.
6. When acceptance conditions pass, report the evidence and the proposed Document changes. Update Document only after separate acceptance (`document_requires_approval = true`).
7. If Document conflicts with code, configuration or runtime behavior, report the conflict (`report_document_implementation_conflicts = true`) and investigate it through Research.
8. Run `red check --json` when the CLI is available. Otherwise do the same structural checks by hand and say the CLI check was skipped.
