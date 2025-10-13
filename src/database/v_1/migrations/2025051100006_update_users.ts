import { Knex } from 'knex';

function up(knex: Knex) {
  return knex.schema.alterTable('users', (t) => {
   
    t.specificType('tags' , 'text[]').nullable();
    t.uuid('categoryId').references('id').inTable('categories').nullable();
  })
}

function down(knex: Knex) {
    return knex.schema.alterTable('users', (t) => {
      t.dropColumn('tags');
      t.dropColumn('categoryId');
    })
}

export { up, down };
