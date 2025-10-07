import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.createTable('users', (t) => {
    t.uuid('id').unique().defaultTo(knex.raw('gen_random_uuid()')).primary();
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.string('password').nullable();
    t.string('pageName').nullable().unique();
    t.string('creatorName').nullable();
    t.boolean('is18Plus').nullable();
    t.string('profilePhoto').nullable();
    t.string('bio').nullable();

    // t.uuid('companyId').references('id').inTable('companies').nullable();
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  }).raw(`
    DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_timestamp') THEN
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE
            ON "users"
            FOR EACH ROW
            EXECUTE PROCEDURE update_timestamp();
          END IF;
        END $$;
  `);
}

function down(knex: Knex) {
  return knex.schema.raw(`
    DROP TABLE "users";
  `);
}

export { up, down };
