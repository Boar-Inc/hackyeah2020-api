import * as Router from 'koa-router';
import {DB, pointBelongsTo} from './utils/db';
import {Sighting} from './entities/sighting.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from '@koa/multer';

import * as imagemin from 'imagemin';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';

const imageminOptions: imagemin.BufferOptions = {
  plugins: [
    imageminPngquant({speed: 3, strip: true}),
    imageminMozjpeg(),
  ],
};

const router = new Router();
const storage = multer.memoryStorage();
const allowedTypes = ['image/jpeg', 'image/png'];
const upload = multer({
  storage,
  limits: {
    fileSize: 5242880,
    files: 1,
  },
  fileFilter: (req, file, next) => {
    if (allowedTypes.includes(file.mimetype)) return next(null, true);
    next(new Error('Mimetype not allowed'), false);
  },
});

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

router.post('/sightings', upload.single('image'), async ctx => {
  const createdHereWithin10Minutes = await DB.conn()
    .createQueryBuilder(Sighting, 'sighting')
    .where('sighting.createdOn > now() - \'10 minutes\'::interval ')
    .andWhere('sighting.condition = :condition')
    .andWhere('ST_DWithin(sighting.location::geometry,  ST_SetSRID(ST_MakePoint(:lng, :lat),4326), :radius)')
    .setParameters({
      condition: ctx.request.body.condition,
      lng: +ctx.request.body.lng,
      lat: +ctx.request.body.lat,
      radius: 0.00012, // about 55 meters
    })
    .getMany();
  
  if (createdHereWithin10Minutes.length > 0) ctx.throw(409);

  const point = {
    type: 'Point',
    coordinates: [+ctx.request.body.lng, +ctx.request.body.lat],
  };

  const gmina = await pointBelongsTo(+ctx.request.body.lat, +ctx.request.body.lng);
  if (!gmina) ctx.throw(403);

  const sighting = new Sighting();
  sighting.location = point;
  sighting.age = +ctx.request.body.age;
  sighting.amount = +ctx.request.body.amount;
  sighting.condition = ctx.request.body.condition;
  sighting.gmina = gmina;
  if (ctx.request.file) {
    const buf = await imagemin.buffer(ctx.request.file.buffer, imageminOptions);

    const imgUrl = crypto
      .createHash('md5')
      .update(buf)
      .digest('hex')
      .slice(0, 20) + path.extname(ctx.request.file.originalname);

    if (await DB.repo(Sighting).findOne({
      where: {
        imageURL: imgUrl,
      },
    })) ctx.throw(400);

    sighting.imageURL = imgUrl;
    await fs.promises.writeFile('uploads/' + sighting.imageURL, buf);
  }

  ctx.body = await DB.repo(Sighting).save(sighting);
  
});

router.post('/deleteSighting', async ctx => {
  console.log(ctx.request.body);

  const ent = await DB.conn()
    .getRepository(Sighting)
    .findOne(ctx.request.body);

  if (ent.imageURL) fs.promises.unlink('uploads/' + ent.imageURL);

  const res = await DB.conn()
    .getRepository(Sighting)
    .remove(ent);

  ctx.body = res;
});

export default router;
