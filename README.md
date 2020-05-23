<title>hiveRSS</title>

![HiveRSS Logo](./hiverss2.png)

# HiveRSS [http://hiverss.com](http://www.hiverss.com)

A simple tool for creating Atom/RSS feeds from Hive accounts and categories.

Go to (almost) any Hive page with a content stream, and replace 'hive.blog' with 'hiverss.com' in the URL. 

http://hive.blog/trending/hive -> http://hive***rss***.com/trending/hive

## Usage Examples

### User Feed

Get posts from your feeds or others' as well.

> `hiverss.com/@<username>/feed`

* [hiverss.com/@philipkoon/feed](http://hiverss.com/@philipkoon/feed)

### Posts By Author

Get posts from your favorite steemian.

> `hiverss.com/@<username>/blog`

* [hiverss.com/@philipkoon/blog](http://hiverss.com/@philipkoon/blog)

Filter posts to show only posts matching a tag

> `hiverss.com/@username?tagFilter=tag`

* [hiverss.com/@sajannair?tagFilter=travel](http://hiverss.com/@sajannair?tagFilter=travel)

### Comments By Author

Get comments from your favorite steemian.

> `hiverss.com/@<username>/comments`

* [hiverss.com/@ned/comments](http://hiverss.com/@ned/comments)

### Posts by Category

Get posts by category, you can get posts by new/hot/trending/promoted

> `http://hiverss.com/new/<category>` OR `http://hiverss.com/created/<category>`
> `http://hiverss.com/hot/<category>`
> `http://hiverss.com/trending/<category>`
> `http://hiverss.com/promoted/<category>`

* [http://hiverss.com/new/ethereum](http://hiverss.com/new/ethereum)
* [http://hiverss.com/hot/bitcoin](http://hiverss.com/hot/bitcoin)
* [http://hiverss.com/trending/steem](http://hiverss.com/trending/steem)

### Posts Voted by a Specific User

Get a feed of links to posts recently voted by a user

> `http://hiverss.com/@<username>/votes`

* [http://hiverss.com/@ocdb/votes](http://hiverss.com/@ocdb/votes)

Only include votes above a specific percentage weight, and link to non-default interace

> `http://hiverss.com/@<username>/votes?minVotePct=<percentage>&interface=<interface-name>`

* [http://hiverss.com/@ocdb/votes?minVotePct=100&interface=peakd](http://hiverss.com/@ocdb/votes?minVotePct=100&interface=peakd)




## Contributors

* Creator of SteemRSS: [@philipkoon](https://hive.blog/@philipkoon)
* SteemRSS Contributor: [@doriitamar](https://hive.blog/@doriitamar)
* HiveRSS Maintainer: [@torrey.blog](https://hive.blog/@torrey.blog)