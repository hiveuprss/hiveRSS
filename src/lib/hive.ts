import { Client } from '@hiveio/dhive';

export const client = new Client([
  'https://api.hive.blog',
  'https://api.syncad.com',
  'https://api.deathwing.me',
]);

const TOPIC_CATEGORIES = new Set([
  'trending', 'hot', 'created', 'new', 'promoted',
]);

const USER_CATEGORIES = new Set([
  'blog', 'feed', 'comments',
]);

export interface HivePost {
  title: string;
  url: string;
  author: string;
  permlink: string;
  category: string;
  created: string;
  body: string;
  json_metadata: string;
}

export async function getTopicPosts(category: string, tag: string, limit: number): Promise<HivePost[]> {
  const cat = category === 'new' ? 'created' : category;
  if (!TOPIC_CATEGORIES.has(cat)) {
    throw Object.assign(new Error(`Unknown category: ${category}`), { status: 400 });
  }
  return client.call('condenser_api', `get_discussions_by_${cat}`, [{ tag, limit }]);
}

export async function getCommunityPosts(community: string, limit: number): Promise<HivePost[]> {
  return client.call('bridge', 'get_ranked_posts', [{ tag: community, limit, sort: 'created' }]);
}

export async function getUserPosts(username: string, type: string, limit: number): Promise<HivePost[]> {
  if (!USER_CATEGORIES.has(type)) {
    throw Object.assign(new Error(`Unknown user feed type: ${type}`), { status: 400 });
  }
  // get_discussions_by_comments uses start_author, not tag
  const params = type === 'comments'
    ? { start_author: username, limit }
    : { tag: username, limit };
  return client.call('condenser_api', `get_discussions_by_${type}`, [params]);
}

export interface VotedPost {
  author: string;
  permlink: string;
  voter: string;
  vote_percent: number;
  date: string;
}

export async function getUserVotes(username: string, limit: number, minVotePct: number): Promise<VotedPost[]> {
  const history = await client.call('condenser_api', 'get_account_history', [username, -1, 1000]);

  return history
    .filter(([, op]: [number, any]) => op.op[0] === 'vote')
    .map(([, op]: [number, any]) => ({
      author: op.op[1].author,
      permlink: op.op[1].permlink,
      voter: op.op[1].voter,
      vote_percent: op.op[1].weight / 100,
      date: op.timestamp,
    }))
    .filter((v: VotedPost) => v.voter === username)
    .filter((v: VotedPost) => v.vote_percent >= minVotePct)
    .reverse()
    .slice(0, limit);
}

export async function getAccountProfileImage(username: string): Promise<string> {
  try {
    const [account] = await client.database.getAccounts([username]);
    const meta = JSON.parse(account.posting_json_metadata || account.json_metadata || '{}');
    return meta.profile?.profile_image || 'https://hiverss.com/hive_logo.png';
  } catch {
    return 'https://hiverss.com/hive_logo.png';
  }
}

export interface HiveProfile {
  name: string;
  about?: string;
  reputation: number;
  post_count: number;
  followers: number;
  following: number;
  profile_image?: string;
  cover_image?: string;
  location?: string;
  website?: string;
}

export interface HiveCommunity {
  name: string;
  title: string;
  about: string;
  subscribers: number;
  num_authors: number;
  sum_pending: number;
  lang: string;
}

export async function getCommunities(limit = 100): Promise<HiveCommunity[]> {
  return client.call('bridge', 'list_communities', [{ limit, sort: 'rank', observer: '' }]);
}

export async function getProfile(username: string): Promise<HiveProfile | null> {
  try {
    return await client.call('bridge', 'get_profile', [{ account: username, observer: '' }]);
  } catch {
    return null;
  }
}

export function filterByTag(posts: HivePost[], tagFilter: string): HivePost[] {
  if (!tagFilter) return posts;
  return posts.filter(post => {
    try {
      const tags: string[] = JSON.parse(post.json_metadata.toLowerCase()).tags ?? [];
      return tags.includes(tagFilter);
    } catch {
      return false;
    }
  });
}
