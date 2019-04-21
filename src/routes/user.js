import Router from 'koa-router'
import {rssGeneratorUser} from '../rssUtils'

const router = new Router({ prefix: '/@' })

var getInterface = function (query) {
    if (typeof query !== undefined && 
        query !== '' &&
        typeof query['interface'] !== undefined &&
        query['interface'] !== '') {
      if (['steemit','ulogs'].includes(query['interface'])) {
        return query['interface']
      }
    } 
  return ''
}

router.get(':username/:type', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, ctx.params.type, getInterface(ctx.query))   
})

router.get(':username', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, 'blog', getInterface(ctx.query))   
})

export default router
