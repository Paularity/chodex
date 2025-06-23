import { describe, it, expect } from 'vitest';
import { FakeAPI } from './fakeApi';

describe('FakeAPI', () => {
  it('sendOtp resolves for valid username', async () => {
    await expect(FakeAPI.sendOtp('user')).resolves.toBeUndefined();
  });

  it('sendOtp rejects for invalid username', async () => {
    await expect(FakeAPI.sendOtp('')).rejects.toThrowError();
    await expect(FakeAPI.sendOtp('fail')).rejects.toThrowError();
  });

  it('verifyOtp resolves for correct otp', async () => {
    await expect(FakeAPI.verifyOtp('123456')).resolves.toBeUndefined();
  });

  it('verifyOtp rejects for incorrect otp', async () => {
    await expect(FakeAPI.verifyOtp('000000')).rejects.toThrowError();
  });
});
