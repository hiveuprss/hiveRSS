// /@username → defaults to blog feed
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getUserPosts, getAccountProfileImage, filterByTag } from '../lib/hive';
import { makeAuthorUrl } from '../lib/interfaces';
import { getInterface, getLimit, getTagFilter, getRefer } from '../lib/params';
import { postToItem } from '../lib/content';
import { FEED_BASE, FEED_XMLNS, channelExtras, selfUrl } from '../lib/feed';

export const GET: APIRoute = async ({ params, request }) => {
  const { username } = params;
  const url = new URL(request.url);
  const iface = getInterface(url);
  const limit = getLimit(url);
  const tagFilter = getTagFilter(url);
  const refer = getRefer(url);

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  try {
    const [posts, profileImage] = await Promise.all([
      getUserPosts(username, 'blog', limit),
      getAccountProfileImage(username),
    ]);

    const filtered = filterByTag(posts, tagFilter);

    return rss({
      title: `Posts from @${username}`,
      description: `RSS feed for @${username}'s blog on Hive`,
      site: FEED_BASE,
      items: filtered.map(post => postToItem(post, iface, refer)),
      customData: channelExtras({
        self: selfUrl(url),
        image: { url: profileImage, title: `@${username}`, link: makeAuthorUrl(username, 'blog', iface, refer) },
      }),
      xmlns: FEED_XMLNS,
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
