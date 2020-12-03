const Koa = require('koa');
var Router = require('koa-router');

const app = new Koa();
var router = new Router();


router.post('/index.php', async (ctx) => {
  console.log('req post php');
});


router.get('/index.php', async (ctx) => {
  console.log('req get php', ctx.req);
});


router.post('/', async (ctx) => {
  console.log('req post /', ctx.req);
});


router.get('/', async (ctx) => {
  console.log('req get /', ctx.req);
});


app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(7689);