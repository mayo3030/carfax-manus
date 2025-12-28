import axios from 'axios';

const APIFY_API_URL = 'https://api.apify.com/v2';
const CARFAX_ACTOR_ID = process.env.APIFY_ACTOR_ID || '';
const APIFY_API_KEY = process.env.APIFY_API_KEY || '';

interface CarfaxScrapingInput {
  vin: string;
  proxyUrl?: string;
}

interface CarfaxReport {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  color: string;
  mileage: number;
  engineType: string;
  transmission: string;
  fuelType: string;
  driveType: string;
  price: number;
  accidentCount: number;
  ownerCount: number;
  titleStatus: string;
  accidents: Array<{
    date: string;
    description: string;
    severity: string;
  }>;
  serviceHistory: Array<{
    date: string;
    type: string;
    mileage: number;
  }>;
  ownershipHistory: Array<{
    period: string;
    type: string;
    location: string;
  }>;
  scrapedAt: string;
}

export async function scrapeCarfaxData(vin: string): Promise<CarfaxReport> {
  if (!CARFAX_ACTOR_ID || !APIFY_API_KEY) {
    throw new Error('Apify Actor ID or API Key not configured');
  }

  if (vin.length !== 17) {
    throw new Error('Invalid VIN format');
  }

  try {
    // Start Apify Actor run
    const runResponse = await axios.post(
      `${APIFY_API_URL}/acts/${CARFAX_ACTOR_ID}/runs`,
      {
        vin: vin.toUpperCase(),
        proxyUrl: process.env.BRIGHT_DATA_PROXY_URL,
      },
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const runId = runResponse.data.data.id;
    console.log(`Started Apify run: ${runId}`);

    // Poll for completion
    let isRunning = true;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5 second intervals

    while (isRunning && attempts < maxAttempts) {
      const statusResponse = await axios.get(
        `${APIFY_API_URL}/acts/${CARFAX_ACTOR_ID}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${APIFY_API_KEY}`,
          },
        }
      );

      const status = statusResponse.data.data.status;
      console.log(`Run status: ${status}`);

      if (status === 'SUCCEEDED') {
        isRunning = false;
      } else if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Apify run failed with status: ${status}`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Apify run timeout');
    }

    // Get results from dataset
    const datasetResponse = await axios.get(
      `${APIFY_API_URL}/acts/${CARFAX_ACTOR_ID}/runs/${runId}/dataset/items`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    const items = datasetResponse.data.data;
    if (!items || items.length === 0) {
      throw new Error('No data returned from Apify Actor');
    }

    const report = items[0] as CarfaxReport;
    return report;

  } catch (error) {
    console.error('Error scraping Carfax:', error);
    throw error;
  }
}

export async function validateApifySetup(): Promise<boolean> {
  if (!CARFAX_ACTOR_ID || !APIFY_API_KEY) {
    console.error('Apify Actor ID or API Key not configured');
    return false;
  }

  try {
    const response = await axios.get(
      `${APIFY_API_URL}/acts/${CARFAX_ACTOR_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    console.log('Apify Actor validated successfully');
    return response.status === 200;
  } catch (error) {
    console.error('Error validating Apify setup:', error);
    return false;
  }
}
