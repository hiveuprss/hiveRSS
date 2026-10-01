import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getUserPosts, getUserVotes, getAccountProfileImage, filterByTag } from '../../lib/hive';
import { makeFeedItemUrl, makeAuthorUrl } from '../../lib/interfaces';
import { getInterface, getLimit, getMinVotePct, getTagFilter, getRefer } from '../../lib/params';
import { postToItem } from '../../lib/content';
import { FEED_BASE, FEED_XMLNS, channelExtras, selfUrl } from '../../lib/feed';

export const GET: APIRoute = async ({ params, request }) => {
  const { username, type } = params;
  const url = new URL(request.url);
  const iface = getInterface(url);
  const limit = getLimit(url);
  const minVotePct = getMinVotePct(url);
  const tagFilter = getTagFilter(url);
  const refer = getRefer(url);

  if (!username || !type) {
    return new Response('Missing parameters', { status: 400 });
  }

  try {
    if (type === 'votes') {
      const votes = await getUserVotes(username, limit, minVotePct);

      return rss({
        title: `Hive posts voted by @${username}`,
        description: `RSS feed of posts curated by @${username} on Hive`,
        site: FEED_BASE,
        items: votes.map(v => ({
          title: `@${v.author}/${v.permlink}`,
          link: makeFeedItemUrl(`/@${v.author}/${v.permlink}`, iface, refer),
          pubDate: new Date(v.date),
          description: `Vote weight: ${v.vote_percent.toFixed(2)}%`,
        })),
        customData: channelExtras({ self: selfUrl(url) }),
        xmlns: FEED_XMLNS,
      });
    }

    const validTypes: Record<string, boolean> = { blog: true, feed: true, comments: true };
    if (!validTypes[type]) {
      return new Response(`Unknown feed type: ${type}`, { status: 400 });
    }

    const [posts, profileImage] = await Promise.all([
      getUserPosts(username, type, limit),
      getAccountProfileImage(username),
    ]);

    const filtered = filterByTag(posts, tagFilter);

    return rss({
      title: `Posts from @${username}'s ${type}`,
      description: `RSS feed for @${username} on Hive`,
      site: FEED_BASE,
      items: filtered.map(post => postToItem(post, iface, refer)),
      customData: channelExtras({
        self: selfUrl(url),
        image: { url: profileImage, title: `@${username}`, link: makeAuthorUrl(username, type, iface, refer) },
      }),
      xmlns: FEED_XMLNS,
    });
  } catch (err: any) {
    const status = err?.status ?? 500;
    return new Response(err?.message ?? 'Internal server error', { status });
  }
};
