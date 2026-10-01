import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { HivePost } from './hive';
import { itemCreator } from './feed';
import { getInterfaceBase, makeFeedItemUrl } from './interfaces';

/** Max characters of post markdown rendered into <content:encoded>. */
export const MAX_BODY_CHARS = 5000;
/** Max characters of the plain-text <description> summary. */
export const MAX_SUMMARY_CHARS = 300;

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'img', 'h1', 'h2', 'center', 'del', 'ins', 'u', 'sup', 'sub', 'details', 'summary', 'figure', 'figcaption',
];

/** Cut markdown at a paragraph (or word) boundary and close any open code fence. */
function truncateMarkdown(body: string, max: number): { text: string; truncated: boolean } {
  if (body.length <= max) return { text: body, truncated: false };

  let slice = body.slice(0, max);
  let cut = slice.lastIndexOf('\n\n');
  if (cut < max * 0.6) cut = slice.lastIndexOf(' ');
  if (cut > 0) slice = slice.slice(0, cut);

  const fences = slice.match(/^```/gm)?.length ?? 0;
  if (fences % 2 === 1) slice += '\n```';

  return { text: slice, truncated: true };
}

function renderHtml(markdown: string, base: string): string {
  const html = marked.parse(markdown, { gfm: true, breaks: true, async: false }) as string;
  const absolutize = (tag: 'a' | 'img', attr: 'href' | 'src') =>
    (tagName: string, attribs: Record<string, string>) => {
      const v = attribs[attr];
      if (v && v.startsWith('/') && !v.startsWith('//')) attribs[attr] = `${base}${v}`;
      return { tagName, attribs };
    };

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: absolutize('a', 'href'),
      img: absolutize('img', 'src'),
    },
  });
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function summarize(html: string, max: number): string {
  const text = decodeEntities(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return `${text.slice(0, cut > max * 0.6 ? cut : max)}…`;
}

/** Build an RSS item (title, link, date, creator, summary and full-ish content) for a post. */
export function postToItem(post: HivePost, iface?: string, refer?: string) {
  const link = makeFeedItemUrl(post.url, iface, refer);
  const base = getInterfaceBase(iface);
  const { text, truncated } = truncateMarkdown(post.body ?? '', MAX_BODY_CHARS);

  let content = renderHtml(text, base);
  if (truncated) {
    content += `<p><a href="${link.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Read the full post</a></p>`;
  }

  return {
    title: post.title || `@${post.author}/${post.permlink}`,
    link,
    pubDate: new Date(post.created),
    categories: [post.category],
    description: summarize(content, MAX_SUMMARY_CHARS) || undefined,
    content,
    customData: itemCreator(post.author),
  };
}
