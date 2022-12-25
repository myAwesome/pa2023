// Initializes the `transactionCategory` service on path `/transaction-category`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { TransactionCategory } from './transaction-category.class';
import createModel from '../../models/transaction-category.model';
import hooks from './transaction-category.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'transaction-category': TransactionCategory & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/transaction-category', new TransactionCategory(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transaction-category');

  service.hooks(hooks);
}
