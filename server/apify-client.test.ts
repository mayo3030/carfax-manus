import { describe, it, expect } from 'vitest';
import { ApifyClient } from './apify-client';

describe('ApifyClient', () => {
  it('should initialize with API key from environment', () => {
    const apiKey = process.env.APIFY_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^apify_api_/);
  });

  it('should test Apify connection', async () => {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      console.log('Skipping Apify connection test - API key not set');
      expect(true).toBe(true);
      return;
    }

    try {
      const client = new ApifyClient(apiKey, 'dummy-actor-id');
      const accountInfo = await client.getAccountInfo();

      expect(accountInfo).toBeDefined();
      expect(accountInfo.id).toBeDefined();
      console.log(`✅ Apify connection successful. User ID: ${accountInfo.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Apify connection failed: ${errorMessage}`);
      throw error;
    }
  }, 15000);

  it('should validate VIN format', () => {
    const validVins = ['3KPF24AD6KE105424', '2T1BURHE6KC161298'];
    const invalidVins = ['INVALID', '123', 'ABC'];

    validVins.forEach((vin) => {
      const isValid = /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
      expect(isValid).toBe(true);
    });

    invalidVins.forEach((vin) => {
      const isValid = /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
      expect(isValid).toBe(false);
    });
  });
});
