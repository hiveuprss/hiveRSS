import { defineMiddleware } from 'astro:middleware';

const PUBLIC_SITE = 'https://hiverss.com';

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

const APEX_HOST = 'hiverss.com';

/** Params that do not change page content; drop them so one URL maps to the canonical. */
const TRACKING_QUERY_KEYS = [
  'ref',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

function stripTrackingParams(search: string): string {
  const params = new URLSearchParams(search);
  for (const key of TRACKING_QUERY_KEYS) {
    params.delete(key);
  }
  const out = params.toString();
  return out ? `?${out}` : '';
}

/**
 * One public origin: https://hiverss.com (no www, no http).
 * Fixes GSC "Alternate page with proper canonical" for duplicate host/protocol/query URLs.
 */
function canonicalOriginRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = (forwardedHost ?? request.headers.get('host') ?? url.hostname)
    .split(':')[0]
    .toLowerCase();
  const proto = (forwardedProto ?? url.protocol.replace(':', '')).toLowerCase();

  if (host !== APEX_HOST && host !== `www.${APEX_HOST}`) {
    return null;
  }

  const cleanSearch = stripTrackingParams(url.search);
  const wrongHost = host !== APEX_HOST;
  const wrongProto = proto !== 'https';
  const wrongQs = url.search !== cleanSearch;

  if (!wrongHost && !wrongProto && !wrongQs) {
    return null;
  }

  const target = `https://${APEX_HOST}${url.pathname}${cleanSearch}`;
  return Response.redirect(target, 301);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;

  const originRedirect = canonicalOriginRedirect(request);
  if (originRedirect) {
    return originRedirect;
  }

  const accept = request.headers.get('accept') ?? '';

  const url  = new URL(request.url);
  const path = url.pathname;
  const qs   = url.search;

  // Use hardcoded origin — behind Heroku's reverse proxy, url.origin
  // resolves to http://localhost rather than the public domain.
  function redirect(locationPath: string) {
    return Response.redirect(`${PUBLIC_SITE}${locationPath}${qs}`, 301);
  }

  // ── SEO: one URL for "new" tag feeds (API treats new === created) ──
  const newTag = path.match(/^\/new\/([^/.]+)(\.xml)?$/);
  if (newTag) {
    const tag = newTag[1];
    const hasXml = Boolean(newTag[2]);
    if (hasXml || !accept.includes('text/html')) {
      return redirect(`/created/${tag}.xml`);
    }
    return redirect(`/created/${tag}`);
  }

  // ── SEO: Hive account names are lowercase — avoid duplicate /@Mixed URLs ──
  const userOnly = path.match(/^\/@([^/.]+)$/);
  if (userOnly) {
    const u = userOnly[1];
    const lower = u.toLowerCase();
    if (u !== lower) {
      if (!accept.includes('text/html')) return redirect(`/@${lower}.xml`);
      return redirect(`/@${lower}`);
    }
  }

  const userType = path.match(/^\/@([^/.]+)\/(blog|feed|comments|votes)(\.xml)?$/);
  if (userType) {
    const u = userType[1];
    const lower = u.toLowerCase();
    const t = userType[2];
    const xmlExt = userType[3] || '';
    if (u !== lower) {
      if (!accept.includes('text/html')) return redirect(`/@${lower}/${t}.xml`);
      return redirect(`/@${lower}/${t}${xmlExt}`);
    }
  }

  // Browsers send text/html — let them through to the HTML page
  if (accept.includes('text/html')) {
    return next();
  }

  // /@username  →  /@username.xml
  const userBare = path.match(/^\/@([^/.]+)$/);
  if (userBare) return redirect(`/@${userBare[1]}.xml`);

  // /@username/blog|feed|comments|votes  →  /@username/type.xml
  const userTypeBare = path.match(/^\/@([^/.]+)\/(blog|feed|comments|votes)$/);
  if (userTypeBare) return redirect(`/@${userTypeBare[1]}/${userTypeBare[2]}.xml`);

  // /community/name  →  /community/name.xml
  const community = path.match(/^\/community\/([^/.]+)$/);
  if (community) return redirect(`/community/${community[1]}.xml`);

  // /trending|hot|created|new|promoted/tag  →  /category/tag.xml
  const tagPath = path.match(/^\/([^/.]+)\/([^/.]+)$/);
  if (tagPath && RSS_CATEGORIES.has(tagPath[1])) {
    return redirect(`/${tagPath[1]}/${tagPath[2]}.xml`);
  }

  return next();
});
