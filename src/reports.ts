import * as Router from 'koa-router';
import {DB} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import {Gmina} from './entities/gmina.entity';
import {parse} from 'json2csv';

const router = new Router();

router.get('/gminaByCode', async ctx => {
  const repo = DB.conn().getRepository(Gmina);
  ctx.body = await repo.findOne({where: {code: ctx.query.code}});
});

router.get('/report/allSightingsWithGmina', async ctx => {
  ctx.body = await DB.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .leftJoinAndSelect('sighting.gmina', 'gmina')
    .getMany();
});

router.get('/report/json', async ctx => {
  const gminy = await DB.conn()
    .query(`
    SELECT "gmina"."gid" AS "id", (array_agg("gmina"."jpt_kod_je"))[1] AS code,
    (array_agg("gmina"."jpt_nazwa_"))[1] AS name,
    json_build_object(
      'alive', COUNT(sighting.id) filter (where sighting.condition = 'alive'),
      'dead', COUNT(sighting.id) filter (where sighting.condition = 'dead'),
      'remains', COUNT(sighting.id) filter (where sighting.condition = 'remains'),
      'all', COUNT(sighting.id)
    ) AS sightings
    FROM "gmina" "gmina" INNER JOIN "sighting" "sighting" ON "sighting"."gminaGid"="gmina"."gid"
    GROUP BY "gmina"."gid"`);

  ctx.body = gminy;
});

router.get('/report/csv', async ctx => {
  const gminy = await DB.conn().query(`
  SELECT "gmina"."gid" AS "id", (array_agg("gmina"."jpt_kod_je"))[1] AS code,
  (array_agg("gmina"."jpt_nazwa_"))[1] AS name, 
  COUNT(sighting.id) filter (where sighting.condition = 'alive') as alive,
  COUNT(sighting.id) filter (where sighting.condition = 'dead') as dead,
  COUNT(sighting.id) filter (where sighting.condition = 'remains') as remains
  FROM "gmina" "gmina" INNER JOIN "sighting" "sighting" ON "sighting"."gminaGid"="gmina"."gid"
  GROUP BY "gmina"."gid"
  `);

  try {
    const csv = parse(gminy);
    ctx.body = csv;
  } catch (e) {
    ctx.throw = e;
  }
});

export default router;
