# GitHub Discussion read mirror

This site uses a generated, read-only snapshot of one real GitHub Discussion. It
does not create a second discussion system and it does not collect or submit
messages from the browser.

## What is implemented

- Public visitors can read the checked-in snapshot without logging in.
- The snapshot contains the published discussion body, the first **50 root
  comments** returned by GitHub, and the first **10 replies per root comment**.
  Unpublished, deleted and minimized comments are omitted (including replies
  under an omitted parent). It is not a complete archive or a latest-first feed.
  Each body is capped at 20,000 characters, the title at 500; truncation is
  disclosed in the UI.
- The sync requests `bodyText`, not rendered HTML, and the generated data omits
  email fields. Email-like strings in titles and bodies are redacted as
  `[email removed]`. Author data contains only the public GitHub login, not
  profile, avatar, email, or contact fields. Email masking is a best-effort
  safeguard, not a guarantee against obfuscated personal information; moderate
  the source and never post private information. HTML-like text is displayed
  literally, not interpreted. No Markdown links or images are activated.
- `js/discussion.js` exports `initDiscussion(container)`. It fetches the
  same-origin `assets/data/discussions.json` snapshot and renders all remote
  text with `textContent`; it does not inject GitHub HTML or Markdown.
- The UI follows `document.documentElement.dataset.lang` and rerenders on the
  existing `languagechange` event. Dates are formatted in the visitor's local
  timezone.
- The GitHub link explicitly discloses that posting/replying requires GitHub
  sign-in. Reading the mirror is public; commenting is not anonymous.
- The renderer shows sync time, truncation/staleness notices, and closed/locked
  status. Loading, empty, error and retry states also support both languages.
  No third-party requests are made by the reader until they follow the link.
- The ready view is compact: “最近留言” / “Recent comments”, the local sync date,
  comments and threaded replies (or a short empty message), and the actual
  GitHub discussion link with sign-in disclosure. Sync, limits, privacy and
  closed/locked status are inside a native, initially collapsed `<details>`
  labelled “同步与隐私说明” / “Sync & privacy notes”. The original announcement
  title/body are also inside those details, never repeated in the default view.
  Original text is not translated or split heuristically: bilingual announcements
  stay hidden until explicitly expanded; commenter content is always visible.

## Sync setup

After creating the real Discussion, create
`content/discussions-config.json` locally. Do not commit a GitHub token or put
one in the browser:

```json
{
  "repository": "yichen-kong/yichen-kong.github.io",
  "repoId": "R_kgDOSkmIlA",
  "categoryId": "DIC_kwDOSkmIlM4DHQ-n",
  "discussionNumber": 123,
  "discussionUrl": "https://github.com/yichen-kong/yichen-kong.github.io/discussions/123"
}
```

Replace `123` with the actual Discussion number and URL. Discussions are now
enabled according to the site owner's setup. The General category IDs above
are the supplied real IDs, not values to infer from a category name.

Use Node.js 20 or newer. Supply a token through the environment or a CI secret:
prefer a fine-grained token restricted to this repository with **Discussions:
read** permission. A workflow token must likewise be allowed to read
Discussions (`discussions: read`); deployment permissions are separate.
`GH_TOKEN` takes precedence over `GITHUB_TOKEN`. Neither belongs in config,
generated JSON, a browser bundle, log, or shell command history.

Run from the repository root, with the environment variable already securely
populated:

```powershell
node scripts/sync-discussions.mjs
```

The script accepts `GH_TOKEN` or `GITHUB_TOKEN`, uses GitHub GraphQL, and never
prints the token. It validates the repository ID, category ID, Discussion
number, canonical GitHub URL and public repository visibility against the API.
GraphQL errors (including partial-data errors) fail the sync. The CLI emits
only a count summary on success or a generic diagnostic on failure, not API
response bodies or tokens. Requests time out after 30 seconds.

**File contract:** the CLI writes only `content/discussions.json`, using a
temporary sibling plus rename after a successful fetch/validation. Failed
fetches leave an existing snapshot intact and exit nonzero. The main build
owner/generator must copy that file unchanged to
`assets/data/discussions.json` before publishing. This script does **not** write
the public copy. Do not deploy a failed sync as a newly refreshed snapshot.

Importable API (imports have no network, filesystem-write or logging effects):

```js
import {
  buildSnapshot,
  createDiscussionSnapshot,
  syncDiscussions,
} from './scripts/sync-discussions.mjs';

// config is the parsed discussions-config.json:
const snapshot = await createDiscussionSnapshot(config);
// Fetches with GH_TOKEN/GITHUB_TOKEN; returns JSON-compatible data, no writes.
// Optional second argument: { token, fetchImpl } for injected credentials/tests.

// Alternatively, the CLI-equivalent reads config and writes content only:
// const snapshot = await syncDiscussions();

// Pure transform/validation for already-fetched GraphQL data:
// const snapshot = buildSnapshot(config, graphqlResponse.data);
```

Snapshot schema version 1 has:

```text
version, generatedAt
source: repository, repoId, categoryId, discussionNumber, discussionUrl
discussion:
  number, title, body, bodyTruncated, createdAt, updatedAt, publishedAt
  locked, closed, author: {login} | null, category: {name, slug}
  commentsTruncated, comments: [
    {body, bodyTruncated, createdAt, updatedAt, publishedAt,
     author: {login} | null, repliesTruncated, replies: [same entry shape]}
  ]
```

Reply entries have empty `replies` and `repliesTruncated: false`.
`generatedAt` is a UTC ISO timestamp, not the time the browser fetched the file.

## Main-owner integration still required

This change intentionally does **not** modify HTML, `main.js`, the generator,
workflow, or CSS. The module is not automatically mounted, and no live snapshot
is produced merely by adding these three files. The main owner must:

1. Create the real Discussion and config, run the sync, and copy the content
   snapshot into the public assets during each successful build.
2. Replace the old mailto discussion form and its misleading anonymity copy.
   Leaving them alongside this module still leaves that misleading UI in place.
   Email is a separate contact option: a mailto link only opens a draft, and
   sending it normally reveals the sender address to the recipient.
3. Add a dedicated container and initialize the ES module, for example:

   ```html
   <div id="discussion-mirror"
        data-discussion-url="https://github.com/yichen-kong/yichen-kong.github.io/discussions/123"></div>
   <script type="module">
     import { initDiscussion } from './js/discussion.js';
     const dispose = initDiscussion(document.querySelector('#discussion-mirror'));
     // Call dispose() when unmounting; repeated initialization is safe.
   </script>
   ```

   Replace `123` with the real number. The optional data attribute supplies a
   specific fallback when the JSON cannot load; without it, the module links to
   this repository's Discussions index. Also provide an ordinary HTML link for
   visitors with JavaScript disabled.
4. Serve over HTTP(S), not `file://`. The fetch path resolves relative to the
   module, supporting subdirectory deployments and ignoring page `<base>`.
   Cross-origin snapshots and redirects are rejected; no credentials are sent.
5. Verify both languages, empty/error/retry states, capped threads, locked
   discussions, malicious text, and deletion propagation after deployment.

## What is not implemented

- No browser-side write path, email form, anonymous posting, or local comment
  database.
- No additional paid discussion service is required: this uses static hosting
  and native public GitHub Discussions. Free service limits still apply; it is
  not unlimited hosting, availability or a regional SLA.
- No new server-side moderation or spam filter. Maintain/moderate the source
  Discussion using GitHub. Neither GitHub nor this mirror is guaranteed to be
  reachable in every region; native posting requires reaching GitHub.
- The mirror is not real-time. Re-run the sync after the Discussion changes.
- Comments/replies beyond the **first** page limits remain on GitHub, including
  newer replies beyond those limits. Removing content on GitHub does not erase
  older deployed snapshots, Git history or browser caches: re-sync/redeploy
  promptly after moderation, and remove retained copies separately if needed.
- No Supabase project, public write policy, user database, anonymous auth,
  CAPTCHA, or backend key is used or needed.

## Optional Giscus path

Giscus remains an optional future UI. It can provide an interactive GitHub
Discussions widget, but it still requires a public repository, enabled
Discussions, the Giscus app, and GitHub authorization for posting. It is not
anonymous, and it would add a third-party iframe/script dependency. This
read-mirror path is intentionally kept self-hosted and deterministic for now.
Enabling Discussions alone does **not** install Giscus.

To opt in later, authorize the Giscus GitHub App for the public repository,
configure the repository/category through giscus.app, and use its generated
real IDs. To attach to this **existing** discussion, choose discussion-number
mapping (`data-mapping="number"` and `data-term="<actual number>"`) rather than
pathname mapping that could create a separate discussion. The supplied General
category is usable; Announcements is a recommendation for restricting creation
of new auto-mapped threads, not a requirement for reading this one. Configure
the site language/theme and optionally restrict embedding origins via
`giscus.json`. Test GitHub authorization and keep a native fallback link.
No Giscus app installation or widget embedding is performed by these files.

Official references:

- [GitHub GraphQL API for Discussions](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- [GitHub Discussions reference](https://docs.github.com/en/graphql/reference/discussions)
- [GitHub GraphQL object schema](https://docs.github.com/en/graphql/reference/objects)
- [Fine-grained token permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- [Workflow token permissions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions)
- [Giscus configuration](https://giscus.app/)
- [Giscus advanced usage and origin restrictions](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)
