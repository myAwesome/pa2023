import { Service, KnexServiceOptions } from 'feathers-knex';
import { Application } from '../../declarations';

export class Tasks extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'tasks',
    });
    this.app = app;
  }

  createQuery(params: any) {
    const query = super.createQuery(params);

    if (params.user?.project_group_id) {
      query.join(
        this.app
          .get('knexClient')
          .raw(
            'projects AS project ON tasks.project_id = project.id AND (project.group_id = ? OR project.user_id = ?)',
            [params.user?.project_group_id, params.user?.id],
          ),
      );
    }

    return query;
  }
}
