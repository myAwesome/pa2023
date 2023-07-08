// Initializes the `watch` service on path `/watch`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/watch.model';
import { Watch } from './watch.class';
import hooks from './watch.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    watch: Watch & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/watch', new Watch(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('watch');

  service.hooks(hooks);
}
