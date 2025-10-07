/* eslint-disable */
import dotenv from 'dotenv';
const result = dotenv.config();

import Path from 'path';
import knex, { Knex } from 'knex';
import { ENV } from '../../helpers/env';
import { Logger } from '../../helpers/logger';

(async () => {
  var text = await migrate();
  Logger.info(text);
})();

async function migrate() {
  Logger.info('Migration running...');
  const migrationDirectory = Path.resolve(__dirname, './migrations/');
  Logger.info('Using directory', migrationDirectory);

  let db: Knex | undefined;
  try {
    db = knex({
      client: 'pg',
      connection: {
        host: ENV.Database.MIGRATOR_DB_HOST,
        user: ENV.Database.DB_USER,
        database: ENV.Database.DB_NAME,
        password: ENV.Database.DB_PASSWORD,
        ssl: ENV.Server.IS_LOCAL_ENV ? undefined : { rejectUnauthorized: false },
      },
    });

    const config = { directory: migrationDirectory };
    const migration = await db.migrate.latest(config);
    Logger.info('Migration successfull: ', migration);

    return 'Migration Succeeded';
  } catch (e) {
    Logger.error('Error', e);
    throw e;
  } finally {
    if (db) {
      await db.destroy();
      db = undefined;
    }
  }
}
