# Claude Code GitHub Issue Workflow

## Workflow Steps
1. Read GitHub issue content using `gh issue view <issue_number>`
2. Create new branch: `git checkout -b feature/issue-<issue_number>`
3. Implement the requested changes
4. Commit changes with appropriate message
5. Push branch: `git push -u origin feature/issue-<issue_number>`
6. Create PR: `gh pr create --title "..." --body "..."`
7. Comment on original issue with PR link

## Usage
When given an issue number, Claude Code will:
- Extract the issue requirements
- Create and switch to a new branch
- Implement the requested feature/fix
- Push the branch and create a PR
- Link back to the original issue