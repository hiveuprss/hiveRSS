import compose from 'koa-compose'
import Router from 'koa-router'
import tagRouter from './tag'
import userRouter from './user'
import steem from 'steem'
const fs = require('fs');
const showdown = require('showdown');
var markdownConverter = new showdown.Converter();

var homepageContent = '';
fs.readFile('README.md', 'utf8', (err, data) => {
    if (err) throw err;
    homepageContent = markdownConverter.makeHtml(data);
});

var iconData = '';
fs.readFile('favicon.ico', (err, data) => {
    if (err) throw err;
    iconData = data;
});

var logoData = '';
fs.readFile('hiverss2.png', (err, data) => {
    if (err) throw err;
    logoData = data;
});

const router = new Router();
router.get('/favicon.ico', async (ctx, next) => {
    ctx.type = 'image/x-icon'
    ctx.body = iconData   
})
router.get('/hiverss2.png', async (ctx, next) => {
    ctx.type = 'image/png'
    ctx.body = logoData   
})
router.get('/', async (ctx, next) => {
    ctx.type = 'text/html'
    ctx.body = homepageContent   
})


steem.api.setOptions({ url: 'https://anyx.io/' });
const routes = [ router, userRouter, tagRouter ]

export default () => compose([].concat(
  ...routes.map(r => [r.routes(), r.allowedMethods()])
))