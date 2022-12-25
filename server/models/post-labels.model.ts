// postLabels-model.ts - A KnexJS
//
// See http://knexjs.org/
// for more of what you can do here.
import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'post_labels';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('title');
          table.string('description');
          table.integer('priority');
          table.boolean('archived');
          table.datetime('created_at');
          table.integer('user_id');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    }
  });

  return db;
}
