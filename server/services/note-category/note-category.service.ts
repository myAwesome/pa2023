// Initializes the `noteCategory` service on path `/note-category`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/note-category.model';
import { NoteCategory } from './note-category.class';
import hooks from './note-category.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'note-category': NoteCategory & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/note-category', new NoteCategory(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('note-category');

  service.hooks(hooks);
}
