import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$;
  `);
}

function down(knex: Knex) {
  return knex.raw(`
    DROP FUNCTION IF EXISTS update_timestamp() CASCADE;
  `);
}

export { up, down };
