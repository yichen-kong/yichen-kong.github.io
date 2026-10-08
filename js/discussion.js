const SNAPSHOT_URL = new URL('../assets/data/discussions.json', import.meta.url);
const REPOSITORY = 'yichen-kong/yichen-kong.github.io';
const DISCUSSIONS_URL = `https://github.com/${REPOSITORY}/discussions`;
const instances = new WeakMap();
const COPY = {
  zh: {
    heading: '最近留言',
    post: '在 GitHub 查看并留言（需登录） ↗',
    browse: '前往 GitHub Discussions（发帖需登录） ↗',
    loading: '正在加载公开讨论镜像……',
    error: '讨论镜像暂时无法加载。可通过下方链接查看 GitHub 原始讨论。',
    retry: '重新加载镜像',
    empty: '暂无留言。',
    unknown: '作者信息不可用',
    noBody: '（无文字内容）',
    synced: '同步于',
    notes: '同步与隐私说明',
    original: '原始讨论正文（原文）',
    dates: '日期采用您的设备本地时区。',
    stale: '这是静态快照，不会实时更新；编辑、删除和审核结果会在下次同步部署后反映。',
    limits: '最多展示前 50 条根评论、每条前 10 条回复；完整讨论请见 GitHub。',
    privacy: '阅读无需登录；留言需登录 GitHub，用户名及内容公开。镜像不复制邮箱字段，并遮盖常见邮箱格式；这不是匿名或隐私保证。',
    capped: '此快照因数量或正文长度限制而省略了部分内容。',
    restricted: '同步时讨论已关闭或锁定。',
  },
  en: {
    heading: 'Recent comments',
    post: 'View and comment on GitHub (sign-in required) ↗',
    browse: 'View discussions on GitHub (sign in to post) ↗',
    loading: 'Loading the public discussion mirror…',
    error: 'The discussion mirror is temporarily unavailable. Use the link below to view the original discussion on GitHub.',
    retry: 'Reload mirror',
    empty: 'No comments yet.',
    unknown: 'Author unavailable',
    noBody: '(no text content)',
    synced: 'Synced',
    notes: 'Sync & privacy notes',
    original: 'Original discussion body',
    dates: 'Dates use your device’s local timezone.',
    stale: 'This is a static snapshot, not a live feed; edits, deletions and moderation appear after the next successful sync and deployment.',
    limits: 'Shows at most the first 50 root comments and 10 replies each; see GitHub for the complete discussion.',
    privacy: 'Reading needs no login; posting requires GitHub sign-in and exposes your username and message publicly. Email fields are omitted and common email patterns masked; this is not an anonymity or privacy guarantee.',
    capped: 'Some content is omitted because of count or text-length limits.',
    restricted: 'The discussion was closed or locked at sync time.',
  },
};

function language() {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function githubUrl(value) {
  try {
    const url = new URL(value);
    const path = `/yichen-kong/yichen-kong.github.io/discussions`;
    if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash) return null;
    const suffix = url.pathname.slice(path.length);
    return url.pathname.startsWith(path) && /^\/[1-9]\d*$/.test(suffix) ? url.href : null;
  } catch {
    return null;
  }
}

function externalLink(url, text) {
  const link = element('a', text, 'discussion-github-link');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function dateNode(value, lang) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const time = element('time', new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date));
  time.dateTime = date.toISOString();
  return time;
}

function syncDateNode(value, lang) {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const time = element('time', new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
    dateStyle: 'medium',
  }).format(date));
  time.dateTime = date.toISOString();
  return time;
}

function meta(author, createdAt, lang) {
  const node = element('p', undefined, 'discussion-meta');
  node.append(element('span', author?.login || COPY[lang].unknown));
  const time = dateNode(createdAt, lang);
  if (time) node.append(document.createTextNode(' · '), time);
  return node;
}

function bodyNode(body, lang) {
  const node = element('p', body || COPY[lang].noBody, 'discussion-comment-body');
  // Preserve plain-text formatting without requiring changes to the site's CSS.
  node.style.whiteSpace = 'pre-wrap';
  node.style.overflowWrap = 'anywhere';
  return node;
}

function validSnapshot(snapshot) {
  const source = snapshot?.source;
  if (snapshot?.version !== 1 || source?.repository !== REPOSITORY ||
      !Number.isSafeInteger(source.discussionNumber) || source.discussionNumber < 1 ||
      githubUrl(source.discussionUrl) !== `${DISCUSSIONS_URL}/${source.discussionNumber}` ||
      typeof snapshot?.discussion?.title !== 'string' ||
      snapshot.discussion.title.length > 500 ||
      snapshot.discussion.number !== source.discussionNumber ||
      !Array.isArray(snapshot.discussion.comments) || snapshot.discussion.comments.length > 50 ||
      !dateNode(snapshot.generatedAt, 'en')) return false;
  const validEntry = entry => entry && typeof entry.body === 'string' &&
    entry.body.length <= 20000 &&
    (entry.author == null || (typeof entry.author.login === 'string' && entry.author.login.length <= 100 &&
      /^[A-Za-z0-9_-]+(?:\[bot\])?$/.test(entry.author.login)));
  return validEntry(snapshot.discussion) && snapshot.discussion.comments.every(comment =>
    validEntry(comment) && Array.isArray(comment.replies) && comment.replies.length <= 10 &&
    comment.replies.every(validEntry));
}

function commentNode(comment, lang, reply = false) {
  const article = element('article', undefined, reply ? 'discussion-comment discussion-reply' : 'discussion-comment');
  article.append(meta(comment.author, comment.createdAt, lang), bodyNode(comment.body, lang));
  if (!reply && comment.replies.length) {
    const replies = element('div', undefined, 'discussion-replies');
    replies.style.marginInlineStart = '1.25rem';
    comment.replies.forEach(item => replies.append(commentNode(item, lang, true)));
    article.append(replies);
  }
  return article;
}

function notesNode(discussion, snapshot, lang) {
  const notes = document.createElement('details');
  notes.className = 'discussion-notes';
  const summary = element('summary', COPY[lang].notes);
  notes.append(summary);

  const original = element('div', undefined, 'discussion-original');
  original.append(element('h4', COPY[lang].original), element('p', discussion.title, 'discussion-original-title'));
  original.append(bodyNode(discussion.body, lang));
  notes.append(original);

  const syncNotes = element('div', undefined, 'discussion-note-copy');
  const syncTime = element('p', `${COPY[lang].synced} `);
  const syncDate = syncDateNode(snapshot.generatedAt, lang);
  if (syncDate) syncTime.append(syncDate);
  syncNotes.append(
    syncTime,
    element('p', COPY[lang].dates),
    element('p', COPY[lang].stale),
    element('p', COPY[lang].limits),
    element('p', COPY[lang].privacy),
  );
  if (discussion.locked || discussion.closed) syncNotes.append(element('p', COPY[lang].restricted));
  if (discussion.bodyTruncated || discussion.commentsTruncated ||
      discussion.comments.some(comment => comment.repliesTruncated || comment.bodyTruncated ||
        comment.replies.some(reply => reply.bodyTruncated))) {
    syncNotes.append(element('p', COPY[lang].capped));
  }
  notes.append(syncNotes);
  return notes;
}

/**
 * Mount a read-only mirror. Returns a cleanup function; safe to reinitialize.
 * Optional data-discussion-url provides the specific GitHub link even offline.
 */
export function initDiscussion(container) {
  if (!container) return () => {};
  instances.get(container)?.();
  let snapshot;
  let state = 'loading';
  let disposed = false;
  let controller;
  let requestId = 0;
  const fallbackUrl = githubUrl(container.dataset.discussionUrl) || DISCUSSIONS_URL;

  function render() {
    if (disposed) return;
    const lang = language();
    const copy = COPY[lang];
    const content = document.createDocumentFragment();
    content.append(element('h3', copy.heading));
    const url = snapshot?.source.discussionUrl || fallbackUrl;
    if (state !== 'ready') {
      const status = element('p', state === 'loading' ? copy.loading : copy.error, 'discussion-status');
      status.setAttribute('role', 'status');
      content.append(status, externalLink(url, url === DISCUSSIONS_URL ? copy.browse : copy.post));
      if (state === 'error') {
        const retry = element('button', copy.retry);
        retry.type = 'button';
        retry.addEventListener('click', load);
        content.append(retry);
      }
    } else {
      const discussion = snapshot.discussion;
      const synced = element('p', `${copy.synced} `, 'discussion-sync-time');
      synced.append(syncDateNode(snapshot.generatedAt, lang));
      content.append(synced);
      if (!discussion.comments.length) content.append(element('p', copy.empty, 'discussion-status'));
      discussion.comments.forEach(comment => content.append(commentNode(comment, lang)));
      content.append(externalLink(url, copy.post), notesNode(discussion, snapshot, lang));
    }
    container.setAttribute('aria-busy', String(state === 'loading'));
    container.replaceChildren(content);
  }

  async function load() {
    controller?.abort();
    controller = new AbortController();
    const id = ++requestId;
    const activeController = controller;
    const timeout = setTimeout(() => activeController.abort(), 15000);
    state = 'loading';
    render();
    try {
      // Resolve relative to this module, not the current page or an HTML <base>.
      if (SNAPSHOT_URL.origin !== location.origin) throw new Error('Cross-origin mirror');
      const response = await fetch(SNAPSHOT_URL, {
        cache: 'no-store', credentials: 'omit', mode: 'same-origin',
        redirect: 'error', signal: controller.signal,
      });
      if (!response.ok) throw new Error('Snapshot unavailable');
      const data = await response.json();
      if (!validSnapshot(data)) throw new Error('Invalid snapshot');
      if (disposed || id !== requestId) return;
      snapshot = data;
      state = 'ready';
    } catch {
      if (disposed || id !== requestId) return;
      state = 'error';
    } finally {
      clearTimeout(timeout);
    }
    render();
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    controller?.abort();
    document.removeEventListener('languagechange', render);
    instances.delete(container);
    container.removeAttribute('aria-busy');
  }

  instances.set(container, cleanup);
  document.addEventListener('languagechange', render);
  void load();
  return cleanup;
}
