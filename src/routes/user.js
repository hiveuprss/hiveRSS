import Router from 'koa-router'
import {rssGeneratorUser} from '../rssUtils'

const router = new Router({ prefix: '/@' })

var getInterface = function (query) {
    if (typeof query !== undefined && 
        query !== '' &&
        typeof query['interface'] !== undefined &&
        query['interface'] !== '') {
      if (['hive','peakd','ulogs','steempeak','esteem'].includes(query['interface'])) {
        return query['interface']
      }
    } 
  return ''
}

var getLimit = function (query) {
     if (typeof query !== undefined && 
        query !== '' &&
        typeof query['limit'] !== undefined &&
        query['limit'] !== '') {
      
      let limit = parseInt(query['limit'])

      if (!isNaN(limit)) {
        // clamp to range [0..50]
        limit = Math.max(limit, 0)
        limit = Math.min(limit, 50)
        return limit  
      }
    } 
  return 10 
}

router.get(':username/:type', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, ctx.params.type, getInterface(ctx.query), getLimit(ctx.query))   
})

router.get(':username', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorUser(ctx.params.username, 'blog', getInterface(ctx.query), getLimit(ctx.query))   
})

export default router
