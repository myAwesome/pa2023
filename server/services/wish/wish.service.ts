import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/wish.model';
import { Wish } from './wish.class';
import hooks from './wish.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    wish: Wish & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('wish', new Wish(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wish');

  service.hooks(hooks);
}
