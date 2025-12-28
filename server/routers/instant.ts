/**
 * Instant Report Router
 * Provides fast report generation and PDF export
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { generateInstantReport, formatReportForPDF } from '../instant-report-generator';
import { generateCarfaxPDF } from '../pdf-generator';

export const instantRouter = router({
  /**
   * Get instant report for any VIN (< 100ms)
   */
  getReport: publicProcedure
    .input(z.object({ vin: z.string().min(17).max(17) }))
    .query(async ({ input }) => {
      const report = generateInstantReport(input.vin);
      return {
        success: true,
        report,
        generatedAt: new Date(),
      };
    }),

  /**
   * Generate PDF report (< 500ms)
   */
  generatePDF: publicProcedure
    .input(z.object({ vin: z.string().min(17).max(17) }))
    .mutation(async ({ input }) => {
      try {
        const report = generateInstantReport(input.vin);
        const pdfBuffer = await generateCarfaxPDF(report);

        return {
          success: true,
          pdfBase64: pdfBuffer.toString('base64'),
          filename: `carfax-report-${input.vin}.pdf`,
          size: pdfBuffer.length,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate PDF',
        };
      }
    }),

  /**
   * Get formatted text report
   */
  getTextReport: publicProcedure
    .input(z.object({ vin: z.string().min(17).max(17) }))
    .query(({ input }) => {
      const report = generateInstantReport(input.vin);
      const text = formatReportForPDF(report);
      return {
        success: true,
        text,
        report,
      };
    }),
});
