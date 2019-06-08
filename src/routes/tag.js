import Router from 'koa-router'
import {rssGeneratorTopic} from '../rssUtils'

const router = new Router({ prefix: '' })


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

var getLimit = function (query) {
     if (typeof query !== undefined && 
        query !== '' &&
        typeof query['limit'] !== undefined &&
        query['limit'] !== '') {
      
      let limit = parseInt(query['limit'])

      if (!isNaN(limit)) {
        // clamp to range [1..50]
        limit = Math.max(limit, 1)
        limit = Math.min(limit, 50)
        return limit  
      }
    } 
  return 10 
}


router.get('/:category/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, ctx.params.tag, getInterface(ctx.query), getLimit(ctx.query))   
})

router.get('/:category/:interface?', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, '', getInterface(ctx.query), getLimit(ctx.query))   
})



export default router
