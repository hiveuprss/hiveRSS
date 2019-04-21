import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'
import { promisify } from 'util'
var config = require('../config');
var showdown = require('showdown');
var markdownConverter = new showdown.Converter();

const makeSiteUrl = (category, tag, iface) => {
    if (iface == 'ulogs') {
        return `https://ulogs.org/${category}/${tag}`
    } else {
        return `https://steemit.com/${category}/${tag}`
    }
}

const makeFeedItemUrl = (url, iface) => {
    if (iface == 'ulogs') {
        return `https://ulogs.org${url}`
    } else {
        return `https://steemit.com${url}`
    }
}

const makeUserProfileURL = (username, type, iface) => {
    if (iface == 'ulogs') {
        return `https://ulogs.org/@${username}/${type}`
    } else {
        return `https://steemit.com/@${username}/${type}`;
    }
}

const rssGeneratorUser = async (username, type, iface) => {

    var feedQueryParams = iface == '' ? '' : `?interface=${iface}`

    const feedOption = {
        title: `Posts from @${username}'s ${type}`,
        feed_url: `${config.FEED_URL}/@${username}/${type}${feedQueryParams}`,
        site_url: makeUserProfileURL(username,type,iface),
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://github.com/steemrss/steemrss'
    } 

        const apiResponse = await getContent(type, username)
        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, apiResponse, iface)
        return completedFeed.xml()
}

const rssGeneratorTopic = async (category, tag, iface) => {

    var feedQueryParams = iface == '' ? '' : `?interface=${iface}`

    const feedOption = {
        title: `${category} ${tag} posts`,
        feed_url: `${config.FEED_URL}/${category}/${tag}${feedQueryParams}`,
        site_url: makeSiteUrl(category,tag,iface),
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://github.com/steemrss/steemrss'
    } 

        const apiResponse = await getContent(category, tag)
        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, apiResponse, iface)
        return completedFeed.xml()
}

const getDiscussionsByCreated = promisify(steem.api.getDiscussionsByCreated);
const getDiscussionsByFeed = promisify(steem.api.getDiscussionsByFeed);
const getDiscussionsByBlog = promisify(steem.api.getDiscussionsByBlog);
const getDiscussionsByHot = promisify(steem.api.getDiscussionsByHot);
const getDiscussionsByTrending = promisify(steem.api.getDiscussionsByTrending);
const getDiscussionsByPromoted = promisify(steem.api.getDiscussionsByPromoted);
const getDiscussionsByComments = promisify(steem.api.getDiscussionsByComments);
const getDiscussionsByVotes = promisify(steem.api.getDiscussionsByVotes);
const getDiscussionsByCashout = promisify(steem.api.getDiscussionsByCashout);

const methodMap = {
    'feed': (query) => getDiscussionsByFeed(query),
    'blog': (query) => getDiscussionsByBlog(query),
    'new': (query) => getDiscussionsByCreated(query),
    'created': (query) => getDiscussionsByCreated(query),
    'hot': (query) => getDiscussionsByHot(query),
    'trending': (query) => getDiscussionsByTrending(query),
    'promoted': (query) => getDiscussionsByPromoted(query),
    'comments': (query) => getDiscussionsByComments({limit: query.limit, start_author: query.tag}),
    'votes': (query) => getDiscussionsByVotes(query),
    'cashout': (query) => getDiscussionsByCashout(query),
}

const getContent = async (category, tag) => methodMap.hasOwnProperty(category) ?
                                            await methodMap[category]({tag, limit: 10}) :
                                            Promise.reject({status: 400, message: "Unknown Category"})

const feedItem = async (feed, response, iface) => {
    response.forEach(({title, url, author, category, created: date, body}) => {
        feed.item({
            title,
            url: makeFeedItemUrl(url,iface),
            categories: [category],
            author,
            date,
            description: body.replace(/!\[.*\]\(.*\)/g, (x) => {return markdownConverter.makeHtml(x);})
        })
    });

    return feed
}

module.exports = {
    rssGeneratorTopic: rssGeneratorTopic,
    rssGeneratorUser: rssGeneratorUser
}