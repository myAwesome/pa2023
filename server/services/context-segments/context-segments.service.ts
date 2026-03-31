// Initializes the `context-segments` service on path `/context-segments`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/context-segments.model';
import { ContextSegments } from './context-segments.class';
import hooks from './context-segments.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'context-segments': ContextSegments & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  app.use('/context-segments', new ContextSegments(options, app));

  const service = app.service('context-segments');
  service.hooks(hooks);
}
