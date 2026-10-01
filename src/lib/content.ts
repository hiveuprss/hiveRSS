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

/**
 * Hive posts often use `<a id="x"/>` as jump targets. HTML5 treats that as an
 * open `<a>`, so later links nest and feed validators complain. Rewrite those
 * to spans before markdown runs.
 */
function normalizeHiveHtml(markdown: string): string {
  return markdown
    .replace(/<a(\s+[^>]*?)?\s*\/>/gi, '<span$1></span>')
    .replace(/<a(\s+[^>]*?)?\s*>\s*<\/a>/gi, '<span$1></span>');
}

function renderHtml(markdown: string, base: string): string {
  const html = marked.parse(normalizeHiveHtml(markdown), { gfm: true, breaks: true, async: false }) as string;

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      span: ['id'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => {
        // Any leftover href-less <a> (fragment targets) must not stay as <a>.
        if (!attribs.href) {
          const spanAttribs: Record<string, string> = {};
          if (attribs.id) spanAttribs.id = attribs.id;
          return { tagName: 'span', attribs: spanAttribs };
        }
        const href = attribs.href.startsWith('/') && !attribs.href.startsWith('//')
          ? `${base}${attribs.href}`
          : attribs.href;
        const aAttribs: Record<string, string> = { href };
        if (attribs.title) aAttribs.title = attribs.title;
        return { tagName: 'a', attribs: aAttribs };
      },
      img: (_tagName, attribs) => {
        const out: Record<string, string> = {};
        if (attribs.src) {
          out.src = attribs.src.startsWith('/') && !attribs.src.startsWith('//')
            ? `${base}${attribs.src}`
            : attribs.src;
        }
        for (const k of ['alt', 'title', 'width', 'height'] as const) {
          if (attribs[k]) out[k] = attribs[k];
        }
        return { tagName: 'img', attribs: out };
      },
    },
  });
}

/** Close dangling <a> tags so a trailing "read more" link cannot nest. */
function closeOpenAnchors(html: string): string {
  const opens = (html.match(/<a\b/gi) ?? []).length;
  const closes = (html.match(/<\/a>/gi) ?? []).length;
  return opens > closes ? html + '</a>'.repeat(opens - closes) : html;
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

  let content = closeOpenAnchors(renderHtml(text, base));
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
