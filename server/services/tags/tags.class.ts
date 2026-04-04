import { BadRequest } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';
import { KnexServiceOptions, Service } from 'feathers-knex';
import { Application } from '../../declarations';

type TagData = {
  name?: string;
};

const normalizeTagName = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
};

export class Tags extends Service {
  app: Application;

  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: 'tags',
    });
    this.app = app;
  }

  async find(params: Params) {
    const q = String(params.query?.q || '')
      .trim()
      .toLowerCase();
    const query = { ...(params.query || {}) };

    delete query.q;
    query.$sort = { name: 1 };

    if (q) {
      query.name = { $like: `%${q}%` };
    }

    return super.find({
      ...params,
      query,
    });
  }

  async create(data: TagData, params: Params) {
    const name = normalizeTagName(data?.name);
    if (!name) {
      throw new BadRequest('Tag name is required.');
    }

    const knex = this.app.get('knexClient');
    const existingTag = await knex('tags')
      .whereRaw('LOWER(name) = ?', [name])
      .first();

    if (existingTag) {
      return existingTag;
    }

    return super.create({ name }, params);
  }
}
