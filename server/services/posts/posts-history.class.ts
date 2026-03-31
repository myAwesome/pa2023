import { Service, KnexServiceOptions } from 'feathers-knex';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { Knex } from 'knex';
import { Application } from '../../declarations';

const toDateOnly = (date: unknown): string => {
  const normalized = dayjs(date as any);
  if (normalized.isValid()) {
    return normalized.format('YYYY-MM-DD');
  }
  if (typeof date === 'string') {
    return date.slice(0, 10);
  }
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  return String(date).slice(0, 10);
};

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
    if (params.query?.get === 'labels' && params.query?.y) {
      const posts = await knex('posts')
        .select(
          knex.raw(
            "id, date, DATE_FORMAT(date, '%m') as m, DATE_FORMAT(date, '%d') as d",
          ),
        )
        .whereRaw(`DATE_FORMAT(date, '%Y') = ? and user_id = ?`, [
          params.query?.y,
          params.user?.id,
        ]);
      return Promise.all(
        posts.map(async (post: { id: number; date: string }) => {
          const labels = await knex('labels')
            .pluck('labels.id')
            .join('post_labels', 'post_labels.label_id', 'labels.id')
            .where({ post_id: post.id });
          return { labels, ...post };
        }),
      );
    }
    let ym = new Date().toISOString().slice(5, 10);
    let dateFormat = '%m-%d';
    if (params.query?.md) {
      ym = params.query.md;
    } else if (params.query?.ym) {
      dateFormat = '%y-%m';
      ym = params.query?.ym;
    }
    const posts = await knex('posts')
      .whereRaw(
        `DATE_FORMAT(date, '${dateFormat}') = ? and posts.user_id = ?`,
        [ym, params.user?.id],
      )
      .orderBy('date', 'desc');
    const populated = await Promise.all(
      posts.map(async (post: any) => {
        const postDate = toDateOnly(post.date);
        const [comments, labels, periods, contextSegments] = await Promise.all([
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
          knex('context_segments')
            .where({ user_id: params.user?.id })
            .where('start_date', '<=', postDate)
            .where((qb: Knex.QueryBuilder) => {
              qb.whereNull('end_date').orWhere('end_date', '>=', postDate);
            })
            .orderBy('start_date', 'desc'),
        ]);
        return {
          ...post,
          comments,
          labels,
          periods,
          context_segments: contextSegments,
        };
      }),
    );
    return populated;
  }
}
