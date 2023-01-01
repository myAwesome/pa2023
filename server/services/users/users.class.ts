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
  async patch(id: string, data: any, params: Params): Promise<any> {
    const { user } = params;
    let userId = id;
    if (id === 'me') {
      userId = user?.id;
    }
    return await super.patch(userId, data, params);
  }
}
