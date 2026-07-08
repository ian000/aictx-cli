# Releasing

This repository publishes to npm with npm Trusted Publisher and GitHub Actions OIDC.

## Defaults

- Source of truth: Git tag `vX.Y.Z`
- npm publish path: GitHub Actions only
- Local `npm publish`: do not use
- Changelog source: auto-generated GitHub Release notes
- Package version must exactly match the tag version

## Versioning Policy

- `patch`: bug fix, packaging fix, workflow-only safe fix
- `minor`: backward-compatible feature, new command option, new scaffolding behavior
- `major`: breaking CLI behavior or incompatible config/output changes

## Release Steps

1. Make sure `package.json` version is correct.
2. Run `npm run release:check`.
3. Generate the local draft:

```bash
npm run release:plan
```

This writes `.release-notes/vX.Y.Z.md` and shows whether the version tag already exists.

4. Merge to `main`.
5. Create and push the tag:

```bash
npm run release:tag
git push origin v1.5.1
```

6. Watch `.github/workflows/ci.yml`.
7. Confirm the GitHub Release and npm version were both created.

## Changelog Convention

- Use Conventional Commit style when possible: `feat:`, `fix:`, `chore:`, `docs:`
- GitHub Release notes are the public changelog
- Do not maintain a manual `CHANGELOG.md` unless the project later needs curated notes

## Rollback Policy

- If the tag workflow fails before npm publish, fix the workflow or code and rerun the job.
- If the package was already published, do not overwrite it.
- Publish a new patch version instead, for example `v1.5.2`.
- If a GitHub Release exists but npm publish failed, keep the release record and ship the corrected patch version.

## Trusted Publisher Guardrails

- Keep the workflow filename stable: `ci.yml`
- Keep publishing on GitHub-hosted runners only
- Keep `id-token: write` on the publish job
- Do not reintroduce `NPM_TOKEN` secrets for normal releases
