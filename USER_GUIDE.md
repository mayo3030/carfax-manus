# Carfax Dashboard User Guide

## Overview

The Carfax Dashboard is a comprehensive web application designed to automate the scraping of Carfax vehicle history reports. This system allows you to submit Vehicle Identification Numbers (VINs) for automated scraping, track the progress of each submission, and view detailed vehicle history reports with interactive visualizations.

## Key Features

The dashboard provides several powerful features to streamline your vehicle history report workflow:

- **Single and Bulk VIN Submission**: Submit one VIN at a time or upload multiple VINs via CSV or text file
- **Real-time Status Tracking**: Monitor the scraping progress for each VIN submission with live status updates
- **Detailed Vehicle Reports**: View comprehensive vehicle history data including accidents, service records, and ownership history
- **Interactive Data Visualization**: Explore vehicle data through charts and organized displays
- **Export Functionality**: Download reports in JSON or CSV format for further analysis
- **Admin Panel**: Manage the scraping queue and configure safety settings (admin users only)

## Getting Started

### Logging In

When you first visit the Carfax Dashboard, you'll see the landing page with a description of the system's features. Click the **Get Started** button to log in using your Manus account credentials. The system uses Manus OAuth for secure authentication.

### Dashboard Overview

After logging in, you'll be redirected to the main dashboard. The dashboard consists of two main tabs:

1. **Submit VINs**: Where you can submit new VIN requests
2. **Submission History**: Where you can view all your past submissions and their status

## Submitting VINs

### Single VIN Submission

To submit a single VIN for scraping:

1. Navigate to the **Submit VINs** tab
2. In the **Single VIN** card, enter the 17-character VIN in the input field
3. The system will automatically convert the VIN to uppercase
4. A character counter shows your progress (e.g., "12/17 characters")
5. Click **Submit VIN** when the VIN is complete

The system validates that the VIN is exactly 17 characters before allowing submission.

### Bulk VIN Submission

To submit multiple VINs at once:

1. Navigate to the **Submit VINs** tab
2. In the **Bulk VINs** card, you have two options:
   - **Manual Entry**: Type or paste VINs into the text area, one per line or comma-separated
   - **File Upload**: Click **Choose File** and select a `.txt` or `.csv` file containing VINs

3. Click **Submit Bulk VINs** to process all valid VINs

The system automatically filters and validates VINs, accepting only those that are exactly 17 characters long.

## Viewing Submission History

The **Submission History** tab displays a table of all your VIN submissions with the following information:

| Column | Description |
|--------|-------------|
| **VIN** | The 17-character Vehicle Identification Number |
| **Status** | Current scraping status (Pending, Processing, Completed, Failed) |
| **Submitted** | Date and time when the VIN was submitted |
| **Completed** | Date and time when scraping finished (if applicable) |
| **Actions** | Available actions based on status |

### Status Indicators

Each submission displays a colored badge indicating its current status:

- **Pending** (Gray): The VIN is in the queue waiting to be scraped
- **Processing** (Blue): The n8n workflow is currently scraping this VIN
- **Completed** (Green): Scraping finished successfully, report is available
- **Failed** (Red): Scraping encountered an error

### Viewing Reports

When a submission status shows **Completed**, a **View Report** button appears in the Actions column. Click this button to view the detailed vehicle history report.

## Vehicle History Reports

The report detail page provides comprehensive information about the vehicle, organized into several sections.

### Vehicle Overview Cards

At the top of the report, four cards display key vehicle information:

- **Year**: The model year of the vehicle
- **Mileage**: Total miles driven
- **Price**: Current or last known price
- **Color**: Exterior color

### Vehicle Details

This section shows detailed specifications including:

- Make and Model
- Trim level
- Engine type
- Transmission type

### History Summary Chart

An interactive bar chart visualizes the total counts of:

- Accidents
- Previous owners
- Service records

### Detailed History Sections

Depending on the data available, you'll see detailed sections for:

#### Accident History

Each accident record includes:
- Date of the accident
- Description of the incident
- Severity level (if available)

Accident records are displayed with a red border for easy identification.

#### Service History

Each service record shows:
- Date of service
- Mileage at time of service
- Description of work performed
- Service shop name (if available)

Service records are displayed with a blue border.

#### Ownership History

Each ownership record includes:
- Owner number (1st owner, 2nd owner, etc.)
- Years of ownership
- Ownership type (personal, lease, commercial, etc.)

Ownership records are displayed with a light blue border.

## Exporting Reports

At the top of each vehicle report, you'll find two export buttons:

### JSON Export

Click **Export JSON** to download the complete report data in JSON format. This format is ideal for:
- Importing into other applications
- Programmatic data processing
- Archival purposes

The JSON file includes all vehicle details, history records, and metadata.

### CSV Export

Click **Export CSV** to download a simplified version of the report in CSV format. This format is ideal for:
- Importing into spreadsheet applications (Excel, Google Sheets)
- Quick data analysis
- Sharing with non-technical users

The CSV file includes key vehicle information and summary statistics.

## Admin Panel (Admin Users Only)

If your account has admin privileges, you'll see an **Admin Panel** button in the dashboard header. The admin panel provides two main tabs:

### Pending Queue

This tab displays all VINs currently waiting to be scraped by the n8n workflow. The table shows:

- Submission ID
- VIN
- User ID (who submitted it)
- Status
- Submission timestamp

This view helps you monitor the scraping queue and identify any bottlenecks.

### Scraping Settings

This tab allows you to configure the scraping behavior to maintain account safety:

#### Minimum Delay (milliseconds)

The shortest delay between actions during scraping. For example, setting this to 2000 means the scraper will wait at least 2 seconds between clicks, page loads, and other actions.

**Recommended range**: 2000-3000ms

#### Maximum Delay (milliseconds)

The longest delay between actions during scraping. The actual delay is randomized between the minimum and maximum values to simulate human behavior.

**Recommended range**: 4000-6000ms

#### Maximum Daily VINs

The maximum number of VINs to scrape per day. This limit helps prevent account suspicion by avoiding unusually high scraping volumes.

**Recommended range**: 50-100 VINs per day

### Account Safety Tips

The admin panel includes several important safety recommendations:

- Keep delays randomized between min and max values to avoid predictable patterns
- Monitor daily scraping volume to stay under the configured limit
- Increase delays if you notice any account warnings or unusual behavior
- Avoid scraping during peak hours (9 AM - 5 PM EST) when anti-bot systems are most active
- The Bright Data Browser API automatically rotates proxies, providing an additional layer of protection

## n8n Workflow Integration

The Carfax Dashboard works in conjunction with an n8n workflow that performs the actual scraping. The workflow:

1. Polls the database every 30 seconds for pending VINs
2. Processes VINs one at a time to avoid rate limiting
3. Connects to Carfax using the Bright Data Browser API
4. Logs in with your Carfax credentials
5. Navigates to the VIN report page
6. Extracts all vehicle history data
7. Updates the database with the scraped information

For detailed instructions on setting up the n8n workflow, refer to the **n8n Workflow Implementation Guide** document.

## Troubleshooting

### VIN Submission Issues

**Problem**: The Submit button is disabled even though I entered a VIN.

**Solution**: Ensure the VIN is exactly 17 characters long. The system validates VIN length before allowing submission.

---

**Problem**: Bulk VIN upload doesn't accept my file.

**Solution**: Make sure your file is in `.txt` or `.csv` format. Each VIN should be on a separate line or comma-separated.

### Report Viewing Issues

**Problem**: The "View Report" button doesn't appear for my completed submission.

**Solution**: Refresh the page. If the issue persists, the scraping may have completed but the report data wasn't saved. Check the admin panel for error messages.

---

**Problem**: The report shows "Report Not Found" even though the status is "Completed".

**Solution**: This indicates a database inconsistency. Contact your system administrator to investigate the issue.

### Export Issues

**Problem**: Export buttons don't download anything.

**Solution**: Check your browser's download settings and ensure pop-ups are not blocked. Try a different browser if the issue persists.

### Admin Panel Issues

**Problem**: I can't access the Admin Panel.

**Solution**: The Admin Panel is only available to users with the "admin" role. Contact your system administrator to request admin access.

---

**Problem**: Settings changes don't take effect.

**Solution**: After saving settings, the n8n workflow will use the new values on its next execution cycle (within 30 seconds). If changes still don't apply, verify the workflow is running correctly.

## Best Practices

To get the most out of the Carfax Dashboard while maintaining account safety:

### For Regular Users

1. **Submit VINs in batches**: Rather than submitting hundreds of VINs at once, break them into smaller batches spread throughout the day
2. **Check status regularly**: Monitor your submissions to identify any patterns of failures that might indicate an issue
3. **Export reports promptly**: Download important reports as soon as they're available to ensure you have a backup

### For Admin Users

1. **Monitor the queue**: Check the pending queue regularly to ensure the workflow is processing VINs at an acceptable rate
2. **Adjust delays conservatively**: When changing delay settings, make small incremental adjustments and monitor the results
3. **Track daily volume**: Keep an eye on daily scraping totals to ensure you're staying well under the configured limit
4. **Review failed submissions**: Investigate failed VINs to identify common issues (invalid VINs, network problems, website changes)

## Security and Privacy

The Carfax Dashboard implements several security measures to protect your data:

- **Authentication**: All users must authenticate via Manus OAuth before accessing the system
- **Authorization**: Users can only view their own submissions and reports
- **Role-based access**: Admin features are restricted to users with the admin role
- **Credential storage**: Carfax login credentials are stored securely in the n8n credential manager, not in the application database

## Support

If you encounter issues not covered in this guide, please contact your system administrator or refer to the technical documentation for more detailed troubleshooting steps.

---

**Document Version**: 1.0  
**Last Updated**: December 28, 2025  
**Author**: Manus AI
