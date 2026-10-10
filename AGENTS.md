# Workflow Conventions (for all coding agents & humans)

Repo: `fullstack-work-sample-damar`. Keep it simple, but always traceable.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production. Only receives PRs from `develop` when a stable result is ready. |
| `develop` | Integration. Default branch. All feature PRs target this. |
| `<type>/<short-name>` | One branch per feature/fix/task, created from `develop`. |

- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.
- Examples: `feat/virtualized-table`, `fix/jwt-refresh`, `docs/tco-analysis`.
- Never commit directly to `main` or `develop`.
- Branch name may include the issue number: `feat/12-virtualized-table`.

## Issues

- Every unit of work starts as a GitHub issue (use the `Task` template).
- One issue = one branch = one PR.
- Create it with: `gh issue create --title "..." --body "..."`.

## Commits

- Conventional Commits: `type: short imperative summary` (max ~72 chars).
- One logical change per commit. Body explains *why* when not obvious.
- Never commit secrets, `.env*`, `.claude/`, `.remember/`.
- No force-push, `--amend` on pushed commits, or `reset --hard` without explicit user approval.

## Pull Requests

- Target `develop` (only release PRs target `main`).
- Title follows Conventional Commits.
- Link the issue in the body: `Closes #<number>`.
- Fill the PR template: Summary, Changes, How to test, Notes.
- Merge strategy: **squash** into `develop`; **merge commit** for `develop` -> `main`.
- Agents open PRs but **do not merge** them; the owner merges.

## Per-task flow

```bash
git checkout develop && git pull
gh issue create --title "feat: ..." --body "..."      # note the issue number
git checkout -b feat/<n>-<name>
# ...work, commit often...
git push -u origin HEAD
gh pr create --base develop --fill                      # add "Closes #<n>"
```

## Definition of done (per PR)

- Runs locally without errors (build/lint/tests that exist pass).
- PR description lets a reviewer understand and verify it in minutes.
- Linked issue is referenced with `Closes #<n>`.
