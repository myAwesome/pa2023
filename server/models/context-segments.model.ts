import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'context_segments';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('title');
          table.text('details');
          table.date('start_date');
          table.date('end_date').nullable();
          table.integer('user_id');
          table.datetime('created_at').defaultTo(db.fn.now());
          table.datetime('updated_at').defaultTo(db.fn.now());
          table.index(['user_id', 'start_date']);
          table.index(['user_id', 'end_date']);
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    }
  });
  return db;
}
