import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import * as oauthPkg from '@feathersjs/authentication-oauth';

import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const configureOauth =
    typeof (oauthPkg as any).oauth === 'function'
      ? (oauthPkg as any).oauth
      : typeof (oauthPkg as any).expressOauth === 'function'
        ? (oauthPkg as any).expressOauth
        : typeof oauthPkg === 'function'
          ? oauthPkg
          : null;

  if (!configureOauth) {
    throw new Error(
      'Failed to initialize OAuth: @feathersjs/authentication-oauth export is not callable.',
    );
  }

  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  (app as any).use('authentication', authentication);
  app.configure(configureOauth());
}
