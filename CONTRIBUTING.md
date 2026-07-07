# Contributing

## Development

This project uses [pnpm](https://pnpm.io). Install dependencies with `pnpm install`.

The test suite and type check both import `vitest-browser-svelte` through its package exports, which resolve to the built output in `dist/`. **Run `pnpm build` before `pnpm test` or `pnpm typecheck`**, or they'll fail to resolve the package. While iterating, keep `pnpm dev` running to rebuild `dist/` on every change.

| Script           | What it does                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Rebuild `dist/` on change (`tsdown --watch`). Run this in the background while developing.   |
| `pnpm build`     | Build `dist/` once (`tsdown`). Required before `test` and `typecheck`.                       |
| `pnpm test`      | Run the test suite in Vitest browser mode. Requires a prior `build`.                         |
| `pnpm typecheck` | Type-check the project with `tsc`. Requires a prior `build`.                                 |
| `pnpm lint`      | Lint with ESLint (cached).                                                                   |
| `pnpm lint:fix`  | Lint and auto-fix.                                                                           |
| `pnpm release`   | Browse release types and versions interactively (used to preview a version bump; see below). |

## Release process

> This section is for maintainers with commit access.

Releases — publishing the npm package, creating the git release tag, and generating the associated GitHub release — are driven by a pull request and carried out by GitHub Actions, not from a maintainer's machine. The release PR holds the version bump, and merging it kicks off the actual publish.

1. **Prepare the release PR.** Run the [`Prepare Publish`](./.github/workflows/prepare-publish.yml) workflow with two inputs:

   - `target_branch` — the branch to release from (`main` for the current line). The Actions "Use workflow from" selector should point at the same branch.
   - `release` or `version` — the version bump. The default `release: next` bumps to the next patch for stable releases (`2.1.1 -> 2.1.2`), or the next prerelease when already on one (`2.2.0-beta.2 -> 2.2.0-beta.3`). Otherwise set `release` to a specific bump type, or pass an exact `version` for pre-releases.

   The workflow pushes the bump to a branch and opens the release PR. To preview what a `release` input resolves to, run `pnpm release` locally first — it lets you browse release types and versions interactively (cancel before confirming so nothing is committed).

2. **Review and merge the PR.** Check the version bump, then merge so the `chore: release v*` commit lands on the target branch — that commit is what triggers publishing.

3. **Approve the publish workflow.** Merging triggers the [`Publish Package`](./.github/workflows/publish.yml) workflow, which pauses for `Release` environment approval. Open the workflow run in GitHub Actions and approve the `Release` environment deployment; the workflow then stages the package on npm, pushes the release tag, and generates the GitHub release.

4. **Approve the npm staged publish.** Review the staged package on npm, then approve it with 2FA so the release becomes installable. Afterwards, confirm npm, the tag, and the GitHub release all look right.

### Required configuration

The workflows expect the following to be set up on the repository:

- A `Release` [environment](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment) with required reviewers (used for the publish approval gate).
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) configured for `vitest-browser-svelte`, so the publish job can authenticate via OIDC (`id-token: write`) without a long-lived npm token.
- A GitHub App installed on the repository, exposed via the `RELEASE_GITHUB_APP_ID` and `RELEASE_GITHUB_APP_PRIVATE_KEY` secrets. It needs `contents: write` and `pull-requests: write` so the `Prepare Publish` workflow can open the release PR and the `Publish Package` workflow can push the release tag. Using the app token (instead of the default `GITHUB_TOKEN`) ensures the release PR triggers CI.
