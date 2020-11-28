import * as Router from 'koa-router';
import {DB} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import {Gmina} from './entities/gmina.entity';
import {parse, transforms} from 'json2csv';

const router = new Router();

router.get('/report/sightingsWithinGmina', async ctx => {
  if (!ctx.request.query.code) ctx.throw(400);

  ctx.body = await DB.repo(Gmina)
    .findOne({
      where: {code: ctx.request.query.code},
      relations: ['sightings'],
      select: ['name', 'code', 'gid', 'geom'],
    });
});

router.get('/report/allSightings', async ctx => {
  let res = await DB.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .leftJoinAndSelect('sighting.gmina', 'gmina')
    .getMany();

  if (ctx.request.query.format === 'csv')
    res = parse(res, {
      fields: ['id', 'gmina.name', 'gmina.code', 'amount', 'condition'],
    });

  ctx.body = res;
});

router.get('/report/gminyWithSightings', async ctx => {
  let res = await DB.conn()
    .query(`
    SELECT "gmina"."gid" AS "gid", (array_agg("gmina"."jpt_kod_je"))[1] AS code,
    (array_agg("gmina"."jpt_nazwa_"))[1] AS name,
    json_build_object(
      'alive', COUNT(sighting.id) filter (where sighting.condition = 'alive'),
      'dead', COUNT(sighting.id) filter (where sighting.condition = 'dead'),
      'remains', COUNT(sighting.id) filter (where sighting.condition = 'remains'),
      'all', COUNT(sighting.id)
    ) AS sightings
    FROM "gmina" "gmina" INNER JOIN "sighting" "sighting" ON "sighting"."gminaGid"="gmina"."gid"
    GROUP BY "gmina"."gid"`);

  if (ctx.request.query.format === 'csv')
    res = parse(res, {
      fields: ['gid', 'name', 'code', 'sightings.alive', 'sightings.dead', 'sightings.remains'],
    });

  ctx.body = res;
});

export default router;
