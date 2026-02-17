// /community/hive-167922.xml → community RSS feed
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getCommunityPosts, filterByTag } from '../../lib/hive';
import { makeFeedItemUrl } from '../../lib/interfaces';
import { getInterface, getLimit, getTagFilter, getRefer } from '../../lib/params';

const FEED_BASE = 'https://hiverss.com';

export const GET: APIRoute = async ({ params, request }) => {
  const { name } = params;
  const url = new URL(request.url);
  const iface = getInterface(url);
  const limit = getLimit(url);
  const tagFilter = getTagFilter(url);
  const refer = getRefer(url);

  if (!name) {
    return new Response('Missing community name', { status: 400 });
  }

  try {
    const posts = await getCommunityPosts(name, limit);
    const filtered = filterByTag(posts, tagFilter);

    return rss({
      title: `${name} community on Hive`,
      description: `RSS feed for the ${name} community on the Hive blockchain`,
      site: FEED_BASE,
      items: filtered.map((post: any) => ({
        title: post.title || `@${post.author}/${post.permlink}`,
        link: makeFeedItemUrl(post.url, iface, refer),
        author: post.author,
        pubDate: new Date(post.created),
        categories: [post.category],
      })),
      customData: `<image><url>https://hiverss.com/hive_logo.png</url><title>${name}</title><link>https://peakd.com/c/${name}</link></image><feed_url>${FEED_BASE}/community/${name}.xml</feed_url>`,
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
