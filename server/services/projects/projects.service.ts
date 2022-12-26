// Initializes the `projects` service on path `/projects`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/projects.model';
import { Projects } from './projects.class';
import hooks from './projects.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    projects: Projects & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/projects', new Projects(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('projects');

  service.hooks(hooks);
}
