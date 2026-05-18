# PR Screenshots

Visible UI work needs working screenshots in the PR description.

This project should avoid the failure mode where a screenshot exists in the repo
but reviewers cannot load it because the repo is private, the URL points to a
branch that later gets deleted, or the image is only available to an authenticated
GitHub session.

## Rules

- Include screenshots for visible UI work.
- Verify screenshot URLs before marking a PR ready or sending a ship notice.
- Do not rely on private GitHub `blob` URLs as durable PR evidence.
- Do not rely on private `raw.githubusercontent.com` URLs as durable PR evidence.
- Do not rely on branch-scoped repo file URLs after a branch may be deleted.
- Refresh screenshots after follow-up commits if the UI changed.

## Preferred Storage

For durable screenshots:

```text
docs/pr-screenshots/<issue-or-pr>-<short-slug>.png
public/pr-screenshots/<issue-or-pr>-<short-slug>.png
```

Why both:

- `docs/pr-screenshots/` keeps reviewer/source context in docs.
- `public/pr-screenshots/` gives the deployed app a stable public URL:
  `https://cheekypint.com/pr-screenshots/<file>.png`.

Use deployed `https://cheekypint.com/pr-screenshots/...` URLs only after the file
has reached `main` and the deployment containing it is live.

For open PRs before deployment, use a GitHub uploaded image attachment URL that
returns 200 without repo authentication.

## Verification

Use one of:

```bash
curl -I "https://cheekypint.com/pr-screenshots/<file>.png"
```

or open the URL in a browser session that is not relying on private repo file
access.

Record screenshot evidence in the PR body:

```md
Screenshots
* Public features page: https://cheekypint.com/pr-screenshots/issue-123-features.png
* Admin roadmap: https://cheekypint.com/pr-screenshots/issue-123-admin-roadmap.png
```

## PR Body Reminder

When creating or editing PR descriptions from a shell, use a real multiline body
source such as `--body-file`. Do not pass escaped `\n` text as the body.
