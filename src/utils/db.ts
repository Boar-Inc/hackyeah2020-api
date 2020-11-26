import {createConnection, getConnection, getRepository} from 'typeorm';

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
