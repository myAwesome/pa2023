// Initializes the `postLabels` service on path `/post-labels`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/post-labels.model';
import { PostLabels } from './post-labels.class';
import hooks from './post-labels.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'post-labels': PostLabels & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/post-labels', new PostLabels(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('post-labels');

  service.hooks(hooks);
}
