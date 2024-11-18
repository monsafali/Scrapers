import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want headless mode

    defaultViewport: null,

    args: ["--start-maximized"],
  });

  const page = await browser.newPage(); // Navigate to the page

  await page.goto("https://armsweb.co.pierce.wa.us/"); // Click on the "Accept" button

  await page.waitForSelector("#cph1_lnkAccept");

  await page.click("#cph1_lnkAccept"); // Hover over "Recorded Documents" to trigger the submenu

  const Recorded_Document = await page.waitForSelector(
    '::-p-xpath(//*[@id="Header1_WebDataMenu1"]/ul/li[3])'
  );
  Recorded_Document.click();
  const Search_Document = await page.waitForSelector(
    '::-p-xpath(//*[@id="Header1_WebDataMenu1"]/ul/li[3]/ul/li[1]/a)'
  );
  Search_Document.click();

  // Calculate dates
  const today = new Date();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(today.getMonth() - 4);

  const formatDate = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const dateFrom = formatDate(fourMonthsAgo);
  const dateTo = formatDate(today);

  // Wait for Date Filed From input and set value
  await page.waitForSelector(
    "#cphNoMargin_f_ddcDateFiledFrom input[type='text']"
  );
  await page.evaluate((date) => {
    document.querySelector(
      "#cphNoMargin_f_ddcDateFiledFrom input[type='text']"
    ).value = date;
  }, dateFrom);

  // Wait for Date Filed To input and set value
  await page.waitForSelector(
    "#cphNoMargin_f_ddcDateFiledTo input[type='text']"
  );
  await page.evaluate((date) => {
    document.querySelector(
      "#cphNoMargin_f_ddcDateFiledTo input[type='text']"
    ).value = date;
  }, dateTo);

  // console.log(`Date Filed From: ${dateFrom}`);
  // console.log(`Date Filed To: ${dateTo}`);

  // Check Checkbhoxes
  for (let i = 0; i <= 7; i++) {
    // Skip 4 as it's not part of the sequence in your example
    const checkbox = await page.$(`#cphNoMargin_f_dclDocType_${i}`);
    await checkbox.click();
  }

  // Search
  const searchBtn = await page.$("#cphNoMargin_SearchButtons2_btnSearch__3");
  searchBtn.click();

  // Step 2: Interact with the elements having the specific class and click on them one by one
  const links = await page.$$(".staticLink.centeredCell.imageCell");
  for (let i = 0; i < links.length; i++) {
    console.log(`Clicking on element ${i + 1}`);

    // Click the link to open the next page
    await links[i].click();
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Step 3: On the redirected page, select specific pages (Page 1, Page 2, Page 3)
    for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
      const checkboxSelector = `#pageList_${pageIndex}`;
      await page.click("#rdoSelectPages"); // Select the "Selected Pages" option
      await page.click(checkboxSelector); // Check the specific page checkbox
    }

    // Step 4: Click the "Get Image Now" button
    const getImageNowButton = "#btnProcessNow";
    await page.click(getImageNowButton);

    // Wait for the process to complete (e.g., download or page update)
    await page.waitForTimeout(3000); // Adjust timeout as per the website's response time

    // Step 5: Navigate back to the search results for the next link
    await page.goBack({ waitUntil: "networkidle2" });
  }
  // await browser.close();
})();
