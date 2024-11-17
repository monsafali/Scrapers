import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want headless mode
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  // Navigate to the page
  await page.goto("https://armsweb.co.pierce.wa.us/");

  // Click on the "Accept" button
  await page.waitForSelector("#cph1_lnkAccept");
  await page.click("#cph1_lnkAccept");

  // Hover over "Recorded Documents" to trigger the submenu
  const recordedDocumentsSelector = 'li[data-ig="x:273746300.2:adr:2"] > a';
  await page.waitForSelector(recordedDocumentsSelector);
  await page.hover(recordedDocumentsSelector); // Hover to ensure the submenu appears

  // Wait for the submenu to become visible
  const searchDocumentsSelector = 'li[data-ig="x:273746300.3:adr:2.0"] > a';
  await page.waitForSelector(searchDocumentsSelector, { visible: true });

  // Click on the "Search Documents" submenu item
  await page.click(searchDocumentsSelector);

  // Add additional logic here if needed (e.g., form filling or navigation)

  // Close the browser
  await browser.close();
})();
