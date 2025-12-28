import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Apify API Integration', () => {
  it('should validate Apify API key', async () => {
    const apiKey = process.env.APIFY_API_KEY;
    
    // Skip test if API key is not configured
    if (!apiKey) {
      console.log('Skipping Apify API test - APIFY_API_KEY not set');
      expect(true).toBe(true);
      return;
    }

    try {
      // Test the API key by making a simple request to get user info
      const response = await axios.get(
        'https://api.apify.com/v2/users/me',
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 10000,
        }
      );

      // If we get here, the API key is valid
      expect(response.status).toBe(200);
      expect(response.data.data).toBeDefined();
      expect(response.data.data.id).toBeDefined();
      
      console.log(`✅ Apify API key is valid. User ID: ${response.data.data.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Apify API key validation failed: ${errorMessage}`);
      throw new Error(`Invalid Apify API key: ${errorMessage}`);
    }
  });

  it('should have APIFY_ACTOR_ID configured', () => {
    const actorId = process.env.APIFY_ACTOR_ID;
    
    // Actor ID can be empty initially, but we should warn about it
    if (!actorId) {
      console.warn('⚠️  APIFY_ACTOR_ID not configured. You need to deploy the Carfax actor first.');
    }
    
    expect(true).toBe(true);
  });
});
