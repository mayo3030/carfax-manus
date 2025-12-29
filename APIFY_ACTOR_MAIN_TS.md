# Apify Actor - Corrected main.ts

Copy this entire code and paste it into your Actor's `src/main.ts` file in the Apify Web IDE.

```typescript
import { PuppeteerCrawler, Dataset, log } from 'crawlee';

interface Input {
  vin: string;
}

const crawler = new PuppeteerCrawler({
  maxRequestsPerCrawl: 1,
  navigationTimeoutSecs: 60,
  async requestHandler({ page, request }) {
    const vin = request.userData.vin as string;
    
    log.info(`Processing VIN: ${vin}`);
    
    try {
      log.info('Navigating to Carfax...');
      await page.goto('https://www.carfax.com/', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      
      // Try to find and fill email
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.type('RFox1708D@Gmail.Com', { delay: 50 });
      }
      
      // Fill password
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.type('D4n1$1708-', { delay: 50 });
      }
      
      // Submit login
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {
          log.warn('Navigation timeout');
        });
      }
      
      await page.waitForTimeout(2000);
      
      // Search for VIN
      const vinInput = await page.$('input[placeholder*="VIN"]');
      if (vinInput) {
        await vinInput.type(vin, { delay: 50 });
      }
      
      const searchButton = await page.$('button:has-text("Search")');
      if (searchButton) {
        await searchButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {
          log.warn('Navigation timeout');
        });
      }
      
      await page.waitForTimeout(3000);
      
      // Extract data
      const vehicleData = await page.evaluate(() => {
        return {
          vin: '',
          title: document.querySelector('h1')?.textContent?.trim() || '',
          scrapedAt: new Date().toISOString(),
          source: 'carfax.com',
          pageTitle: document.title,
        };
      });
      
      vehicleData.vin = vin;
      log.info('Vehicle data:', vehicleData);
      
      await Dataset.pushData(vehicleData);
      log.info('Carfax scrape completed');
      
    } catch (error) {
      log.error('Error during scraping:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },
});

const input: Input = await crawler.getInput() as Input;
const vin = input?.vin || 'ZAM57RTA0G1178033';

if (!vin || vin.length !== 17) {
  throw new Error('Invalid VIN format. Must be 17 characters.');
}

await crawler.run([{
  url: 'https://www.carfax.com/',
  userData: { vin },
}]);

log.info('Crawler finished');
```

## Key Changes from Original

| Aspect | Original | Updated |
|--------|----------|---------|
| **Crawler Type** | `CheerioCrawler` | `PuppeteerCrawler` |
| **JavaScript Support** | ❌ No | ✅ Yes |
| **Form Interaction** | ❌ No | ✅ Yes |
| **Login Support** | ❌ No | ✅ Yes |
| **Dynamic Data** | ❌ No | ✅ Yes |
| **Timeout** | 30s | 60s |
| **Data Extraction** | Static HTML | JavaScript evaluation |

## Installation Steps

1. **Open Apify Console**
   - Go to https://console.apify.com/actors
   - Select "My Actor 1"

2. **Navigate to Source**
   - Click "Source" tab
   - Click "src/main.ts" in the file tree

3. **Replace Code**
   - Select all (Ctrl+A)
   - Delete
   - Paste the code above
   - Click "Save"

4. **Build**
   - Click "Save, Build & Start"
   - Wait for build to complete

5. **Test**
   - Enter VIN: `ZAM57RTA0G1178033`
   - Click "Start"
   - Monitor logs

## Verification Checklist

- [ ] Code is pasted correctly
- [ ] No syntax errors in build
- [ ] Build completes successfully
- [ ] Test run with sample VIN
- [ ] Output contains vehicle data
- [ ] No timeout errors
- [ ] Carfax login works
