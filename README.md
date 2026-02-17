# HiveRSS — [hiverss.com](https://hiverss.com)

RSS and Atom feeds for the [Hive blockchain](https://hive.io). Follow any Hive author, tag, or community in your RSS reader.

## Usage

Go to (almost) any Hive page with a content stream and replace `hive.blog` with `hiverss.com`:

```
https://hive.blog/trending/photography  →  https://hiverss.com/trending/photography.xml
```

### Author feeds

| URL | Description |
| :-- | :---------- |
| `hiverss.com/@username.xml` | Latest posts by author |
| `hiverss.com/@username/feed.xml` | Author's followed feed |
| `hiverss.com/@username/comments.xml` | Comments by author |
| `hiverss.com/@username/votes.xml` | Posts recently voted by author |

Filter by tag: `hiverss.com/@username.xml?tagFilter=travel`

Only include votes above a threshold: `hiverss.com/@username/votes.xml?minVotePct=50`

### Tag feeds

```
hiverss.com/trending/<tag>.xml
hiverss.com/hot/<tag>.xml
hiverss.com/new/<tag>.xml
hiverss.com/promoted/<tag>.xml
```

Examples: `hiverss.com/trending/photography.xml`, `hiverss.com/hot/bitcoin.xml`

### Community feeds

```
hiverss.com/community/<hive-community-id>.xml
```

Example: `hiverss.com/community/hive-194913.xml`

### Interface selector

Link posts to your preferred Hive frontend using the `interface` query parameter:

```
hiverss.com/@username.xml?interface=peakd
```

Supported values: `peakd`, `ecency`, `leofinance`, `hivelist`, `ctptalk`, `splintertalk`, `sportstalk`, `weedcash`, `hivehustlers`, `naturalmedicine`, `dunksocial`, `wearealive`, `musicforlife`, `beatzchain`, `blocktunes`

### Legacy URL redirect

Old feed URLs (without `.xml`) are automatically redirected to the correct `.xml` endpoint for RSS readers. Browser requests to bare paths serve HTML landing pages instead.

## Development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # build to ./dist/
npm run preview   # preview production build locally
```

## Deployment (Heroku)

```sh
heroku create
git push heroku main
```

Heroku auto-detects Node.js, runs `astro build` via `heroku-postbuild`, and starts the server with `node ./dist/server/entry.mjs`.

## Tech stack

- [Astro](https://astro.build) (SSR, Node adapter)
- [@astrojs/rss](https://docs.astro.build/en/guides/rss/) for feed generation
- [@hiveio/dhive](https://github.com/openhive-network/dhive) for Hive API access

## Contributors

- Creator of SteemRSS: [@philipkoon](https://peakd.com/@philipkoon)
- SteemRSS Contributor: [@doriitamar](https://peakd.com/@doriitamar)
- HiveRSS Maintainer: [@torrey.blog](https://peakd.com/@torrey.blog)
- HiveRSS Maintainer: [@hivetrending](https://peakd.com/@hivetrending)
