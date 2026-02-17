// /@username → defaults to blog feed
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getUserPosts, getAccountProfileImage, filterByTag } from '../lib/hive';
import { makeFeedItemUrl, makeAuthorUrl } from '../lib/interfaces';
import { getInterface, getLimit, getTagFilter, getRefer } from '../lib/params';

const FEED_BASE = 'https://hiverss.com';

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
      items: filtered.map(post => ({
        title: post.title || `@${post.author}/${post.permlink}`,
        link: makeFeedItemUrl(post.url, iface, refer),
        author: post.author,
        pubDate: new Date(post.created),
        categories: [post.category],
      })),
      customData: [
        `<image><url>${profileImage}</url><title>@${username}</title><link>${makeAuthorUrl(username, 'blog', iface, refer)}</link></image>`,
        `<feed_url>${FEED_BASE}/@${username}</feed_url>`,
      ].join(''),
      xmlns: {
        podcast: 'https://podcastindex.org/namespace/1.0',
      },
    });
  } catch (err: any) {
    return new Response(err?.message ?? 'Internal server error', { status: err?.status ?? 500 });
  }
};
