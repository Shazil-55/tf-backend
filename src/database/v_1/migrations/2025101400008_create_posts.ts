import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.createTable('posts', (t) => {
    t.uuid('id').unique().defaultTo(knex.raw('gen_random_uuid()')).primary();
    t.uuid('creatorId').references('id').inTable('users').notNullable();
    t.string('title').notNullable();
    t.text('content').notNullable();
    t.string('accessType').notNullable().defaultTo('free');
    t.specificType('tags', 'text[]').nullable();
    t.integer('totalLikes').notNullable().defaultTo(0);

    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());

    t.index(['creatorId'], 'posts_creatorId_index');
  }).raw(`
    DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp') THEN
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE
            ON "posts"
            FOR EACH ROW
            EXECUTE PROCEDURE update_timestamp();
          END IF;
        END $$;
  `)
}

function down(knex: Knex) {
  return knex.schema.raw(`
    DROP TABLE "posts";
  `);
}

export { up, down };
