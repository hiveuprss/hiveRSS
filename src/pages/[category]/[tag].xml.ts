// /trending/photography, /hot/hive, /created/travel etc.
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getTopicPosts, filterByTag } from '../../lib/hive';
import { getInterface, getLimit, getTagFilter, getRefer } from '../../lib/params';
import { postToItem } from '../../lib/content';
import { FEED_BASE, FEED_XMLNS, DEFAULT_IMAGE, channelExtras, selfUrl } from '../../lib/feed';

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
    const title = `${category} #${tag} posts on Hive`;

    return rss({
      title,
      description: `RSS feed for ${category} posts tagged #${tag} on the Hive blockchain`,
      site: FEED_BASE,
      items: filtered.map(post => postToItem(post, iface, refer)),
      customData: channelExtras({ self: selfUrl(url), title, imageUrl: DEFAULT_IMAGE }),
      xmlns: FEED_XMLNS,
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
