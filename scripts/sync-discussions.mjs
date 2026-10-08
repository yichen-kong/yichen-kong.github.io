import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = resolve(ROOT, 'content/discussions-config.json');
const CONTENT_PATH = resolve(ROOT, 'content/discussions.json');
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const ROOT_COMMENT_LIMIT = 50;
const REPLY_LIMIT = 10;

const DISCUSSION_QUERY = `
  query DiscussionSnapshot(
    $owner: String!
    $name: String!
    $number: Int!
    $rootLimit: Int!
    $replyLimit: Int!
  ) {
    repository(owner: $owner, name: $name) {
      id
      nameWithOwner
      isPrivate
      discussion(number: $number) {
        number
        title
        url
        bodyText
        createdAt
        updatedAt
        publishedAt
        locked
        closed
        author {
          login
        }
        category {
          id
          name
          slug
        }
        comments(first: $rootLimit) {
          pageInfo { hasNextPage }
          nodes {
            bodyText
            createdAt
            updatedAt
            publishedAt
            deletedAt
            isMinimized
            author {
              login
            }
            replies(first: $replyLimit) {
              pageInfo { hasNextPage }
              nodes {
                bodyText
                createdAt
                updatedAt
                publishedAt
                deletedAt
                isMinimized
                author {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
`;

function fail(message) {
  throw new Error(message);
}

function redactEmails(value) {
  return String(value ?? '')
    .replace(/[^\s<>()[\]{}"'`,;:]+@[^\s<>()[\]{}"'`,;:]+/gu, '[email removed]')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function text(value, maxLength = 20000) {
  return redactEmails(value).trim().slice(0, maxLength);
}

function parseRepository(value) {
  const match = String(value ?? '').match(/^([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!match) fail('content/discussions-config.json: repository must be "owner/name".');
  return { owner: match[1], name: match[2] };
}

function validateConfig(config) {
  if (!config || typeof config !== 'object') fail('Invalid discussion configuration.');
  const repository = parseRepository(config.repository);
  if (!/^R_[A-Za-z0-9_-]+$/.test(config.repoId)) fail('discussions-config.json: repoId is required.');
  if (!/^DIC_[A-Za-z0-9_-]+$/.test(config.categoryId)) {
    fail('discussions-config.json: categoryId is required.');
  }
  if (!Number.isInteger(config.discussionNumber) || config.discussionNumber < 1 || config.discussionNumber > 2147483647) {
    fail('discussions-config.json: discussionNumber must be a positive integer.');
  }
  if (config.discussionUrl !== `https://github.com/${config.repository}/discussions/${config.discussionNumber}`) {
    fail('discussions-config.json: discussionUrl must be the canonical GitHub URL for this discussion.');
  }
  return { ...config, ...repository };
}

async function githubRequest(token, variables, fetchImpl) {
  const response = await fetchImpl(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'yichen-kong-discussion-sync',
    },
    body: JSON.stringify({ query: DISCUSSION_QUERY, variables }),
    signal: AbortSignal.timeout(30000),
    redirect: 'error',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) fail(`GitHub GraphQL request failed with HTTP ${response.status}.`);
  if (payload.errors?.length) {
    // Never log remote error text: it may contain credentials or user content.
    fail('GitHub GraphQL returned errors; check token permissions and discussion configuration.');
  }
  return payload.data;
}

function mapAuthor(author) {
  if (typeof author?.login !== 'string' || !/^[A-Za-z0-9_-]+(?:\[bot\])?$/.test(author.login)) return null;
  return { login: author.login.slice(0, 100) };
}

function date(value) {
  const parsed = typeof value === 'string' ? new Date(value) : null;
  return parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function mapComment(comment, reply = false) {
  if (!comment || comment.isMinimized || comment.deletedAt || !date(comment.publishedAt)) return null;
  return {
    body: text(comment.bodyText),
    bodyTruncated: redactEmails(comment.bodyText).trim().length > 20000,
    createdAt: date(comment.createdAt),
    updatedAt: date(comment.updatedAt),
    publishedAt: date(comment.publishedAt),
    author: mapAuthor(comment.author),
    repliesTruncated: !reply && Boolean(comment.replies?.pageInfo?.hasNextPage || comment.replies?.nodes?.length > REPLY_LIMIT),
    replies: reply ? [] : (comment.replies?.nodes ?? []).slice(0, REPLY_LIMIT).map(node => mapComment(node, true)).filter(Boolean),
  };
}

export function buildSnapshot(config, data) {
  config = validateConfig(config);
  const repository = data?.repository;
  const discussion = repository?.discussion;
  if (!repository || !discussion) fail('The configured GitHub Discussion was not found.');
  if (!date(discussion.publishedAt)) fail('Only published discussions may be mirrored.');
  if (repository.isPrivate !== false) fail('Only public repositories may be mirrored.');
  if (repository.nameWithOwner?.toLowerCase() !== config.repository.toLowerCase()) fail('Repository name mismatch.');
  if (repository.id !== config.repoId) fail('Configured repoId does not match the GitHub repository.');
  if (discussion.category?.id !== config.categoryId) {
    fail('Configured categoryId does not match the GitHub Discussion category.');
  }
  if (discussion.number !== config.discussionNumber) {
    fail('Configured discussionNumber does not match the returned Discussion.');
  }
  if (discussion.url?.toLowerCase() !== config.discussionUrl.toLowerCase()) fail('Discussion URL mismatch.');

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      repository: config.repository,
      repoId: config.repoId,
      categoryId: config.categoryId,
      discussionNumber: config.discussionNumber,
      discussionUrl: config.discussionUrl,
    },
    discussion: {
      number: discussion.number,
      title: text(discussion.title, 500),
      body: text(discussion.bodyText),
      bodyTruncated: redactEmails(discussion.bodyText).trim().length > 20000,
      createdAt: date(discussion.createdAt),
      updatedAt: date(discussion.updatedAt),
      publishedAt: date(discussion.publishedAt),
      locked: Boolean(discussion.locked),
      closed: Boolean(discussion.closed),
      author: mapAuthor(discussion.author),
      category: {
        name: text(discussion.category?.name, 120),
        slug: text(discussion.category?.slug, 120),
      },
      commentsTruncated: Boolean(discussion.comments?.pageInfo?.hasNextPage || discussion.comments?.nodes?.length > ROOT_COMMENT_LIMIT),
      comments: (discussion.comments?.nodes ?? []).slice(0, ROOT_COMMENT_LIMIT).map(node => mapComment(node)).filter(Boolean),
    },
  };
}

// Import-safe: fetch and build a snapshot without writing files or logging.
export async function createDiscussionSnapshot(config, {
  token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
  fetchImpl = globalThis.fetch,
} = {}) {
  config = validateConfig(config);
  if (!token) fail('Set GH_TOKEN or GITHUB_TOKEN before running the discussion sync.');
  const data = await githubRequest(token, {
    owner: config.owner,
    name: config.name,
    number: config.discussionNumber,
    rootLimit: ROOT_COMMENT_LIMIT,
    replyLimit: REPLY_LIMIT,
  }, fetchImpl);
  return buildSnapshot(config, data);
}

export async function syncDiscussions() {
  let config;
  try {
    config = validateConfig(JSON.parse(await readFile(CONFIG_PATH, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail('Missing content/discussions-config.json. Create it before running the sync.');
    }
    fail('Unable to read a valid content/discussions-config.json.');
  }

  const snapshot = await createDiscussionSnapshot(config);
  const output = `${JSON.stringify(snapshot, null, 2)}\n`;

  await mkdir(dirname(CONTENT_PATH), { recursive: true });
  const temporaryPath = `${CONTENT_PATH}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, output, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, CONTENT_PATH);
  } finally {
    await rm(temporaryPath, { force: true });
  }
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  syncDiscussions()
    .then(snapshot => {
      const comments = snapshot.discussion.comments.length;
      const replies = snapshot.discussion.comments.reduce((count, comment) => count + comment.replies.length, 0);
      console.log(`Discussion snapshot written: ${comments} root comments, ${replies} replies.`);
    })
    .catch(() => {
      console.error('Discussion sync failed. Check configuration, token permissions, network and filesystem access. Existing snapshot was not replaced unless the sync succeeded.');
      process.exitCode = 1;
    });
}
