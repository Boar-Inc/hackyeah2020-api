import {createConnection, getConnection, getRepository} from 'typeorm';
import { Gmina } from '../entities/gmina.entity';

type ConnectType = 'establish' | 'retain';

export const DB = {
  connect: async (): Promise<void> => {
    await createConnection({
      type: 'postgres',
      name: 'default',
      url: process.env.DB_URL,
      entities: [
        'src/**/*.entity{.ts,.js}',
      ],
      synchronize: process.env.NODE_ENV === 'development',
      dropSchema: process.env.DROP_DB === 'true',

      logging: true,
    });
  },
  repo: getRepository,
  conn: getConnection,
  tableName: (entt: new () => unknown) => getRepository(entt).getMetadata().tableName,
};

export async function pointBelongsTo (lat: number, lng: number) {
  const gmina = await DB.conn()
    .createQueryBuilder(Gmina, 'gmina')
    .where('ST_Contains(gmina.geom::geometry, ST_SetSRID(ST_MakePoint(:lng, :lat),4326))')
    .setParameters(
      {
        lng,
        lat,
      },
    )
    .getOne();
  return gmina;
}
