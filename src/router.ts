import Router from 'koa-router';

const router = new Router();

router.get('/sightings', async ctx => {
  // this is how you set the response body in koa
  ctx.body = await Promise.resolve();
});

export default router;
