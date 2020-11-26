import * as Router from 'koa-router';
import {DB} from './utils/db';
import {Sighting} from './entities/sighting.entity';

const router = new Router();

router.get('/sightings', async ctx => {
  const radius = ctx.query.radius;

  if (radius)
    ctx.body = await DB.conn()
      .createQueryBuilder(Sighting, 'sighting')
      .where('ST_DWithin(sighting.coordinates::geometry, ST_MakePoint(:x, :y), :radius)')
      .setParameters({
        x: +ctx.query.x,
        y: +ctx.query.y,
        radius: +radius,
      })
      .getMany();

  else ctx.body = await DB.repo(Sighting).find();
});

router.post('/sightings', async ctx => {

  const coords = {
    lat: +ctx.request.body.lat,
    lng: +ctx.request.body.lng,
  };

  const sighting = new Sighting();
  sighting.coordinates = coords;

  ctx.body = await DB.repo(Sighting).save(sighting);
  
});

export default router;
