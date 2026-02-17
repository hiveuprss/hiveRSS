import { defineMiddleware } from 'astro:middleware';

/**
 * Legacy redirect middleware
 *
 * The old hiverss.com served RSS/XML at bare paths with no extension:
 *   /@username          → now an HTML author page
 *   /@username/blog     → now an HTML author page variant
 *   /community/name     → now an HTML community page
 *   /trending/tag       → now an HTML tag page
 *
 * Existing feed subscribers still request those paths. We detect them by
 * checking the Accept header: browsers always include "text/html", RSS
 * readers and feed aggregators almost never do. If the request doesn't
 * accept HTML, redirect to the equivalent .xml feed URL.
 */

const RSS_CATEGORIES = new Set(['trending', 'hot', 'created', 'new', 'promoted']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const accept = request.headers.get('accept') ?? '';

  // Browsers send text/html — let them through to the HTML page
  if (accept.includes('text/html')) {
    return next();
  }

  const url    = new URL(request.url);
  const origin = url.origin;
  const path   = url.pathname;
  const qs     = url.search;

  function xml(newPath: string) {
    return Response.redirect(`${origin}${newPath}${qs}`, 301);
  }

  // /@username  →  /@username.xml
  const userOnly = path.match(/^\/@([^/.]+)$/);
  if (userOnly) return xml(`/@${userOnly[1]}.xml`);

  // /@username/blog|feed|comments|votes  →  /@username/type.xml
  const userType = path.match(/^\/@([^/.]+)\/(blog|feed|comments|votes)$/);
  if (userType) return xml(`/@${userType[1]}/${userType[2]}.xml`);

  // /community/name  →  /community/name.xml
  const community = path.match(/^\/community\/([^/.]+)$/);
  if (community) return xml(`/community/${community[1]}.xml`);

  // /trending|hot|created|new|promoted/tag  →  /category/tag.xml
  const tagPath = path.match(/^\/([^/.]+)\/([^/.]+)$/);
  if (tagPath && RSS_CATEGORIES.has(tagPath[1])) return xml(`/${tagPath[1]}/${tagPath[2]}.xml`);

  return next();
});
