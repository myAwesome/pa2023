import { Application as ExpressFeathers } from '@feathersjs/express';
import { Params as FeathersParams } from '@feathersjs/feathers';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {
  [key: string]: any;
}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

declare module '@feathersjs/feathers' {
  interface Params<Q = any> extends FeathersParams<Q> {
    user?: any;
  }
}
