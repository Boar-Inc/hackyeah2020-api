import * as Router from 'koa-router';
import {DB, pointBelongsTo} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import * as path from 'path';

const router = new Router();

router.get('/sightings', async ctx => {
  const radius = ctx.query.radius;

  if (radius)
    ctx.body = await DB.conn()
      .createQueryBuilder(Sighting, 'sighting')
      .where('ST_DWithin(sighting.location::geometry, ST_MakePoint(:x, :y), :radius)')
      .setParameters({
        x: +ctx.query.x,
        y: +ctx.query.y,
        radius: +radius,
      })
      .getMany();

  else ctx.body = await DB.repo(Sighting).find();
});

router.post('/sightings', async ctx => {

  const createdHereWithin10Minutes = await DB.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .where('sighting.createdOn > now() - \'10 minutes\'::interval ')
    .andWhere('sighting.condition = :condition')
    .andWhere('ST_DWithin(sighting.location::geometry,  ST_SetSRID(ST_MakePoint(:lng, :lat),4326), :radius)')
    .setParameters({
      condition: ctx.request.body.condition,
      lng: +ctx.request.body.lng,
      lat: +ctx.request.body.lat,
      radius: 0.0005, // about 55 meters
    })
    .getMany();
  
  if (createdHereWithin10Minutes.length > 0) ctx.throw(409);

  const point = {
    type: 'Point',
    coordinates: [+ctx.request.body.lng, +ctx.request.body.lat],
  };

  const sighting = new Sighting();
  sighting.location = point;
  sighting.age = +ctx.request.body.age;
  sighting.amount = +ctx.request.body.amount;
  sighting.condition = ctx.request.body.condition;
  if (ctx.request.files.image)
    sighting.imageURL = '/' + ctx.request.files.image.path.replace('\\', '/');

  const gmina = await pointBelongsTo(+ctx.request.body.lat, +ctx.request.body.lng);
  if (!gmina) ctx.throw(403);
  sighting.gmina = gmina;

  ctx.body = await DB.repo(Sighting).save(sighting);
  
});

router.post('/deleteSighting', async ctx => {
  console.log(ctx.request.body);
  const res = await DB.conn()
    .getRepository(Sighting)
    .delete(ctx.request.body.id);

  ctx.body = res;
});

export default router;
