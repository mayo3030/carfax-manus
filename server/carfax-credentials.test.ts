import { describe, it, expect } from 'vitest';

describe('Carfax Credentials', () => {
  it('should have CARFAX_EMAIL and CARFAX_PASSWORD set', () => {
    const email = process.env.CARFAX_EMAIL;
    const password = process.env.CARFAX_PASSWORD;

    expect(email).toBeDefined();
    expect(password).toBeDefined();
    expect(email).toMatch(/@/); // Basic email validation
    expect(password!.length).toBeGreaterThan(5); // Password should be at least 6 chars
  });

  it('should validate email format', () => {
    const email = process.env.CARFAX_EMAIL;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(email).toMatch(emailRegex);
  });

  it('should have non-empty password', () => {
    const password = process.env.CARFAX_PASSWORD;
    expect(password).toBeTruthy();
    expect(password?.length).toBeGreaterThan(0);
  });
});
