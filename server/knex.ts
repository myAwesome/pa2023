import knex from 'knex';
import { Application } from './declarations';

export default function (app: Application): void {
  const { client, connection } = app.get('mysql');
  const db = knex({ client, connection });

  app.set('knexClient', db);
}
