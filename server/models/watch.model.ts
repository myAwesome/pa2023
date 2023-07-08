import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'watch';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('name');
          table.string('type');
          table.integer('rating');
          table.boolean('is_seen').defaultTo(true);
          table.datetime('last_seen').defaultTo(db.fn.now());
          table.datetime('created_at').defaultTo(db.fn.now());
          table.integer('user_id');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    }
  });
  return db;
}
