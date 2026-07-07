# Graphify-Go Integration Refactor Plan

## Goal

Refactor the integration between `aictx-cli` and `graphify-go` so that:

1. `graphify-go` remains an independently releasable project.
2. Integration happens through a stable npm-distributed CLI contract instead of an implicit JS wrapper contract.
3. `aictx-cli` only depends on documented `graphify-go` commands and machine-readable outputs.
4. Release and local development flows are both predictable.

## Current Problems

1. `aictx-cli` currently imports `graphify-go` as a Node API, but the real product is a Go binary plus a thin npm wrapper.
2. `aictx-cli` generates skill instructions that mention `query`, `--dfs`, and `--no-viz`, but those capabilities do not exist in `graphify-go`.
3. `graphify-go` package metadata and release ownership are inconsistent across Go module path, npm package metadata, and GitHub release download URLs.
4. `aictx-cli` lockfile history contains a local relative dependency path to `graphify-go`, which is not suitable for a published integration.

## Target Architecture

### graphify-go responsibilities

- Provide a stable CLI contract.
- Produce deterministic output artifacts.
- Ship binaries through GitHub releases and npm install.
- Optionally expose a tiny JS helper, but treat that helper as a convenience layer, not the primary contract.

### aictx-cli responsibilities

- Invoke `graphify-go` through the CLI contract.
- Read generated files such as `graph.json` and `system-graph.md`.
- Translate those artifacts into onboarding docs and IDE skills.
- Avoid promising unsupported graph query features.

## Refactor Scope

### 1. graphify-go

- Add explicit subcommand-based CLI entrypoints while keeping backward compatibility:
  - `graphify-go analyze --dir <dir> --out <dir>`
  - `graphify-go print --dir <dir> --format json|markdown`
- Keep plain `graphify-go -dir ... -out ...` working as a compatibility path.
- Add a stable machine-readable stdout mode for JSON and Markdown output.
- Unify repository metadata and binary download source.
- Keep npm package install behavior aligned with release asset names.

### 2. aictx-cli

- Stop calling the `graphify-go` JS wrapper directly.
- Invoke the `graphify-go` executable via process execution.
- Update onboarding flow to use the new `analyze` contract.
- Update generated skill text so it only references supported commands.
- Point package dependency to a published semver version instead of a local path.

## Implementation Steps

1. Define and implement the `graphify-go` CLI contract.
2. Update `graphify-go` README and install metadata to match the real release source.
3. Update `aictx-cli` graph command to shell out to `graphify-go`.
4. Update `aictx-cli` onboard flow and generated skill instructions.
5. Verify both repos locally.
6. Commit `graphify-go`, release GitHub assets, publish npm.
7. Update `aictx-cli` dependency to the new `graphify-go` version, verify, commit, publish npm.

## Verification Checklist

### graphify-go

- `graphify-go analyze --dir . --out ./tmp-out`
- `graphify-go print --dir . --format json`
- `graphify-go print --dir . --format markdown`
- npm install downloads the expected binary for the current platform

### aictx-cli

- `aictx graph analyze --dir . --out ./tmp-out`
- `aictx init --onboard` still generates graph artifacts successfully
- generated IDE skill text only references real commands
- test suite and build pass

## Release Prerequisites

1. npm publish access for both `graphify-go` and `aictx-cli`.
2. GitHub push/tag access for both repositories.
3. For `graphify-go`, GitHub release assets must exist before the npm package version is broadly usable, because npm install downloads the binary from GitHub releases.

## Local Development Policy

- Published integration uses semver npm dependency only.
- Cross-repo local debugging uses `npm link`, workspace overrides, or temporary local install commands, but those local paths must not be committed to the release lockfile.
