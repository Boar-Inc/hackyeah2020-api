import * as Router from 'koa-router';
import { DB as db} from './utils/db';
import { Sighting } from './entities/sighting.entity';

const router = new Router();

router.get('/allSightings', async ctx => {
  ctx.body = await Sighting.find();
  console.log(ctx.params);
});

router.get('/sightingInRadius', async ctx => {

  const inradius = await db.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .where("ST_DWithin(sighting.coordinates::geometry, ST_MakePoint(:x, :y), :radius)")
    .setParameters({x: Number(ctx.request.query.x), y: Number(ctx.request.query.y), radius: Number(ctx.request.query.radius)})
    .getMany();

  ctx.body = inradius;
  console.log(ctx.params);
});

router.post('/addSighting', async ctx => {

  console.log(ctx.request.body);

  let sighting = new Sighting();
  sighting.coordinates = {
    lat: Number(ctx.request.body.lat),
    lng: Number(ctx.request.body.lng)
  }
  try {
    sighting.save();
    ctx.res.statusCode = 201;
    ctx.body = "Created";
  } catch (e) { 
    ctx.res.statusCode = 501;
    ctx.body = "Internal Server Error";
    throw e;
  }
  
});

export default router;
