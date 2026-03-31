import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'periods';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('name');
          table.date('start');
          table.date('end');
          table.boolean('is_location').defaultTo(false);
          table.string('location_details').nullable();
          table.integer('user_id');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    } else {
      db.schema.hasColumn(tableName, 'is_location').then((hasIsLocation) => {
        if (!hasIsLocation) {
          db.schema
            .table(tableName, (table) => {
              table.boolean('is_location').defaultTo(false);
            })
            .catch((e) =>
              console.error(
                `Error adding is_location column to ${tableName} table`,
                e,
              ),
            );
        }
      });
      db.schema
        .hasColumn(tableName, 'location_details')
        .then((hasLocationDetails) => {
          if (!hasLocationDetails) {
            db.schema
              .table(tableName, (table) => {
                table.string('location_details').nullable();
              })
              .catch((e) =>
                console.error(
                  `Error adding location_details column to ${tableName} table`,
                  e,
                ),
              );
          }
        });
    }
  });
  return db;
}
