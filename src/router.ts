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
    sighting.imageURL = path.join(process.env.API_URL + ctx.request.files.image.path);

  const gmina = await pointBelongsTo(+ctx.request.body.lat, +ctx.request.body.lng);
  if (!gmina) ctx.throw(400);
  sighting.gmina = gmina;

  ctx.body = await DB.repo(Sighting).save(sighting);
  
});

export default router;
