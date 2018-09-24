import Router from 'koa-router'
import {rssGeneratorUser} from '../rssUtils'

const router = new Router({ prefix: '/@' })

router.get(':username/:type', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, ctx.params.type)   
})

export default router
