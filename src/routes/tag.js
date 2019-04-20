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
  return 'steemit'
}


router.get('/:category/:tag', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, ctx.params.tag, getInterface(ctx.query))   
})

router.get('/:category/:interface?', async (ctx, next) => {
    ctx.type = 'text/xml'
    ctx.body = await rssGeneratorTopic(ctx.params.category, '', getInterface(ctx.query))   
})



export default router
