import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.alterTable('users', (t) => {
   
    t.string('coverPhoto').nullable();
    t.string('introVideo').nullable();
    t.string('themeColor').nullable();
    t.jsonb('socialLinks').nullable();
    t.string('bio' , 2000).alter();
  })
}

function down(knex: Knex) {
    return knex.schema.alterTable('users', (t) => {
      t.dropColumn('is18Plus');
      t.dropColumn('profilePhoto');
      t.dropColumn('bio');
    })
}

export { up, down };
