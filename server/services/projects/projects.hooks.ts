import * as authentication from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const filterArchived = (context: HookContext) => {
  context.params.query = {
    archived: 0,
    ...(context.params.query || {}),
  };
};

export const filterByUserOrGroup = async (context: HookContext) => {
  context.params.query = {
    ...(context.params.query || {}),
    $or: [
      {
        user_id: context.params.user?.id,
      },
      {
        group_id: context.params.user?.project_group_id,
      },
    ],
  };
};

export default {
  before: {
    all: [authenticate('jwt')],
    find: [filterByUserOrGroup, filterArchived],
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
