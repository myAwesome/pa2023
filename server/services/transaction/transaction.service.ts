// Initializes the `transaction` service on path `/transaction`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Transaction } from './transaction.class';
import createModel from '../../models/transaction.model';
import hooks from './transaction.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'transaction': Transaction & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/transaction', new Transaction(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transaction');

  service.hooks(hooks);
}
