import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'users';

  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('email').unique();
          table.string('password');
          table.string('googleId');
          table.string('facebookId');

          table.string('firstname');
          table.string('lastname');

          table.integer('wish_group_id');
          table.integer('transaction_group_id');
          table.integer('project_group_id');
          table.string('theme');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    }
  });

  return db;
}
