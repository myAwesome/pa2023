import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { MediaService } from './media.class';
import hooks from './media.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    media: MediaService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  (app as any).use('media', new MediaService(app));
  const service = app.service('media');
  service.hooks(hooks);
}
