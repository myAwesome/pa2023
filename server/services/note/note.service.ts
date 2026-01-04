// Initializes the `note` service on path `/note`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/note.model';
import { Note } from './note.class';
import hooks from './note.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    note: Note & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/note', new Note(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('note');

  service.hooks(hooks);
}
