import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'
import { promisify } from 'util'
var config = require('../config');
var showdown = require('showdown');
var markdownConverter = new showdown.Converter();

const makeSiteUrl = (category, tag, iface) => {
    var site = 'https://hive.blog'
    
    if (iface == 'peakd') {
        site = 'https://peakd.com'
    } else if (iface == 'ulogs') {
        site = 'https://ulogs.org'
    } else if (iface == 'steempeak') {
        site = 'https://steempeak.com'
    } else if (iface == 'esteem') {
        site = 'https://esteem.app'
    }

    return `${site}/${category}/${tag}`
}

const makeFeedItemUrl = (url, iface) => {
    var site = 'https://hive.blog'
    
    if (iface == 'peakd') {
        site = 'https://peakd.com'
    } else if (iface == 'ulogs') {
        site = 'https://ulogs.org'
    } else if (iface == 'steempeak') {
        site = 'https://steempeak.com'
    } else if (iface == 'esteem') {
        site = 'https://esteem.app'
    }

    return `${site}${url}`
}

const makeUserProfileURL = (username, type, iface) => {
    var site = 'https://hive.blog'
    
    if (iface == 'peakd') {
        site = 'https://peakd.com'
    } else if (iface == 'ulogs') {
        site = 'https://ulogs.org'
    } else if (iface == 'steempeak') {
        site = 'https://steempeak.com'
    } else if (iface == 'esteem') {
        site = 'https://esteem.app'
    }

    return `${site}/@${username}/${type}`
}

const rssGeneratorUser = async (username, type, iface, limit) => {

    var feedQueryParams = iface == '' ? '' : `?interface=${iface}`

    const feedOption = {
        title: `Posts from @${username}'s ${type}`,
        feed_url: `${config.FEED_URL}/@${username}/${type}${feedQueryParams}`,
        site_url: makeUserProfileURL(username,type,iface),
        image_url: 'https://steem.com/wp-content/themes/goat-steemit/dist/images/Steem_Logo_White.png',
        docs: 'https://github.com/hiveuprss/hiverss'
    } 

        const apiResponse = await getContent(type, username, limit)
        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, apiResponse, iface)
        return completedFeed.xml()
}

const rssGeneratorTopic = async (category, tag, iface, limit) => {

    var feedQueryParams = iface == '' ? '' : `?interface=${iface}`

    const feedOption = {
        title: `${category} ${tag} posts`,
        feed_url: `${config.FEED_URL}/${category}/${tag}${feedQueryParams}`,
        site_url: makeSiteUrl(category,tag,iface),
        image_url: 'https://steem.com/wp-content/themes/goat-steemit/dist/images/Steem_Logo_White.png',
        docs: 'https://github.com/hiveuprss/hiverss'
    } 

        const apiResponse = await getContent(category, tag, limit)
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
const getDiscussionsByAuthorBeforeDate = promisify(steem.api.getDiscussionsByAuthorBeforeDate);

const methodMap = {
    'feed': (query) => getDiscussionsByFeed(query),
    'blog': (query) => getDiscussionsByBlog(query),
    'blogWithoutResteems': (query) => getDiscussionsByAuthorBeforeDate({author: query.tag,
                                                                        startPermlink: '3-25',
                                                                        beforeDate: new Date().toISOString().split('.')[0]}),
    'new': (query) => getDiscussionsByCreated(query),
    'created': (query) => getDiscussionsByCreated(query),
    'hot': (query) => getDiscussionsByHot(query),
    'trending': (query) => getDiscussionsByTrending(query),
    'promoted': (query) => getDiscussionsByPromoted(query),
    'comments': (query) => getDiscussionsByComments({limit: query.limit, start_author: query.tag}),
    'votes': (query) => getDiscussionsByVotes(query),
    'cashout': (query) => getDiscussionsByCashout(query),
}

const getContent = async (category, tag, limit) => methodMap.hasOwnProperty(category) ?
                                            await methodMap[category]({tag, limit: limit}) :
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