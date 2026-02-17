// /trending/photography, /hot/hive, /created/travel etc.
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getTopicPosts, filterByTag } from '../../lib/hive';
import { makeFeedItemUrl, makeTagUrl } from '../../lib/interfaces';
import { getInterface, getLimit, getTagFilter, getRefer } from '../../lib/params';

const FEED_BASE = 'https://hiverss.com';

export const GET: APIRoute = async ({ params, request }) => {
  const { category, tag } = params;
  const url = new URL(request.url);
  const iface = getInterface(url);
  const limit = getLimit(url);
  const tagFilter = getTagFilter(url);
  const refer = getRefer(url);

  if (!category || !tag) {
    return new Response('Missing parameters', { status: 400 });
  }

  try {
    const posts = await getTopicPosts(category, tag, limit);
    const filtered = filterByTag(posts, tagFilter);

    return rss({
      title: `${category} #${tag} posts on Hive`,
      description: `RSS feed for ${category} posts tagged #${tag} on the Hive blockchain`,
      site: FEED_BASE,
      items: filtered.map(post => ({
        title: post.title || `@${post.author}/${post.permlink}`,
        link: makeFeedItemUrl(post.url, iface, refer),
        author: post.author,
        pubDate: new Date(post.created),
        categories: [post.category],
      })),
      customData: `<image><url>https://hiverss.com/hive_logo.png</url><title>HiveRSS</title><link>${makeTagUrl(category, tag, iface, refer)}</link></image>`,
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
