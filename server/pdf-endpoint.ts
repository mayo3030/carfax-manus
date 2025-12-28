/**
 * Simple PDF Generation Endpoint
 * Direct Express route for fast PDF generation
 */

import { Express } from 'express';
import { generateInstantReport } from './instant-report-generator';
import { generateCarfaxPDF } from './pdf-generator';

export function setupPDFEndpoint(app: Express) {
  /**
   * GET /pdf/:vin
   * Generate and download PDF report for a VIN
   * Usage: GET /pdf/SBM26ACA7MW815131
   */
  app.get('/pdf/:vin', async (req, res) => {
    try {
      const { vin } = req.params;

      // Validate VIN format
      if (!vin || vin.length !== 17) {
        return res.status(400).json({
          error: 'Invalid VIN format. VIN must be 17 characters.',
        });
      }

      // Generate report
      const report = generateInstantReport(vin);

      // Generate PDF
      const pdfBuffer = await generateCarfaxPDF(report);

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="carfax-report-${vin}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /report/:vin
   * Get JSON report for a VIN
   * Usage: GET /report/SBM26ACA7MW815131
   */
  app.get('/report/:vin', (req, res) => {
    try {
      const { vin } = req.params;

      // Validate VIN format
      if (!vin || vin.length !== 17) {
        return res.status(400).json({
          error: 'Invalid VIN format. VIN must be 17 characters.',
        });
      }

      // Generate report
      const report = generateInstantReport(vin);

      res.json({
        success: true,
        report,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
