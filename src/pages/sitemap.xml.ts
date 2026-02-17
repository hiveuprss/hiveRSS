import type { APIRoute } from 'astro';
import { client, getCommunities } from '../lib/hive';

const SITE = 'https://hiverss.com';

const CATEGORIES = ['trending', 'hot', 'created'];

// Well-known Hive tags with reliable SEO value
const BASE_TAGS = [
  'photography', 'travel', 'writing', 'gaming', 'music', 'art',
  'food', 'nature', 'poetry', 'crypto', 'bitcoin', 'blockchain',
  'technology', 'science', 'health', 'fitness', 'books', 'movies',
  'sports', 'lifestyle', 'diy', 'gardening', 'cooking', 'history',
  'education', 'photography', 'architecture', 'fashion', 'humor',
];

function url(loc: string, priority: string, changefreq: string): string {
  return `<url><loc>${SITE}${loc}</loc><priority>${priority}</priority><changefreq>${changefreq}</changefreq></url>`;
}

export const GET: APIRoute = async () => {
  // Fetch communities and tags in parallel
  const [communities, rawTags] = await Promise.allSettled([
    getCommunities(100),
    client.call('condenser_api', 'get_trending_tags', [null, 50]) as Promise<Array<{ name: string }>>,
  ]);

  const communityNames = communities.status === 'fulfilled'
    ? communities.value.map(c => c.name)
    : [];

  const topTags = rawTags.status === 'fulfilled'
    ? rawTags.value.map(t => t.name).filter(n => n && n.length > 1 && !/^hive-\d+$/.test(n))
    : [];

  const urls: string[] = [
    // Homepage + browse page
    url('/', '1.0', 'daily'),
    url('/communities', '0.8', 'daily'),
    // All community landing pages
    ...communityNames.map(c => url(`/community/${c}`, '0.7', 'hourly')),
    // Tag pages — all categories × deduplicated tag list
    ...CATEGORIES.flatMap(cat => {
      const allTags = [...new Set([...BASE_TAGS, ...topTags])];
      return allTags.map(tag => url(`/${cat}/${tag}`, '0.6', 'hourly'));
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
