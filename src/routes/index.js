import compose from 'koa-compose'
import Router from 'koa-router'
import tagRouter from './tag'
import userRouter from './user'
const hive = require('@hiveio/hive-js');
const fs = require('fs');
const showdown = require('showdown');
const markdownConverter = new showdown.Converter();

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

var logoData2 = '';
fs.readFile('hive_logo.png', (err, data) => {
    if (err) throw err;
    logoData2 = data;
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
router.get('/hive_logo.png', async (ctx, next) => {
    ctx.type = 'image/png'
    ctx.body = logoData2   
})
router.get('/', async (ctx, next) => {
    ctx.type = 'text/html'
    ctx.body = homepageContent   
})


hive.api.setOptions({ url: 'https://api.hive.blog' });
const routes = [ router, userRouter, tagRouter ]

export default () => compose([].concat(
  ...routes.map(r => [r.routes(), r.allowedMethods()])
))