// /community/hive-167922.xml → community RSS feed
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getCommunityPosts, filterByTag } from '../../lib/hive';
import { getInterface, getLimit, getTagFilter, getRefer } from '../../lib/params';
import { postToItem } from '../../lib/content';
import { FEED_BASE, FEED_XMLNS, DEFAULT_IMAGE, channelExtras, selfUrl } from '../../lib/feed';

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
      items: filtered.map(post => postToItem(post, iface, refer)),
      customData: channelExtras({
        self: selfUrl(url),
        image: { url: DEFAULT_IMAGE, title: name, link: `https://peakd.com/c/${encodeURIComponent(name)}` },
      }),
      xmlns: FEED_XMLNS,
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
