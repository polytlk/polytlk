import { authMachine } from './auth-machine';

describe('authMachine', () => {
  it('should work', () => {
    expect(authMachine()).toEqual('auth-machine');
  });
});
