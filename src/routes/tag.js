import Router from 'koa-router'
import {rssGeneratorTopic} from '../rssUtils'

const router = new Router({ prefix: '' })

router.get('/:category/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, ctx.params.tag)   
})

router.get('/:category', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, '')   
})



export default router
