// Initializes the `periods` service on path `/periods`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Periods } from './periods.class';
import createModel from '../../models/periods.model';
import hooks from './periods.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'periods': Periods & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/periods', new Periods(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('periods');

  service.hooks(hooks);
}
