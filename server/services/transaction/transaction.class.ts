import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class Transaction extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'transaction',
    });
    this.app = app;
  }

  async find(params: Params) {
    if (params.query?.statistics) {
      const knex = this.app.get('knexClient');
      return knex('transaction')
        .select(
          knex.raw(
            'DATE_FORMAT(date, "%Y-%m") as date, category, SUM(amount) as sum',
          ),
        )
        .where({ group_id: params.query.group_id })
        .groupByRaw('DATE_FORMAT(date, "%Y-%m"), category');
    }
    if (params.query?.y && params.query?.m) {
      const { y, m, ...rest } = params.query || {};
      params.query = {
        ...rest,
        date: {
          $gte: `${y}-${m}-01`,
          $lt:
            Number(m) < 12
              ? `${y}-${Number(m) + 1}-01`
              : `${Number(y) + 1}-01-01`,
        },
      };
    }
    return await super.find(params);
  }
}
