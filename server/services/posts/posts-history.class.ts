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
    const posts = await this.app
      .get('knexClient')('posts')
      .whereRaw("DATE_FORMAT(date, '%m-%d') = ? and posts.user_id = ?", [
        new Date().toISOString().slice(5, 10),
        params.user?.id,
      ]);
    const populated = await Promise.all(
      posts.map(async (post: any) => {
        const [comments, labels, periods] = await Promise.all([
          this.app
            .get('knexClient')('comments')
            .where({ post_id: post.id })
            .orderBy('date'),
          this.app
            .get('knexClient')('labels')
            .pluck('labels.id')
            .join('post_labels', 'post_labels.label_id', 'labels.id')
            .where({ post_id: post.id }),
          this.app
            .get('knexClient')('periods')
            .join(
              this.app
                .get('knexClient')
                .raw(
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
