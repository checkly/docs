- [ ] Check out this PR and work from the folder containing the Checkly config.
- [ ] Install project dependencies; keep the existing Checkly version or add `checkly` if missing, and commit any manifest and lockfile changes.
- [ ] Review the generated files and configure their required secrets for local use and CI.
- [ ] Authenticate to the resource's Checkly account and run `checkly test` and `checkly deploy --preview`.
- [ ] Merge the reviewed PR.
- [ ] Deploy the merged code with `checkly deploy`, or confirm your existing CI does so.
- [ ] Confirm a successful deployment and the resource's ownership and identity in Checkly.

[Manage monitoring through pull requests](https://www.checklyhq.com/docs/cli/monitoring-pull-requests/)
