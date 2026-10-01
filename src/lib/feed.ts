export const FEED_BASE = 'https://hiverss.com';
export const DEFAULT_IMAGE = `${FEED_BASE}/hive_logo.png`;

/** Namespaces used by the extra channel/item elements below. */
export const FEED_XMLNS = {
  atom: 'http://www.w3.org/2005/Atom',
  dc: 'http://purl.org/dc/elements/1.1/',
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Only allow http(s) image URLs; profile metadata is user-controlled. */
export function safeImageUrl(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_IMAGE;
  try {
    const u = new URL(raw.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
}

/** Absolute URL of the feed being served, for <atom:link rel="self">. */
export function selfUrl(requestUrl: URL): string {
  return `${FEED_BASE}${requestUrl.pathname}${requestUrl.search}`;
}

/** Channel-level extras: atom:link rel="self" and an optional <image>. */
export function channelExtras(opts: {
  self: string;
  image?: { url: string; title: string; link: string };
}): string {
  const parts = [
    `<atom:link href="${escapeXml(opts.self)}" rel="self" type="application/rss+xml"/>`,
  ];
  if (opts.image) {
    const { url, title, link } = opts.image;
    parts.push(
      `<image><url>${escapeXml(safeImageUrl(url))}</url><title>${escapeXml(title)}</title><link>${escapeXml(link)}</link></image>`,
    );
  }
  return parts.join('');
}

/** Item author as <dc:creator> (RSS <author> must be an email address). */
export function itemCreator(author: string): string {
  return `<dc:creator>${escapeXml(author)}</dc:creator>`;
}
