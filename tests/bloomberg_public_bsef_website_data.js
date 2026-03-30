const {expect, test} = require('@playwright/test');


test('Browser context', async ({browser}) =>
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track JavaScript errors and console messages from the start
    const jsErrors = [];
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    await page.goto('https://data.bloombergsef.com//');

    //get title - assertion
    console.log(await page.title());
    await expect(page).toHaveTitle('Bloomberg SEF —  Swap Execution Facility (SEF) Historical Data');
    await expect(page.getByText('End Of Day Data')).toBeVisible();

    // Verify the "Date" label is visible
    await expect(page.getByText('Date', { exact: true })).toBeVisible();

    // Verify the calendar/date input widget is visible
    const dateInput = page.getByRole('textbox');
    await expect(dateInput).toBeVisible();

    // Get the last trading day (Friday if today is Sat/Sun, otherwise yesterday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysBack = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 1; // Sun→Fri(-2), Sat→Fri(-1), else yesterday(-1)
    const lastTradingDay = new Date();
    lastTradingDay.setDate(today.getDate() - daysBack);
    // If it landed on Saturday (shouldn't happen), step back one more day
    if (lastTradingDay.getDay() === 6) lastTradingDay.setDate(lastTradingDay.getDate() - 1);
    const mm = String(lastTradingDay.getMonth() + 1).padStart(2, '0');
    const dd = String(lastTradingDay.getDate()).padStart(2, '0');
    const yyyy = lastTradingDay.getFullYear();
    const yesterdayFormatted = `${yyyy}-${mm}-${dd}`;

    // Fetch the calendar value and verify it equals yesterday's date
    const dateValue = await dateInput.inputValue();
    console.log(`Calendar date value: ${dateValue}`);
    expect(dateValue).toBe(yesterdayFormatted);

    // If a TRADE_DATE is provided via environment variable, set the calendar to that date
    // Usage: TRADE_DATE=2025-06-15 npx playwright test
    const tradeDate = process.env.TRADE_DATE;
    if (tradeDate) {
      // Validate the provided date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tradeDate)) {
        throw new Error(`Invalid TRADE_DATE format: "${tradeDate}". Expected YYYY-MM-DD (e.g. 2025-06-15)`);
      }

      console.log(`Setting calendar date to: ${tradeDate}`);

      // Set the date input value using JavaScript (works for native HTML date inputs)
      await dateInput.fill('');
      await dateInput.fill(tradeDate);

      // Press Enter to trigger the date change / data reload
      await dateInput.press('Enter');

      // Wait for the page to process the new date
      await page.waitForTimeout(2000);

      // Verify the calendar now reflects the trade date
      const updatedDateValue = await dateInput.inputValue();
      console.log(`Updated calendar date value: ${updatedDateValue}`);
      expect(updatedDateValue).toBe(tradeDate);
    }

    // Click on the Foreign Exchange tab and verify it's active
    const fxTab = page.getByRole('link', { name: 'Foreign Exchange' });
    await expect(fxTab).toBeVisible();
    await fxTab.click();

    // Verify the Foreign Exchange tab is now active
    await expect(fxTab).toHaveAttribute('class', /active/);

    // Verify the data grid/table is visible and wait for data rows to load after tab switch
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Verify all expected column headers are present
    const expectedColumns = [
      'Instrument', 'Opening Price', 'Closing Price', 'High Price', 'Low Price',
      'High/Low Quote Type', 'Daily Settlement Price *', 'Total Volume',
      'Block Trade Volume', 'Currency', 'Payment Flag',
      'Total Volume (USD)', 'Block Trade Volume (USD)'
    ];
    for (const col of expectedColumns) {
      await expect(table.getByRole('columnheader', { name: col, exact: true })).toBeVisible();
    }

    // Fetch all data rows (excluding header row and aggregated total)
    const dataRows = table.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
                         .filter({ hasNotText: 'Aggregated Total' });
    const rowCount = await dataRows.count();
    console.log(`Foreign Exchange grid has ${rowCount} data rows`);
    expect(rowCount).toBeGreaterThan(0);

    // Fetch all grid data using JavaScript evaluation (more efficient for large datasets)
    const gridData = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];
      
      rows.forEach((row) => {
        // Skip aggregated total row
        if (row.textContent.includes('Aggregated Total')) return;
        
        const cells = row.querySelectorAll('td');
        if (cells.length >= 13) {
          data.push({
            instrument:       cells[0]?.innerText || '',
            openingPrice:     cells[1]?.innerText || '',
            closingPrice:     cells[2]?.innerText || '',
            highPrice:        cells[3]?.innerText || '',
            lowPrice:         cells[4]?.innerText || '',
            quoteType:        cells[5]?.innerText || '',
            settlementPrice:  cells[6]?.innerText || '',
            totalVolume:      cells[7]?.innerText || '',
            blockTradeVolume: cells[8]?.innerText || '',
            currency:         cells[9]?.innerText || '',
            paymentFlag:      cells[10]?.innerText || '',
            totalVolumeUSD:   cells[11]?.innerText || '',
            blockTradeVolUSD: cells[12]?.innerText || '',
          });
        }
      });
      
      return data;
    });
    console.log('Foreign Exchange Grid Data:');
    console.table(gridData);

  });