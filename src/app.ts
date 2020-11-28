import {config} from 'dotenv';
config();

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

import * as Koa from 'koa';
import {DB} from './utils/db';
import * as cors from '@koa/cors';
import * as logger from 'koa-logger';
import * as koaBody from 'koa-body';
import * as koaStatic from 'koa-static';
import router from './router';
import reports from './reports';

(async () => {
  const app = new Koa();
  app.use(cors());
  app.use(koaBody());
  app.use(logger());

  app.use(router.routes()).use(router.allowedMethods());
  app.use(reports.routes()).use(reports.allowedMethods());

  app.use(koaStatic('uploads', {maxage: 120}));

  await DB.connect();

  app.listen(process.env.PORT || 4000, () => {
    console.log('API: ready');
  });
})();
