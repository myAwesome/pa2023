import { Knex } from 'knex';
import { Application } from '../declarations';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = 'posts';
  db.schema.hasTable(tableName).then((exists) => {
    if (!exists) {
      db.schema
        .createTable(tableName, (table) => {
          table.increments('id');
          table.string('body');
          table.string('weather').nullable();
          table.datetime('date');
          table.integer('user_id');
        })
        .then(() => console.log(`Created ${tableName} table`))
        .catch((e) => console.error(`Error creating ${tableName} table`, e));
    } else {
      db.schema.hasColumn(tableName, 'weather').then((hasWeather) => {
        if (!hasWeather) {
          db.schema
            .table(tableName, (table) => {
              table.string('weather').nullable();
            })
            .catch((e) =>
              console.error(
                `Error adding weather column to ${tableName} table`,
                e,
              ),
            );
        }
      });
    }
  });
  // Labels   []Label   `gorm:"many2many:posts_labels";"ForeignKey:PostId"`
  // Comments []Comment
  // Periods  []Period
  //
  return db;
}
