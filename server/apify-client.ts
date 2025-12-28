/**
 * Apify Client Integration
 * Handles communication with Apify API for Carfax scraping
 */

import axios, { AxiosError } from 'axios';

interface ApifyRunInput {
  vins: string[];
  carfaxUsername?: string;
  carfaxPassword?: string;
  proxyUrl?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}

interface ApifyRun {
  id: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED_OUT' | 'ABORTED';
  startedAt: string;
  finishedAt?: string;
  stats: {
    inputCount: number;
    outputCount: number;
  };
}

interface ApifyDatasetItem {
  vin: string;
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  timestamp: string;
}

const APIFY_API_BASE = 'https://api.apify.com/v2';

export class ApifyClient {
  private apiKey: string;
  private actorId: string;

  constructor(apiKey?: string, actorId?: string) {
    this.apiKey = apiKey || process.env.APIFY_API_KEY || '';
    this.actorId = actorId || process.env.APIFY_ACTOR_ID || '';

    if (!this.apiKey) {
      throw new Error('APIFY_API_KEY environment variable is not set');
    }
    if (!this.actorId) {
      throw new Error('APIFY_ACTOR_ID environment variable is not set');
    }
  }

  /**
   * Start a new Apify run for scraping
   */
  async startRun(input: ApifyRunInput): Promise<ApifyRun> {
    try {
      const response = await axios.post(
        `${APIFY_API_BASE}/acts/${this.actorId}/runs`,
        { input },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to start Apify run: ${axiosError.response?.statusText || axiosError.message}`
      );
    }
  }

  /**
   * Get the status of a run
   */
  async getRun(runId: string): Promise<ApifyRun> {
    try {
      const response = await axios.get(`${APIFY_API_BASE}/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to get Apify run status: ${axiosError.response?.statusText || axiosError.message}`
      );
    }
  }

  /**
   * Get results from a completed run
   */
  async getRunResults(runId: string): Promise<ApifyDatasetItem[]> {
    try {
      const response = await axios.get(
        `${APIFY_API_BASE}/runs/${runId}/dataset/items`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to get Apify run results: ${axiosError.response?.statusText || axiosError.message}`
      );
    }
  }

  /**
   * Poll a run until completion
   */
  async pollRun(
    runId: string,
    maxAttempts: number = 600, // 10 minutes with 1s intervals
    intervalMs: number = 1000
  ): Promise<ApifyRun> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const run = await this.getRun(runId);

      if (run.status === 'SUCCEEDED' || run.status === 'FAILED' || run.status === 'TIMED_OUT') {
        return run;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Apify run ${runId} did not complete within ${maxAttempts} attempts`);
  }

  /**
   * Start a run and wait for completion
   */
  async runAndWait(input: ApifyRunInput): Promise<{
    run: ApifyRun;
    results: ApifyDatasetItem[];
  }> {
    // Start the run
    const run = await this.startRun(input);
    console.log(`Started Apify run: ${run.id}`);

    // Poll until completion
    const completedRun = await this.pollRun(run.id);
    console.log(`Apify run ${run.id} completed with status: ${completedRun.status}`);

    if (completedRun.status !== 'SUCCEEDED') {
      throw new Error(
        `Apify run failed with status: ${completedRun.status}`
      );
    }

    // Get results
    const results = await this.getRunResults(run.id);
    console.log(`Retrieved ${results.length} results from Apify run`);

    return { run: completedRun, results };
  }

  /**
   * Get account info (for testing API key)
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await axios.get(`${APIFY_API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to get Apify account info: ${axiosError.response?.statusText || axiosError.message}`
      );
    }
  }
}

/**
 * Singleton instance
 */
let apifyClient: ApifyClient | null = null;

export function getApifyClient(): ApifyClient {
  if (!apifyClient) {
    apifyClient = new ApifyClient();
  }
  return apifyClient;
}
