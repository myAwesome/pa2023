// Initializes the `blog-post` service on path `/blog-post`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BlogPost } from './blog-post.class';
import createModel from '../../models/blog-post.model';
import hooks from './blog-post.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'blog-post': BlogPost & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    userAware: true,
  };

  // Initialize our service with any options it requires
  app.use('/blog-post', new BlogPost(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('blog-post');

  service.hooks(hooks);
}
