# Apify Actor Update Guide

## Overview

This guide explains how to update your Apify Actor to use `PuppeteerCrawler` instead of `CheerioCrawler` for proper Carfax login and VIN scraping.

## Why This Update is Needed

The current Actor uses `CheerioCrawler` which:
- ❌ Cannot handle JavaScript-rendered content
- ❌ Cannot interact with forms or buttons
- ❌ Cannot handle Carfax's login process
- ❌ Cannot extract dynamic data

The updated Actor uses `PuppeteerCrawler` which:
- ✅ Fully renders pages with JavaScript
- ✅ Can interact with forms and buttons
- ✅ Can handle Carfax login automatically
- ✅ Can extract all dynamic vehicle data

## Updated Actor Code

Replace the contents of your `src/main.ts` file with the following code:

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

## Step-by-Step Update Instructions

### Option 1: Using Apify Web IDE (Recommended)

1. **Open Your Actor**
   - Go to https://console.apify.com/actors
   - Click on "My Actor 1"
   - Click the "Source" tab

2. **Update main.ts**
   - Click on `src/main.ts` in the file tree on the left
   - Select all the code (Ctrl+A)
   - Delete it
   - Paste the new code from above
   - Click "Save"

3. **Build and Test**
   - Click "Save, Build & Start" button
   - Wait for the build to complete
   - Check the run results

### Option 2: Using Apify CLI (Advanced)

```bash
# 1. Install Apify CLI if not already installed
npm install -g apify-cli

# 2. Login to your Apify account
apify login

# 3. Pull the Actor code
apify pull rfPsbGDpcsRov0QEd --version 0.0

# 4. Update src/main.ts with the code above

# 5. Push changes back
apify push

# 6. Build and run
apify run
```

## Input Schema

Update your `input_schema.json` to match:

```json
{
  "type": "object",
  "properties": {
    "vin": {
      "type": "string",
      "description": "Vehicle Identification Number (17 characters)",
      "minLength": 17,
      "maxLength": 17
    }
  },
  "required": ["vin"]
}
```

## Testing

### Test with a Sample VIN

1. Go to your Actor's "Runs" tab
2. Click "Start with input"
3. Enter this test VIN: `ZAM57RTA0G1178033`
4. Click "Start"
5. Monitor the run logs

### Expected Output

The Actor should produce output like:

```json
{
  "vin": "ZAM57RTA0G1178033",
  "title": "2024 Alfa Romeo Stelvio",
  "scrapedAt": "2024-12-28T19:30:00.000Z",
  "source": "carfax.com",
  "pageTitle": "Vehicle History Report - Carfax"
}
```

## Troubleshooting

### Build Fails with "Module not found"

**Solution:** Ensure your `package.json` has the correct dependencies:

```json
{
  "dependencies": {
    "@crawlee/puppeteer": "^3.5.0",
    "crawlee": "^3.5.0"
  }
}
```

### Run Times Out

**Solution:** Increase `navigationTimeoutSecs` in the crawler config:

```typescript
const crawler = new PuppeteerCrawler({
  navigationTimeoutSecs: 120,  // Increased from 60
  // ... rest of config
});
```

### Carfax Login Fails

**Possible causes:**
1. Credentials are incorrect
2. Carfax changed their HTML structure
3. Carfax is blocking automated access

**Solution:** 
- Check the credentials in the code
- Inspect Carfax's login form to find correct selectors
- Consider using Carfax's official API if available

### Empty Results

**Possible causes:**
1. Page didn't load completely
2. Data extraction selectors are wrong
3. VIN format is invalid

**Solution:**
- Increase `waitForTimeout` values
- Inspect the page to find correct selectors
- Verify VIN format (must be exactly 17 characters)

## Integration with Dashboard

Once the Actor is updated and working:

1. **Test the connection** in your dashboard:
   - Go to Settings → Apify
   - Click "Test Connection"
   - Should show success message

2. **Submit a VIN** for scraping:
   - Go to "Submit Vehicle"
   - Enter a VIN
   - Click "Submit"
   - Monitor the status

3. **View Results**:
   - Go to "My Reports"
   - Click on a completed report
   - View the Carfax data

## Next Steps

After updating the Actor:

1. ✅ Test with sample VINs
2. ✅ Monitor run logs for errors
3. ✅ Adjust selectors if Carfax changes HTML
4. ✅ Integrate with n8n workflow
5. ✅ Set up automated scheduling

## Support

If you encounter issues:

1. Check the Actor's run logs for error messages
2. Verify credentials are correct
3. Inspect Carfax's page structure
4. Check Apify documentation: https://docs.apify.com/

## Version History

- **v0.0.1** (Current): Updated to use PuppeteerCrawler for Carfax login
- **v0.0.0**: Initial version with CheerioCrawler (deprecated)
