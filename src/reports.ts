import * as Router from 'koa-router';
import {DB} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import {Gmina} from './entities/gmina.entity';
import {parse, transforms} from 'json2csv';
import {format as formatDate} from 'date-fns';
import {pl} from 'date-fns/locale';

const router = new Router();

router.get('/report/sightingsWithinGmina', async ctx => {
  if (!ctx.request.query.code) ctx.throw(400);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any = await DB.repo(Gmina)
    .findOne({
      where: {code: ctx.request.query.code},
      relations: ['sightings'],
      select: ['name', 'code', 'gid', 'geom'],
    });

  if (ctx.request.query.format === 'csv') {
    const sightings = res.sightings;
    ctx.set('Content-Disposition', `attachment;filename=raport-${+new Date()}.csv`);
    ctx.set('Content-Type', 'text/csv');
    res = sightings.map(x => ({
      'Identyfikator zgłoszenia': x.id,
      'Gmina': res.name,
      'Kod terytorialny': res.code,
      'Stan': {alive: 'żywe', dead: 'padłe', remains: 'szczątki'}[x.condition],
      'Liczba': x.amount,
      'Wiek': x.age,
      'Data': formatDate(new Date(x.createdOn), 'dd.MM.yyyy HH:mm:ss', {locale: pl}),
    }));
    res = parse(res);
  }

  ctx.body = res;
});

router.get('/report/allSightings', async ctx => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: (Record<string, any>)[] = await DB.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .leftJoinAndSelect('sighting.gmina', 'gmina')
    .getMany();

  if (ctx.request.query.format === 'csv') {
    ctx.set('Content-Disposition', `attachment;filename=raport-${+new Date()}.csv`);
    ctx.set('Content-Type', 'text/csv');
    res = res.map(x => ({
      'Identyfikator zgłoszenia': x.id,
      'Gmina': x.gmina.name,
      'Kod terytorialny': x.gmina.code,
      'Stan': {alive: 'żywe', dead: 'padłe', remains: 'szczątki'}[x.condition],
      'Liczba': x.amount,
      'Wiek': x.age,
      'Data': formatDate(new Date(x.createdOn), 'dd.MM.yyyy HH:mm:ss', {locale: pl}),
    }));
    res = parse(res);
  }

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

  if (ctx.request.query.format === 'csv') {
    ctx.set('Content-Disposition', `attachment;filename=raport-${+new Date()}.csv`);
    ctx.set('Content-Type', 'text/csv');
    res = res.map(x => ({
      'Gmina': x.name,
      'Kod terytorialny': x.code,
      'Żywe': x.sightings.alive,
      'Padłe': x.sightings.dead,
      'Szczątki': x.sightings.remains,
      'Suma': x.sightings.all,
    }));
    res = parse(res);
  }

  ctx.body = res;
});

export default router;
