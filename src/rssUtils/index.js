import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'
import { promisify } from 'util'
var config = require('../config');
var showdown = require('showdown');
var markdownConverter = new showdown.Converter();


const makeInterfaceUrl = (iface) => {

  var site = 'https://hive.blog'
    if (iface == 'peakd') {
        site = 'https://peakd.com'
    } else if (iface == 'ulogs') {
        site = 'https://ulogs.org'
    } else if (iface == 'steempeak') {
        site = 'https://steempeak.com'
    } else if (iface == 'esteem') {
        site = 'https://esteem.app'
    } else if (iface == 'ecency') {
        site = 'https://ecency.com'
    } else if (iface == 'leofinance') {
        site = 'https://leofinance.io'
    }
  return site;
}


const makeSiteUrl = (category, tag, iface, refer) => {
    var site = makeInterfaceUrl(iface);
    var url = `${site}/${category}/${tag}`
    if (refer) {
        url += `?ref=${refer}`
    }
    return url
}


const makeFeedItemUrl = (url, iface, refer) => {
    var site = makeInterfaceUrl(iface);
    var url = `${site}${url}`

    if (refer) {
        url += `?ref=${refer}`
    }
    return url
}


const makeFeedItemUrlFromVote = (author, permlink, iface, refer) => {
    var site = makeInterfaceUrl(iface);
    var url = `${site}/@${author}/${permlink}`

    if (refer) {
        url += `?ref=${refer}`
    }
    return url
}


const makeUserProfileURL = (username, type, iface, refer) => {
    var site = makeInterfaceUrl(iface);
    var url = `${site}/@${username}/${type}`

    if (refer) {
        url += `?ref=${refer}`
    }
    return url
}


const buildFeedQueryParams = (iface, limit, minVotePct = NaN) => {

    var paramsList = []
    if (iface.length > 0) {
        paramsList.push(`interface=${iface}`)
    }
    if (limit != 10) {
        paramsList.push(`limit=${limit}`)
    }
    if (minVotePct != 0 && !isNaN(minVotePct)) {
        paramsList.push(`minVotePct=${minVotePct}`)
    }

    var feedQueryParams = paramsList.join('&')

    if (feedQueryParams.length > 0) {
        feedQueryParams = `?${feedQueryParams}`
    }

    return feedQueryParams
}


const rssGeneratorUser = async (username, type, iface, limit, tagFilter, refer) => {
    
    var feedQueryParams = buildFeedQueryParams(iface, limit)

    const feedOption = {
        title: `Posts from @${username}'s ${type}`,
        feed_url: `${config.FEED_URL}/@${username}/${type}${feedQueryParams}`,
        site_url: makeUserProfileURL(username,type,iface,refer),
        image_url: 'http://www.hiverss.com/hive_logo.png',
        docs: 'https://github.com/hiveuprss/hiverss'
    } 

        const apiResponse = await getFeedContent(type, username, limit)
        var filteredPostList = apiResponse

        if (tagFilter.length > 0) {
            var filteredPostList = apiResponse.filter((x) => {
                return JSON.parse(x.json_metadata.toLowerCase()).tags.includes(tagFilter)
            })            
        }

        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, filteredPostList, iface, refer)
        return completedFeed.xml()
}


const rssGeneratorTopic = async (category, tag, iface, limit, tagFilter, refer) => {
    
    var feedQueryParams = buildFeedQueryParams(iface, limit)

    const feedOption = {
        title: `${category} ${tag} posts`,
        feed_url: `${config.FEED_URL}/${category}/${tag}${feedQueryParams}`,
        site_url: makeSiteUrl(category,tag,iface,refer),
        image_url: 'http://www.hiverss.com/hive_logo.png',
        docs: 'https://github.com/hiveuprss/hiverss'
    } 

        const apiResponse = await getFeedContent(category, tag, limit)
        var filteredPostList = apiResponse

        if (tagFilter.length > 0) {
            var filteredPostList = apiResponse.filter((x) => {
                return JSON.parse(x.json_metadata.toLowerCase()).tags.includes(tagFilter)
            })            
        }
        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, filteredPostList, iface, refer)
        return completedFeed.xml()
}


const rssGeneratorVoter = async (voter, iface, limit, minVotePct, tagFilter, refer) => {

    var feedQueryParams = buildFeedQueryParams(iface, limit, minVotePct)

    const feedOption = {
        title: `Hive posts voted by @${voter}`,
        feed_url: `${config.FEED_URL}/@${voter}/votes${feedQueryParams}`,
        site_url: makeUserProfileURL(voter, 'feed', iface, refer),
        image_url: 'http://www.hiverss.com/hive_logo.png',
        docs: 'https://github.com/hiveuprss/hiverss'
    } 
    
    const apiResponse = await steem.api.callAsync('database_api.list_votes',
        {start:[voter,"",""], limit:1000, order:"by_voter_comment"})

    // this code will have an issue if account has voted more than 1000 times in the past 7 days
    // votes after #1000 will be skipped
    // the API does not provide a way to get latest votes first
    
    // remove other voters
    var filteredVoteList = apiResponse.votes.filter((x) => {return x.voter == voter})

    // remove votes below minVotePct
    var filteredVoteList = filteredVoteList.filter((x) => {return x.vote_percent >= (minVotePct * 100)})

    // put latest vote first
    var filteredVoteList = filteredVoteList.reverse()

    // trim to limit
    var limit = Math.min(limit, filteredVoteList.length)
    filteredVoteList = filteredVoteList.slice(0,limit)

    const feed = new RSS(feedOption)
    const completedFeed = await feedItemVoted(feed, filteredVoteList, iface, refer)
    return completedFeed.xml()
}


const getDiscussionsByCreated = promisify(steem.api.getDiscussionsByCreated);
const getDiscussionsByFeed = promisify(steem.api.getDiscussionsByFeed);
const getDiscussionsByBlog = promisify(steem.api.getDiscussionsByBlog);
const getDiscussionsByHot = promisify(steem.api.getDiscussionsByHot);
const getDiscussionsByTrending = promisify(steem.api.getDiscussionsByTrending);
const getDiscussionsByPromoted = promisify(steem.api.getDiscussionsByPromoted);
const getDiscussionsByComments = promisify(steem.api.getDiscussionsByComments);
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
    'comments': (query) => getDiscussionsByComments({limit: query.limit, start_author: query.tag})
}


const getFeedContent = async (category, tag, limit) => methodMap.hasOwnProperty(category) ?
                                            await methodMap[category]({tag, limit: limit}) :
                                            Promise.reject({status: 400, message: "Unknown Category"})


const feedItem = async (feed, response, iface, refer) => {
    response.forEach(({title, url, author, category, created: date, body}) => {
        feed.item({
            title,
            url: makeFeedItemUrl(url,iface,refer),
            categories: [category],
            author,
            date,
            description: body.replace(/!\[.*\]\(.*\)/g, (x) => {return markdownConverter.makeHtml(x);})
        })
    });

    return feed
}


const feedItemVoted = async (feed, response, iface, refer) => {
    response.forEach(({permlink, author, last_update: date, vote_percent}) => {
        feed.item({
            url: makeFeedItemUrlFromVote(author,permlink,iface,refer),
            author,
            date,
            description: `Vote weight: ${vote_percent / 100}%`
        })
    });

    return feed
}


module.exports = {
    rssGeneratorTopic: rssGeneratorTopic,
    rssGeneratorUser: rssGeneratorUser,
    rssGeneratorVoter: rssGeneratorVoter
}