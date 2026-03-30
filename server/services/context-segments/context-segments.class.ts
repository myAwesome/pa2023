import { BadRequest, NotFound } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { KnexServiceOptions, Service } from 'feathers-knex';
import { Application } from '../../declarations';

type ContextSegmentData = {
  mode?: 'split';
  splitDate?: string;
  newTitle?: string;
  newDetails?: string;
  title?: string;
  details?: string;
  start_date?: string;
  end_date?: string | null;
};

export class ContextSegments extends Service {
  app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'context_segments',
    });
    this.app = app;
  }

  async find(params: Params) {
    const date = params.query?.date;
    const isActiveQuery = params.query?.active;

    if (date && isActiveQuery) {
      const knex = this.app.get('knexClient');
      return knex('context_segments')
        .where({ user_id: params.user?.id })
        .where('start_date', '<=', date)
        .where((qb) => {
          qb.whereNull('end_date').orWhere('end_date', '>=', date);
        })
        .orderBy('start_date', 'desc');
    }

    return super.find(params);
  }

  async patch(id: string | number, data: ContextSegmentData, params: Params) {
    if (data?.mode !== 'split') {
      return super.patch(id, data, params);
    }

    if (!id) {
      throw new BadRequest('Segment id is required for split.');
    }

    if (!data.splitDate) {
      throw new BadRequest('splitDate is required.');
    }

    const oldSegment = await super.get(id, params);
    if (!oldSegment) {
      throw new NotFound('Context segment not found.');
    }

    const splitDate = dayjs(data.splitDate).format('YYYY-MM-DD');
    const oldStartDate = dayjs(oldSegment.start_date).format('YYYY-MM-DD');
    const oldEndDate = oldSegment.end_date
      ? dayjs(oldSegment.end_date).format('YYYY-MM-DD')
      : null;

    if (splitDate < oldStartDate || (oldEndDate && splitDate > oldEndDate)) {
      throw new BadRequest('splitDate must be within the segment date range.');
    }

    if (splitDate === oldStartDate) {
      return super.patch(
        id,
        {
          title: data.newTitle ?? oldSegment.title,
          details: data.newDetails ?? oldSegment.details,
        },
        params,
      );
    }

    const previousEndDate = dayjs(splitDate)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    await super.patch(
      id,
      {
        end_date: previousEndDate,
      },
      params,
    );

    return super.create(
      {
        user_id: oldSegment.user_id,
        title: data.newTitle ?? oldSegment.title,
        details: data.newDetails ?? oldSegment.details,
        start_date: splitDate,
        end_date: oldEndDate,
      },
      params,
    );
  }
}
