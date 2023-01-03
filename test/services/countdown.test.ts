import app from '../../server/app';

describe('\'countdown\' service', () => {
  it('registered the service', () => {
    const service = app.service('countdown');
    expect(service).toBeTruthy();
  });
});
