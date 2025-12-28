import axios from 'axios';
import { saveScrapedVehicleData } from './db';

// Apify configuration
const APIFY_API_KEY = process.env.APIFY_API_KEY || '';
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || '';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

export interface ApifyRunResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  runId?: string;
}

/**
 * Start an Apify actor run to scrape Carfax data for a VIN
 */
export async function startCarfaxScraping(vin: string): Promise<ApifyRunResult> {
  try {
    if (!APIFY_API_KEY || !APIFY_ACTOR_ID) {
      throw new Error('Apify credentials not configured');
    }

    // Validate VIN
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    console.log(`[Apify] Starting scrape for VIN: ${vin}`);

    // Start the actor run
    const response = await axios.post(
      `${APIFY_BASE_URL}/acts/${APIFY_ACTOR_ID}/runs`,
      {
        vin: vin,
      },
      {
        headers: {
          Authorization: `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    const runId = response.data.data.id;
    console.log(`[Apify] Run started with ID: ${runId}`);

    return {
      success: true,
      runId: runId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Apify] Error starting scrape: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get the status and results of an Apify actor run
 */
export async function getCarfaxScrapingResult(runId: string): Promise<ApifyRunResult> {
  try {
    if (!APIFY_API_KEY) {
      throw new Error('Apify credentials not configured');
    }

    // Get run status
    const response = await axios.get(
      `${APIFY_BASE_URL}/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${APIFY_API_KEY}`,
        },
      }
    );

    const run = response.data.data;
    const status = run.status;

    console.log(`[Apify] Run ${runId} status: ${status}`);

    // If run is still running, return pending status
    if (status === 'RUNNING') {
      return {
        success: false,
        error: 'Run still in progress',
      };
    }

    // If run failed
    if (status === 'FAILED' || status === 'ABORTED') {
      return {
        success: false,
        error: `Run ${status}`,
      };
    }

    // If run succeeded, get the dataset
    if (status === 'SUCCEEDED') {
      const datasetId = run.defaultDatasetId;
      const dataResponse = await axios.get(
        `${APIFY_BASE_URL}/datasets/${datasetId}/items`,
        {
          headers: {
            Authorization: `Bearer ${APIFY_API_KEY}`,
          },
        }
      );

      const items = dataResponse.data;
      if (items.length > 0) {
        return {
          success: true,
          data: items[0],
          runId: runId,
        };
      }
    }

    return {
      success: false,
      error: 'No data returned from run',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Apify] Error getting result: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Process and save Carfax scraping results to database
 */
export async function processCarfaxResults(vinSubmissionId: number, vin: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    console.log(`[Apify] Processing results for VIN: ${vin}`);

    // Extract data from Apify response
    const vehicleData = {
      vinSubmissionId: vinSubmissionId,
      vin: vin,
      year: data.year as number | null,
      make: data.make as string,
      model: data.model as string,
      trim: data.trim as string,
      color: data.color as string,
      transmission: data.transmission as string,
      engine: data.engine as string,
      fuelType: data.fuelType as string,
      driveType: data.driveType as string,
      mileage: data.mileage as number | null,
      accidents: (data.accidents as number) || 0,
      owners: (data.owners as number) || 0,
      price: data.price as number | null,
      accidentHistory: JSON.stringify(data.accidentHistory || {}),
      ownershipHistory: JSON.stringify(data.ownershipHistory || {}),
      serviceRecords: JSON.stringify(data.serviceRecords || {}),
      mileageHistory: JSON.stringify(data.mileageHistory || {}),
    };

    // Save to database
    const result = await saveScrapedVehicleData(vehicleData);
    console.log(`[Apify] Data saved to database for VIN: ${vin}`);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Apify] Error processing results: ${errorMessage}`);
    return false;
  }
}

/**
 * Full workflow: Start scraping and poll for results
 */
export async function scrapeCarfaxAndSave(vinSubmissionId: number, vin: string): Promise<ApifyRunResult> {
  try {
    // Start the scraping
    const startResult = await startCarfaxScraping(vin);
    if (!startResult.success || !startResult.runId) {
      return startResult;
    }

    // Poll for results (with timeout)
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const result = await getCarfaxScrapingResult(startResult.runId);

      if (result.success && result.data) {
        // Process and save the results
        const saved = await processCarfaxResults(vinSubmissionId, vin, result.data);
        if (saved) {
          return {
            success: true,
            data: result.data,
            runId: startResult.runId,
          };
        }
      }

      if (result.error && !result.error.includes('still in progress')) {
        return result;
      }

      attempts++;
    }

    return {
      success: false,
      error: 'Scraping timeout after 10 minutes',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
