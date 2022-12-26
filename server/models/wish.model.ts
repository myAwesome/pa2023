// wish-model.ts - A KnexJS
//
// See http://knexjs.org/
// for more of what you can do here.
import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'wish';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.boolean('is_done').defaultTo(false);
          table.string('name');
          table.string('picture');
          table.dateTime('created_at').defaultTo(db.fn.now());
          table.integer('price_from');
          table.integer('price_to');
          table.integer('user_id');
          table.integer('group_id');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    }
  });

  return db;
}
