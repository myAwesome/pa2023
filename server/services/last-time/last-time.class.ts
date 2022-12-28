import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class LastTime extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'last_time',
    });
    this.app = app;
  }

  async find(params: Params) {
    const { query } = params;
    if (query?.expired) {
      const { expired, ...rest } = query || {};
      params.query = {
        ...rest,
        remind_after_days: {
          $lt: this.app.get('knexClient').raw('DATEDIFF(NOW(), date)'),
        },
      };
    }
    return await super.find(params);
  }
}
