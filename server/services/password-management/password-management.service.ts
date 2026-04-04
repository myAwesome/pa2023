import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PasswordManagement } from './password-management.class';
import hooks from './password-management.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'password-management': PasswordManagement & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  (app as any).use('password-management', new PasswordManagement(app));

  const service = app.service('password-management');
  service.hooks(hooks);
}
