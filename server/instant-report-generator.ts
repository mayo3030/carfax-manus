/**
 * Instant Carfax Report Generator
 * Generates complete vehicle reports instantly (< 500ms)
 * Used for demo/testing purposes
 */

// Instant report generation - no external dependencies needed

export interface CarfaxReport {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  color: string;
  engineType: string;
  transmission: string;
  accidentCount: number;
  ownerCount: number;
  serviceRecordCount: number;
  accidentHistory: string;
  serviceHistory: string;
  ownershipHistory: string;
  titleInfo: string;
  additionalData: string;
}

// Mock Carfax data database - maps VIN patterns to realistic data
const mockCarfaxDatabase: Record<string, CarfaxReport> = {
  'SBM26ACA7MW815131': {
    vin: 'SBM26ACA7MW815131',
    year: 2022,
    make: 'BMW',
    model: '3 Series',
    trim: '330i',
    mileage: 28450,
    price: 35900,
    color: 'Alpine White',
    engineType: '2.0L Turbocharged 4-Cylinder',
    transmission: 'Automatic 8-Speed',
    accidentCount: 0,
    ownerCount: 1,
    serviceRecordCount: 3,
    accidentHistory: '[]',
    serviceHistory: JSON.stringify([
      { date: '2024-01-15', type: 'Oil Change', mileage: 25000 },
      { date: '2023-08-20', type: 'Tire Rotation', mileage: 20000 },
      { date: '2023-03-10', type: 'Air Filter Replacement', mileage: 15000 }
    ]),
    ownershipHistory: JSON.stringify([
      { period: '2022-Present', type: 'Personal', location: 'California' }
    ]),
    titleInfo: JSON.stringify({ status: 'Clean', type: 'Sedan' }),
    additionalData: JSON.stringify({
      fuelType: 'Gasoline',
      driveType: 'RWD',
      bodyType: 'Sedan',
      doors: 4,
      mpg: '26 city / 35 highway'
    })
  },
  '3KPF24AD6KE105424': {
    vin: '3KPF24AD6KE105424',
    year: 2014,
    make: 'Hyundai',
    model: 'Santa Fe',
    trim: 'GLS',
    mileage: 145230,
    price: 12995,
    color: 'Silver',
    engineType: '2.0L 4-Cylinder',
    transmission: 'Automatic',
    accidentCount: 1,
    ownerCount: 2,
    serviceRecordCount: 8,
    accidentHistory: JSON.stringify([
      { date: '2019-03-15', type: 'Minor Accident', severity: 'Minor', description: 'Side impact, minor damage to door' }
    ]),
    serviceHistory: JSON.stringify([
      { date: '2023-01-10', type: 'Oil Change', mileage: 140000 },
      { date: '2022-06-15', type: 'Tire Rotation', mileage: 135000 },
      { date: '2022-01-20', type: 'Brake Service', mileage: 130000 }
    ]),
    ownershipHistory: JSON.stringify([
      { period: '2014-2018', type: 'Personal', location: 'California' },
      { period: '2018-Present', type: 'Personal', location: 'Texas' }
    ]),
    titleInfo: JSON.stringify({ status: 'Clean', type: 'SUV' }),
    additionalData: JSON.stringify({
      fuelType: 'Gasoline',
      driveType: 'AWD',
      bodyType: 'SUV',
      doors: 4
    })
  },
  '2T1BURHE6KC161298': {
    vin: '2T1BURHE6KC161298',
    year: 2019,
    make: 'Toyota',
    model: 'Corolla',
    trim: 'LE',
    mileage: 67890,
    price: 18500,
    color: 'Black',
    engineType: '1.8L 4-Cylinder',
    transmission: 'Automatic CVT',
    accidentCount: 0,
    ownerCount: 1,
    serviceRecordCount: 5,
    accidentHistory: '[]',
    serviceHistory: JSON.stringify([
      { date: '2023-11-05', type: 'Oil Change', mileage: 65000 },
      { date: '2023-05-20', type: 'Tire Rotation', mileage: 60000 }
    ]),
    ownershipHistory: JSON.stringify([
      { period: '2019-Present', type: 'Personal', location: 'Florida' }
    ]),
    titleInfo: JSON.stringify({ status: 'Clean', type: 'Sedan' }),
    additionalData: JSON.stringify({
      fuelType: 'Gasoline',
      driveType: 'FWD',
      bodyType: 'Sedan',
      doors: 4
    })
  }
};

/**
 * Generate instant Carfax report for any VIN
 * Returns mock data instantly (< 100ms)
 */
export function generateInstantReport(vin: string): CarfaxReport {
  // Check if VIN exists in mock database
  if (mockCarfaxDatabase[vin]) {
    return mockCarfaxDatabase[vin];
  }

  // Generate realistic mock data for unknown VINs
  const year = 2015 + Math.floor(Math.random() * 10);
  const makes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia'];
  const models: Record<string, string[]> = {
    'Honda': ['Civic', 'Accord', 'CR-V'],
    'Toyota': ['Camry', 'Corolla', 'RAV4'],
    'Ford': ['F-150', 'Mustang', 'Escape'],
    'Chevrolet': ['Silverado', 'Malibu', 'Equinox'],
    'BMW': ['3 Series', '5 Series', 'X5'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC'],
    'Audi': ['A4', 'A6', 'Q5'],
    'Hyundai': ['Elantra', 'Sonata', 'Santa Fe'],
    'Kia': ['Optima', 'Sportage', 'Sorento']
  };

  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[make][Math.floor(Math.random() * models[make].length)];
  const mileage = 30000 + Math.floor(Math.random() * 150000);
  const price = 8000 + Math.floor(Math.random() * 40000);
  const accidents = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0;
  const owners = 1 + Math.floor(Math.random() * 3);

  return {
    vin,
    year,
    make,
    model,
    trim: 'Standard',
    mileage,
    price,
    color: ['Silver', 'Black', 'White', 'Gray', 'Blue', 'Red'][Math.floor(Math.random() * 6)],
    engineType: ['2.0L 4-Cylinder', '2.5L 4-Cylinder', '3.0L V6', '3.5L V6'][Math.floor(Math.random() * 4)],
    transmission: ['Automatic', 'Manual', 'CVT'][Math.floor(Math.random() * 3)],
    accidentCount: accidents,
    ownerCount: owners,
    serviceRecordCount: 3 + Math.floor(Math.random() * 8),
    accidentHistory: accidents > 0 ? JSON.stringify([
      { date: '2020-06-15', type: 'Minor Accident', severity: 'Minor' }
    ]) : '[]',
    serviceHistory: JSON.stringify([
      { date: new Date().toISOString().split('T')[0], type: 'Oil Change', mileage },
      { date: '2024-06-15', type: 'Tire Rotation', mileage: mileage - 5000 }
    ]),
    ownershipHistory: JSON.stringify([
      { period: `${year}-Present`, type: 'Personal', location: 'USA' }
    ]),
    titleInfo: JSON.stringify({ status: accidents > 0 ? 'Salvage' : 'Clean', type: 'Vehicle' }),
    additionalData: JSON.stringify({
      fuelType: 'Gasoline',
      driveType: 'FWD',
      bodyType: 'Sedan',
      doors: 4
    })
  };
}

/**
 * Format report for PDF generation
 */
export function formatReportForPDF(report: CarfaxReport): string {
  const serviceHistory = JSON.parse(report.serviceHistory);
  const accidentHistory = JSON.parse(report.accidentHistory);
  const ownershipHistory = JSON.parse(report.ownershipHistory);

  const serviceTable = serviceHistory
    .map((s: any) => `• ${s.date}: ${s.type} (${s.mileage?.toLocaleString()} miles)`)
    .join('\n');

  const accidentTable = accidentHistory.length > 0
    ? accidentHistory.map((a: any) => `• ${a.date}: ${a.type} - ${a.description || 'No details'}`).join('\n')
    : 'No accidents reported';

  return `
CARFAX VEHICLE HISTORY REPORT
═══════════════════════════════════════════════════════════

VIN: ${report.vin}

VEHICLE INFORMATION
───────────────────────────────────────────────────────────
Year:           ${report.year}
Make:           ${report.make}
Model:          ${report.model}
Trim:           ${report.trim}
Color:          ${report.color}
Engine:         ${report.engineType}
Transmission:   ${report.transmission}
Mileage:        ${report.mileage.toLocaleString()} miles
Estimated Value: $${report.price.toLocaleString()}

VEHICLE STATUS
───────────────────────────────────────────────────────────
Title Status:   ${JSON.parse(report.titleInfo).status}
Owners:         ${report.ownerCount}
Accidents:      ${report.accidentCount}

SERVICE HISTORY
───────────────────────────────────────────────────────────
${serviceTable}

ACCIDENT HISTORY
───────────────────────────────────────────────────────────
${accidentTable}

OWNERSHIP HISTORY
───────────────────────────────────────────────────────────
${ownershipHistory.map((o: any) => `${o.period}: ${o.type} - ${o.location}`).join('\n')}

═══════════════════════════════════════════════════════════
Report Generated: ${new Date().toLocaleString()}
This is an instant Carfax report generated for demonstration purposes.
  `;
}
