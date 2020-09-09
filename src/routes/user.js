import Router from 'koa-router'
import {rssGeneratorUser,rssGeneratorVoter} from '../rssUtils'
import {getInterface,getLimit,getMinVote,getTagFilter,getRefer} from '../rssUtils/params'


const router = new Router({ prefix: '/@' })


router.get(':username/:type', async (ctx, next) => {
    ctx.type = 'text/xml'

    if (ctx.params.type == 'votes') {
      ctx.body = await rssGeneratorVoter(ctx.params.username,
                                         getInterface(ctx.query),
                                         getLimit(ctx.query),
                                         getMinVote(ctx.query),
                                         getTagFilter(ctx.query),
                                         getRefer(ctx.query))   
    } else {
      ctx.body = await rssGeneratorUser(ctx.params.username,
                                        ctx.params.type,
                                        getInterface(ctx.query),
                                        getLimit(ctx.query),
                                        getTagFilter(ctx.query),
                                        getRefer(ctx.query))
    }
})

router.get(':username', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username,
                                      'blog',
                                      getInterface(ctx.query),
                                      getLimit(ctx.query),
                                      getTagFilter(ctx.query),
                                      getRefer(ctx.query))   
})

export default router
