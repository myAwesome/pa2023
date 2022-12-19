import app from '../../src/app';

describe('\'wish\' service', () => {
  it('registered the service', () => {
    const service = app.service('wish');
    expect(service).toBeTruthy();
  });
});
