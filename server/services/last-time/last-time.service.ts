// Initializes the `lastTime` service on path `/last-time`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LastTime } from './last-time.class';
import createModel from '../../models/last-time.model';
import hooks from './last-time.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'last-time': LastTime & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/last-time', new LastTime(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('last-time');

  service.hooks(hooks);
}
