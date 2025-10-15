import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.createTable('memberships', (t) => {
    t.uuid('id').unique().defaultTo(knex.raw('gen_random_uuid()')).primary();
    t.uuid('creatorId').unique().references('id').inTable('users').notNullable();
    t.string('name').notNullable();
    t.string('price').notNullable();
    t.string('currency').notNullable().defaultTo('NGN');
    t.string('description' , 2000).nullable();
   
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  }).raw(`
    DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp') THEN
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE
            ON "memberships"
            FOR EACH ROW
            EXECUTE PROCEDURE update_timestamp();
          END IF;
        END $$;
  `);
}

function down(knex: Knex) {
  return knex.schema.raw(`
    DROP TABLE "memberships";
  `);
}

export { up, down };
