import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { scrapeCarfaxData, validateApifySetup } from '../carfax-scraper';
import { getDb } from '../db';
import { vehicleReports } from '../../drizzle/schema';

export const carfaxRouter = router({
  scrapeVin: protectedProcedure
    .input(z.object({ vin: z.string().length(17), vinSubmissionId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(`Scraping Carfax for VIN: ${input.vin}`);
        
        const report = await scrapeCarfaxData(input.vin);
        
        const database = await getDb();
        if (database && input.vinSubmissionId) {
          await database.insert(vehicleReports).values({
            vinSubmissionId: input.vinSubmissionId,
            vin: report.vin,
            year: report.year,
            make: report.make,
            model: report.model,
            trim: report.trim,
            mileage: report.mileage,
            price: report.price,
            color: report.color,
            engineType: report.engineType,
            transmission: report.transmission,
            accidentCount: report.accidentCount,
            ownerCount: report.ownerCount,
            serviceRecordCount: report.serviceHistory.length,
            accidentHistory: JSON.stringify(report.accidents),
            serviceHistory: JSON.stringify(report.serviceHistory),
            ownershipHistory: JSON.stringify(report.ownershipHistory),
            titleInfo: JSON.stringify({ status: report.titleStatus }),
            additionalData: JSON.stringify({
              bodyType: report.bodyType,
              fuelType: report.fuelType,
              driveType: report.driveType,
            }),
          }).catch(err => {
            console.warn('Could not save to database:', err);
          });
        }

        return {
          success: true,
          report,
          message: 'Carfax data scraped successfully',
        };
      } catch (error) {
        console.error('Error scraping Carfax:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to scrape Carfax');
      }
    }),

  checkSetup: publicProcedure.query(async () => {
    try {
      const isValid = await validateApifySetup();
      return {
        configured: isValid,
        actorId: process.env.APIFY_ACTOR_ID ? '***' : 'not set',
        apiKey: process.env.APIFY_API_KEY ? '***' : 'not set',
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),
});
