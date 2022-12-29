import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class PostLabels extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'post_labels',
    });
    this.app = app;
  }

  async remove(id: number | null, params: Params) {
    const { post_id, label_id } = params.query || {};
    if (post_id && label_id) {
      return this.app
        .get('knexClient')('post_labels')
        .where({
          post_id,
          label_id,
        })
        .delete();
    } else {
      return super.remove(id, params);
    }
  }
}
