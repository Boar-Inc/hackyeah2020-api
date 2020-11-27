import * as Router from 'koa-router';
import {DB} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import {Gmina} from './entities/gmina.entity';

const router = new Router();

router.get('/gminaByCode', async ctx => {
  const repo = DB.conn().getRepository(Gmina);
  ctx.body = await repo.findOne({where: {code: ctx.query.code}});
});

router.get('/sightingsInGmina', async ctx => {

  const repo = DB.conn().getRepository(Gmina);
  

  ctx.body = 'ee';
});


// async function allPointsInGmina (code: string) {
//   const arr = await DB.conn()
//     .createQueryBuilder(Sighting, 'sighting')
// eslint-disable-next-line max-len
//     .where('ST_Contains((select geom from gmina where gmina.jpt_kod_je = :code)::geometry, sighting.location::geometry)')
//     .setParameters({
//       code,
//     })
//     .getMany();
//   return arr;
// }

export default router;
