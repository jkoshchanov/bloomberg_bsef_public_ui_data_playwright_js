# Bloomberg SEF Production Public Website Validation

Automated Playwright test suite that validates the Bloomberg SEF (Swap Execution Facility) historical data public website.

## Prerequisites

- **Node.js** (v16 or later)
- **npm** (comes with Node.js)

## Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd playwright_automation
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers (if not already installed):

   ```bash
   npx playwright install
   ```

## What the Test Does

The main test (`tests/bloomberg_public_bsef_website_data.js`) performs the following validations:

1. Opens the Bloomberg SEF staging website.
2. Verifies the page title and "End Of Day Data" heading.
3. Confirms the calendar/date widget is visible and defaults to **yesterday's date**.
4. *(Optional)* If a `TRADE_DATE` is provided, sets the calendar widget to the specified date and verifies it was applied.
5. Clicks the **Foreign Exchange** tab and verifies it becomes active.
6. Validates the data grid is visible with all expected column headers.
7. Fetches and logs all grid row data to the console.
8. Verifies the **Aggregated Total** row exists.
9. *(Optional)* If a trade fixture file exists for the active date, validates that each expected trade appears in the grid.

## Trade Fixtures (Expected Trade Validation)

You can store expected trade data in JSON files so the test automatically validates that your internally placed trades appear in the report.

### Adding a Fixture

Create a JSON file under `test-data/trades/` named with the date in `YYYY-MM-DD.json` format:

```
test-data/trades/2025-02-17.json
```

Each file contains an array of trade objects. You only need to include the fields you want to validate — the test matches them against the grid using a **partial match** (all specified fields must match a single grid row):

```json
[
  {
    "instrument": "EUR/USD FWD",
    "currency": "USD",
    "totalVolume": "5,000,000",
    "paymentFlag": "Y"
  },
  {
    "instrument": "GBP/USD SPOT",
    "currency": "USD",
    "totalVolume": "2,000,000"
  }
]
```

### Available Fields

You can use any combination of these field names (must match the grid column mapping exactly):

| Field             | Grid Column              |
|-------------------|--------------------------|
| `instrument`      | Instrument               |
| `openingPrice`    | Opening Price            |
| `closingPrice`    | Closing Price            |
| `highPrice`       | High Price               |
| `lowPrice`        | Low Price                |
| `quoteType`       | High/Low Quote Type      |
| `settlementPrice` | Daily Settlement Price * |
| `totalVolume`     | Total Volume             |
| `blockTradeVolume`| Block Trade Volume       |
| `currency`        | Currency                 |
| `paymentFlag`     | Payment Flag             |
| `totalVolumeUSD`  | Total Volume (USD)       |
| `blockTradeVolUSD`| Block Trade Volume (USD) |

### How It Works

- When you run the test (with or without `TRADE_DATE`), it checks for a fixture file matching the active date.
- If found, it loads the expected trades and asserts each one exists in the grid.
- If no fixture file exists for that date, the test logs a message and skips trade validation — nothing fails.

### Example Run

```bash
# Run for 2025-02-17 — fixture exists → trades are validated
TRADE_DATE=2025-02-17 npx playwright test

# Run for a date with no fixture → trade validation is skipped gracefully
TRADE_DATE=2025-01-01 npx playwright test
```

## Running the Tests

### Default Run (yesterday's date)

```bash
npx playwright test
```

This validates that the calendar widget shows yesterday's date, then proceeds with the Foreign Exchange grid validation.

### Custom Trade Date

Pass the `TRADE_DATE` environment variable in **YYYY-MM-DD** format to load a specific date:

```bash
TRADE_DATE=2025-06-15 npx playwright test
```

The script will:

1. First validate the default calendar value is yesterday's date.
2. Clear the calendar widget and fill in `2025-06-15`.
3. Press Enter to trigger a data reload.
4. Verify the calendar now displays the provided trade date.
5. Continue with the Foreign Exchange tab and grid validations against that date's data.

### Examples

```bash
# Run with yesterday's date (default)
npx playwright test

# Run with a specific trade date
TRADE_DATE=2024-12-31 npx playwright test

# Run in headed mode (browser visible) — already configured in playwright.config.js
TRADE_DATE=2025-01-10 npx playwright test

# Run and show the HTML report afterwards
TRADE_DATE=2025-03-20 npx playwright test && npx playwright show-report
```

### Windows (PowerShell)

On Windows, set the environment variable before the command:

```powershell
$env:TRADE_DATE="2025-06-15"; npx playwright test
```

Or using `cmd`:

```cmd
set TRADE_DATE=2025-06-15 && npx playwright test
```

## TRADE_DATE Format

| Format      | Example        | Valid? |
|-------------|----------------|--------|
| `YYYY-MM-DD` | `2025-06-15`  | Yes    |
| `MM/DD/YYYY` | `06/15/2025`  | No     |
| `DD-MM-YYYY` | `15-06-2025`  | No     |

The script will throw a clear error if an invalid format is provided.

## Configuration

The Playwright configuration is in `playwright.config.js`:

- **Browser:** Firefox
- **Headed mode:** Enabled (`headless: false`)
- **Timeout:** 40 seconds per step, 20 seconds for assertions
- **Reporter:** HTML (output in `playwright-report/`)

## Project Structure

```
playwright_automation/
├── package.json                # Node.js dependencies
├── playwright.config.js        # Playwright configuration
├── README.md                   # This file
├── test-data/
│   └── trades/                 # Trade fixture files (one per date)
│       └── 2025-02-17.json     # Example fixture
├── tests/
│   └── fxgo_bsef_beta_public_website_validation.js   # Main test script
├── playwright-report/          # HTML report output
└── test-results/               # Test artifacts
```

## Viewing Test Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```
# bloomberg_bsef_public_ui_data_playwright_js