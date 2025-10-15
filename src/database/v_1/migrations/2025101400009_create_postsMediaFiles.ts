import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.createTable('postsMediaFiles', (t) => {
    t.uuid('id').unique().defaultTo(knex.raw('gen_random_uuid()')).primary();
    t.uuid('postId').references('id').inTable('posts').onDelete('CASCADE').notNullable();
    t.string('type').notNullable(); // image | video | audio | other
    t.text('url').notNullable();
    t.string('name').nullable();
    t.integer('size').nullable();

    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());

  }).raw(`
    DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp') THEN
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE
            ON "postsMediaFiles"
            FOR EACH ROW
            EXECUTE PROCEDURE update_timestamp();
          END IF;
        END $$;
  `);
}

function down(knex: Knex) {
  return knex.schema.raw(`
    DROP TABLE "postsMediaFiles";
  `);
}

export { up, down };


