// Initializes the `tasks` service on path `/tasks`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tasks } from './tasks.class';
import createModel from '../../models/tasks.model';
import hooks from './tasks.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tasks': Tasks & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tasks', new Tasks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tasks');

  service.hooks(hooks);
}
