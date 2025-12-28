/**
 * PDF Report Generator
 * Converts Carfax reports to PDF format instantly
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { CarfaxReport } from './instant-report-generator';

export async function generateCarfaxPDF(report: CarfaxReport): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  const fontSize = 12;
  const headerSize = 16;
  const margin = 40;
  let yPosition = height - margin;

  // Helper function to draw text
  const drawText = (text: string, size: number = fontSize, bold: boolean = false, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size,
      color,
      maxWidth: width - 2 * margin,
    });
    yPosition -= size + 4;
  };

  // Title
  drawText('CARFAX VEHICLE HISTORY REPORT', headerSize, true, rgb(37/255, 99/255, 235/255));
  yPosition -= 10;

  // VIN
  drawText(`VIN: ${report.vin}`, fontSize, true);
  yPosition -= 5;

  // Vehicle Info Section
  drawText('VEHICLE INFORMATION', 14, true);
  yPosition -= 5;
  drawText(`Year: ${report.year} | Make: ${report.make} | Model: ${report.model}`);
  drawText(`Trim: ${report.trim} | Color: ${report.color}`);
  drawText(`Engine: ${report.engineType}`);
  drawText(`Transmission: ${report.transmission}`);
  drawText(`Mileage: ${report.mileage.toLocaleString()} miles`);
  drawText(`Estimated Value: $${report.price.toLocaleString()}`);
  yPosition -= 10;

  // Vehicle Status
  drawText('VEHICLE STATUS', 14, true);
  yPosition -= 5;
  const titleInfo = JSON.parse(report.titleInfo);
  drawText(`Title Status: ${titleInfo.status}`);
  drawText(`Owners: ${report.ownerCount}`);
  drawText(`Accidents: ${report.accidentCount}`);
  yPosition -= 10;

  // Service History
  drawText('SERVICE HISTORY', 14, true);
  yPosition -= 5;
  const serviceHistory = JSON.parse(report.serviceHistory);
  serviceHistory.forEach((service: any) => {
    drawText(`• ${service.date}: ${service.type} (${service.mileage?.toLocaleString()} miles)`);
  });
  yPosition -= 10;

  // Accident History
  drawText('ACCIDENT HISTORY', 14, true);
  yPosition -= 5;
  const accidentHistory = JSON.parse(report.accidentHistory);
  if (accidentHistory.length > 0) {
    accidentHistory.forEach((accident: any) => {
      drawText(`• ${accident.date}: ${accident.type}`);
      if (accident.description) {
        drawText(`  ${accident.description}`, fontSize - 1);
      }
    });
  } else {
    drawText('No accidents reported', fontSize, false, rgb(34/255, 197/255, 94/255));
  }
  yPosition -= 10;

  // Ownership History
  drawText('OWNERSHIP HISTORY', 14, true);
  yPosition -= 5;
  const ownershipHistory = JSON.parse(report.ownershipHistory);
  ownershipHistory.forEach((owner: any) => {
    drawText(`${owner.period}: ${owner.type} - ${owner.location}`);
  });

  // Footer
  yPosition = 30;
  drawText(`Report Generated: ${new Date().toLocaleString()}`, 10, false, rgb(128/255, 128/255, 128/255));
  drawText('This is an instant Carfax report for demonstration purposes', 10, false, rgb(128/255, 128/255, 128/255));

  return Buffer.from(await pdfDoc.save());
}
