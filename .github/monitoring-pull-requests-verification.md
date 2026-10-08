# Monitoring through pull requests: implementation verification

Customer guide: `cli/monitoring-pull-requests.mdx`.

Proposed public URL: https://www.checklyhq.com/docs/cli/monitoring-pull-requests/

Generated export PR body template: `.github/templates/monitoring-export-pr.md`.
This is a separate, inactive deliverable, not the docs repository's default PR template or an installed backend template. It contains only action checkboxes and one guide link. **Publish the guide and verify the public page before installing this template in any PR generator.** The backend generator was not changed and emits no new guide URL. The anticipated URL in this file and the template is not evidence of publication.

## Source scope

Inspected on 2026-10-08:

- Docs starting commit: `b17bd765e4b16a28e2b77d56880af89b8382ef48`.
- UI/export/tracking/deployment implementation: monorepo branch `herve/project-pr-tracking-drawer`, commit `713d4f77dc59c7b76beb935916830a1e92bd7aaa`.
- CLI implementation: commit `82d702e8a2d203eb2a1abcf092e26843e5aa85ae`.
- Published CLI package used for command verification: `checkly@9.5.0`.

The monorepo feature branch is the implementation under inspection. The older `docs-source-monorepo` checkout does not contain this feature and was not used as evidence for PR export behavior. This work does not establish that the feature branch has shipped or that a particular customer account has access.

## Behavior and evidence

All monorepo paths below are relative to `apps/backend/api/src` unless they start with `apps/webapp`.

| Guide behavior | Implementation evidence |
| --- | --- |
| Code tab, GitHub connection, repository choice, source confirmation, and update actions | `apps/webapp/src/components/common/export-to-code/{ModalExportToCode.vue,ModalExportToCodeSync.vue,ExportToCode.i18n.ts}`. The Code tab is gated by `integrations:read`. The CLI tab supplies `npx checkly import <type>:<id>` instead. |
| Fresh repository vs existing deployed project; root-folder selection | `common/services/export-sync/unbound-export.ts`, `resolveExistingProject`, `constructDirectoryFor`, and `runUnboundExport`. Existing projects resolve by the config's readable `logicalId` in this account; conflicting repository bindings and undeployed configs refuse automatic adoption. |
| Export retains identity and starts pending | `unbound-export.ts` creates a `WEBAPP` import plan, generates code using its logical IDs, applies pending mappings, and records the PR operation before contacting GitHub. Construct files use `.check.ts`. `models/project-import-plan.ts`, `applyImportPlan`, creates links without updating the live resources. |
| Dependencies are a customer action | `unbound-export.ts`, `exportPullRequestBody`, receives package-manager and dependency detection results and instructs installation. It writes neither manifests nor lockfiles. This is covered by `common/services/export-sync/__tests__/unbound-export.spec.ts`. |
| Secrets must be supplied | `common/services/export-sync/redact-secrets.ts` and `unbound-export.ts`, `redactedFields` / `exportPullRequestBody`. Secret URLs use environment lookups; other credential fields can be blank. The current PR body warns about load failures and overwriting deployed credentials with blanks. |
| Bound sync patches an existing declaration | `common/services/export-sync/bound-sync.ts`, `runBoundSync` and `scanForSourceFile`. It uses the owning project, repository, and construct logical ID; source ambiguity is returned for confirmation. |
| Repeated updates reuse an open PR; branch-edit caveat | `common/services/github/github.js`, `_upsertBranchAndPullRequest` (lines 469–541), resets from the default/base branch unless `preserveBranch` is true and force-updates the branch ref. `bound-sync.ts` does not pass `preserveBranch`. The pending-export update in `unbound-export.ts` passes both `preserveBranch` and `preserveDescription`; generated resource files are still rewritten. |
| Close releases only pending reservations; reopen can conflict | `common/services/github/pull-request-lifecycle.ts`, `settlePullRequestOperation` / `reacquireReservation`. Close preserves a plan shared by another live operation. Reopen creates a fresh plan with the original logical IDs, rejecting occupied resources or a changed graph. Closing after commitment cannot undo adoption. |
| Deployment, not merge, adopts the UI export | `pull-request-lifecycle.ts`, `lockPullRequestImportsForDeploy` / `finalizePullRequestImports`, and `modules/public-api/projects/deploy/ProjectDeployService.ts`, `applyPlan`. The successful apply transaction commits a complete PR-associated plan; failures roll it back. Preview does not call apply. A partial declaration set does not commit the plan. Disabled or removed alert subscriptions that code cannot declare are released rather than blocking adoption. |
| Adoption is allowed before merge | `finalizePullRequestImports` has no merged-state gate. `common/services/github/__tests__/pull-request-lifecycle.integration-spec.ts` explicitly covers successful adoption while a PR is open or merged, partial/preview deployments, rollback, and deletion authority after pre-merge adoption. |
| Manual CLI import requires explicit commitment | CLI `packages/cli/src/commands/import/{plan,apply,commit,cancel}.ts`: `import` aliases `import plan`; plan generates files and can prompt to apply and commit; apply creates pending links and can offer commitment; commit is a separate permanent ownership operation. Automatic deployment commitment selects PR-associated operations, so a normal manual plan without an associated operation remains pending. |
| Identity/history preservation and later deletion | Import mappings retain the physical IDs. Deployment resolves those mappings. Committed member mappings confer reconciliation/deletion authority; CLI `packages/cli/src/commands/deploy.ts` implements `--preserve-resources`. A bare copy of generated code without applying an import plan has no mapping and can create duplicates. |
| Tracking and completion labels | `apps/webapp/src/features/projects/components/ProjectPullRequestsDrawer.vue`, `lifecycleLabel`, and `apps/webapp/src/components/common/managed-by-code/copy.ts`. Open/merged/closed are separate from pending/adopted/released/conflict and `appliedAt`. Explicit commitment can show Code managed without a deploy. |
| Recovery after uncertain GitHub creation | `pull-request-lifecycle.ts`, `recordPullRequestFailure`, `retryObservation`, and reconciliation. Reservations survive uncertain failures; messages ask the customer to verify App/repository access, retry, or cancel the specific import. Released or superseded identity mappings reject stale export deployment. |

## Gaps and limits, separate from customer instructions

1. **Publication/rollout:** the anticipated URL is not published by this change alone. Merge and verify the rendered public guide before enabling its link in generated PRs. Feature availability was not verified in a live account.
2. **Branch preservation:** bound sync can discard reviewer's branch edits because it rebuilds from the base branch. Pending-export updates preserve other files but replace regenerated resource files. The guide describes both; fixing this behavior is outside this docs change.
3. **Deployment attribution:** tracking marks a PR Deployed by matching resource identities, not by proving that the deployed bytes came from its merged commit. `recordPullRequestApply` can stamp multiple PR records for the same identities. Confirm the deployment revision and resource configuration; the label alone does not prove the PR's content shipped.
4. **Unsupported cases:** deterministic check sync has mappings for API, Browser, Heartbeat, TCP, Multi-step, gRPC, SSL, and Traceroute checks. It does not cover every check type or every source-code expression. Playwright suites cannot be imported from UI source through the import-plan path. Status-page exports that cannot preserve component/automation identities are refused. A manual-import fallback is appropriate only for a resource the CLI can import that is not already owned; existing owned resources need direct code edits.
5. **CLI docs drift:** `cli/checkly-import.mdx` incorrectly describes `import apply` as creating code files; the implementation creates files during plan generation and creates pending mappings during apply. Interactive plan/apply can also prompt for commitment. The new guide explains the actual sequence without expanding this change into a command-reference rewrite.
6. **Node prerequisites drift:** published `checkly@9.5.0` declares `engines.node: >=22.13.0`; the existing installation guide lists older requirements. The new guide requires a version supported by the installed package and provides an engine-error recovery action. Updating the shared installation guide is a separate correction.
7. **Verification scope:** commands were checked through installation and CLI help, and ownership/lifecycle behavior through code and existing specs. No customer login, monitoring test run, deployment, PR lifecycle mutation, or CI deployment was performed to verify product behavior. Existing backend integration specs were inspected, not reported as newly executed.

## Validation

- Installed the published Checkly package in an isolated temporary package using the documented npm command; reinstalled dependencies with `npm install`.
- Checked documented Checkly command names and flags against source and runnable CLI help; checked GitHub checkout syntax against installed `gh` help and its official manual.
- Frontmatter/canonical check, redirect-destination check, sitemap generation, and Mintlify broken-link scan passed.
- The guide is registered next to manual import in the CLI navigation; the sitemap includes its proposed canonical URL.

References used for external tooling: [GitHub CLI checkout](https://cli.github.com/manual/gh_pr_checkout) and [Mintlify docs configuration schema](https://www.mintlify.com/docs.json). The existing [Checkly CLI guide](https://www.checklyhq.com/docs/cli/overview/) and [manual import guide](https://www.checklyhq.com/docs/cli/importing/) were checked as published setup references.
