#!/usr/bin/env node
/**
 * Fetch https://hiverss.com/sitemap.xml and submit all URLs to IndexNow.
 * Requires the key file to be live at /{key}.txt on the same host.
 */
const SITE = 'https://hiverss.com';
const KEY = 'faa04705266a4849be4e095903ee5453';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const keyRes = await fetch(KEY_LOCATION);
if (!keyRes.ok) {
  console.error(`IndexNow key not live yet (${keyRes.status}): ${KEY_LOCATION}`);
  console.error('Deploy public/' + KEY + '.txt to production, then re-run.');
  process.exit(1);
}

const body = await keyRes.text();
if (body.trim() !== KEY) {
  console.error('Key file content does not match expected key.');
  process.exit(1);
}

const sitemapRes = await fetch(`${SITE}/sitemap.xml`);
if (!sitemapRes.ok) {
  console.error(`Failed to fetch sitemap: ${sitemapRes.status}`);
  process.exit(1);
}

const xml = await sitemapRes.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error('No URLs found in sitemap.');
  process.exit(1);
}

const payload = {
  host: 'hiverss.com',
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log(`IndexNow status: ${res.status}`);
if (text) console.log(text);
console.log(`Submitted ${urls.length} URLs from sitemap.`);

// 200/202 = accepted; 403 = key validation failed
if (res.status !== 200 && res.status !== 202) {
  process.exit(1);
}
