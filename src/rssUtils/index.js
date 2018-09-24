import steem from 'steem'
import RSS from 'rss'
import xml from 'xml'
import { promisify } from 'util'
var config = require('../config');


const getDiscussionsByCreated = promisify(steem.api.getDiscussionsByCreated);
const getDiscussionsByFeed = promisify(steem.api.getDiscussionsByFeed);
const getDiscussionsByBlog = promisify(steem.api.getDiscussionsByBlog);
const getDiscussionsByHot = promisify(steem.api.getDiscussionsByHot);
const getDiscussionsByTrending = promisify(steem.api.getDiscussionsByTrending);

const rssGenerator = async (category, tag) => {
    const feedOption = {
        title: isUserMethod(category) ? `Posts from <a href="${makeUserProfileURL(category,tag)}">@${tag}'s ${category}</a>` : `${category} ${tag} posts`,
        feed_url: `${config.FEED_URL}/${category}/${tag}`,
        site_url: isUserMethod(category) ? `${makeUserProfileURL(category,tag)}` : `https://steemit.com/${category}/${tag}`,
        image_url: 'https://steemit.com/images/steemit-share.png',
        docs: 'https://github.com/steemrss/steemrss'
    } 

        const apiResponse = await getContent(category, tag)
        const feed = new RSS(feedOption)
        const completedFeed = await feedItem(feed, apiResponse)
        return completedFeed.xml()
}

const makeUserProfileURL = (category, username) => {
    return `https://steemit.com/@${username}/${category}`;
}

const isUserMethod = (category) => {
   return (category === 'feed' || category === 'blog');
}

const methodMap = {
    'feed': (query) => getDiscussionsByFeed(query),
    'blog': (query) => getDiscussionsByBlog(query),
    'new': (query) => getDiscussionsByCreated(query),
    'hot': (query) => getDiscussionsByHot(query),
    'trending': (query) => getDiscussionsByTrending(query)
}

const getContent = async (category, tag) => methodMap.hasOwnProperty(category) ?
                                            await methodMap[category]({tag, limit: 10}) :
                                            Promise.reject({status: 400, message: "Unknown Category"})


const feedItem = async (feed, response) => {
    response.forEach(({title, url, author, category, created: date, body}) => {
        feed.item({
            title,
            url: `https://steemit.com${url}`,
            categories: [category],
            author,
            date,
            description: body,
        })
    });

    return feed
}

export default rssGenerator;