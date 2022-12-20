import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class Users extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'users',
    });
  }
  async get(id: string, params: Params): Promise<any> {
    const { user } = params;
    if (id === 'me') return user;
    return await super.get(id, params);
  }
}
