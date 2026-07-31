# Workflow Notes

- `ci.yml` is the trusted-publisher workflow bound in npm package settings.
- Do not rename `ci.yml` without updating npm Trusted Publisher configuration first.
- New projects initialized by `aictx init` use `.github/workflows/npm-publish.yml` by default; keep the npm package Trusted Publisher filename in sync with the workflow file actually used by that repository.
