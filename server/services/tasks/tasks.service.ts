// Initializes the `tasks` service on path `/tasks`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/tasks.model';
import { Tasks } from './tasks.class';
import hooks from './tasks.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    tasks: Tasks & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/tasks', new Tasks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tasks');

  service.hooks(hooks);
}
