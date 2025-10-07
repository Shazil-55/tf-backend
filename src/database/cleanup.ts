/* eslint-disable */
import dotenv from 'dotenv';
const result = dotenv.config();

import Path from 'path';
import knex, { Knex } from 'knex';
import { ENV } from '../helpers/env';
import { Logger } from '../helpers/logger';

(async () => {
  await cleanUpDatabase();
})();

async function cleanUpDatabase() {
  if (ENV.Server.IS_LOCAL_ENV) {
    Logger.info('Getting ready to cleanup...');
    Logger.info('Connecting database');

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

      const query = db.raw(
        `
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        `,
      );
      Logger.debug(query.toSQL().toNative());
      await query;
      Logger.info('Database cleaned asim');
    } catch (e) {
      console.error('Error', e);
      throw e;
    } finally {
      if (db) {
        await db.destroy();
        db = undefined;
      }
    }
  } else {
    Logger.info('Not in local environment');
  }
}
