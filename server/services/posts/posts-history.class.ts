import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';

export class PostsHistory extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'posts',
    });
    this.app = app;
  }

  async find(params: Params) {
    const knex = this.app.get('knexClient');
    if (params.query?.get === 'months') {
      return knex('posts')
        .select(
          knex.raw(
            "DATE_FORMAT(date, '%y-%m') as ym, DATE_FORMAT(date, '%M') as m, DATE_FORMAT(date, '%Y') y, COUNT(id) as count",
          ),
        )
        .where({ user_id: params.user?.id })
        .groupByRaw(
          "DATE_FORMAT(date, '%y-%m'), DATE_FORMAT(date, '%M'), DATE_FORMAT(date, '%Y')",
        );
    }
    let ym = new Date().toISOString().slice(5, 10);
    let dateFormat = '%m-%d';
    if (params.query?.ym) {
      dateFormat = '%y-%m';
      ym = params.query?.ym;
    }
    const posts = await knex('posts').whereRaw(
      `DATE_FORMAT(date, '${dateFormat}') = ? and posts.user_id = ?`,
      [ym, params.user?.id],
    );
    const populated = await Promise.all(
      posts.map(async (post: any) => {
        const [comments, labels, periods] = await Promise.all([
          knex('comments').where({ post_id: post.id }).orderBy('date'),
          knex('labels')
            .pluck('labels.id')
            .join('post_labels', 'post_labels.label_id', 'labels.id')
            .where({ post_id: post.id }),
          knex('periods').join(
            knex.raw(
              'posts on (posts.date BETWEEN periods.start AND IFNULL(periods.end, NOW())  AND posts.id = ? AND periods.user_id = ?)',
              [post.id, params.user?.id],
            ),
          ),
        ]);
        return { ...post, comments, labels, periods };
      }),
    );
    return populated;
  }
}
