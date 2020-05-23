import Router from 'koa-router'
import {rssGeneratorTopic} from '../rssUtils'
import {getInterface,getLimit,getTagFilter} from '../rssUtils/params'

const router = new Router({ prefix: '' })


router.get('/:category/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, ctx.params.tag, getInterface(ctx.query), getLimit(ctx.query), getTagFilter(ctx.query))
})

export default router
