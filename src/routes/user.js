import Router from 'koa-router'
import {rssGeneratorUser} from '../rssUtils'

const router = new Router({ prefix: '/@' })

router.get(':username/:type', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, ctx.params.type)   
})

router.get(':username', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, 'blog')   
})

export default router
