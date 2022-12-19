import app from '../../server/app';

describe('\'wish\' service', () => {
  it('registered the service', () => {
    const service = app.service('wish');
    expect(service).toBeTruthy();
  });
});
