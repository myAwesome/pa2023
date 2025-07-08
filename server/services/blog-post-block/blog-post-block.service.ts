// Initializes the `blog-post-block` service on path `/blog-post-block`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import createModel from '../../models/blog-post-block.model';
import { BlogPostBlock } from './blog-post-block.class';
import hooks from './blog-post-block.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'blog-post-block': BlogPostBlock & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/blog-post-block', new BlogPostBlock(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('blog-post-block');

  service.hooks(hooks);
}
