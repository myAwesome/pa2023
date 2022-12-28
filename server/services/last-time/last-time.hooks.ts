import { HookContext } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
import { filterByUser } from '../../app.hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const addExpiredColumn = (context: HookContext) => {
  context.params.query = {
    ...(context.params.query || {}),
    $select: [
      '*',
      context.app
        .get('knexClient')
        .raw('DATEDIFF(NOW(), date) > remind_after_days as expired'),
    ],
    $sort: {
      ...(context.params.query?.sort || {}),
      expired: 'desc',
      date: 'desc',
    },
  };
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [filterByUser, addExpiredColumn],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
