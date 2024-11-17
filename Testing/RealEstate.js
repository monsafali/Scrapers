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

  const DateIcon = await page.waitForSelector(
    '::-p-xpath(//*[@id="cphNoMargin_tdSearch"]/table[1]/tbody/tr[3]/td[5]/img)'
  );
  DateIcon.click();

  const Today = await page.waitForSelector(
    '::-p-xpath(//*[@id="cphNoMargin_tdSearch"]/table[1]/tbody/tr[3]/td[5]/img)'
  );
  // Today.click();

  // Aproached nO 2
  //******************************************** */

  const First_check = await page.$("#cphNoMargin_f_dclDocType_0");
  First_check.click();
  const Second_check = await page.$("#cphNoMargin_f_dclDocType_1");
  Second_check.click();

  const third_check = await page.$("#cphNoMargin_f_dclDocType_2");
  third_check.click();

  const fourt_check = await page.$("#cphNoMargin_f_dclDocType_3");
  fourt_check.click();

  const five_check = await page.$("#cphNoMargin_f_dclDocType_5");
  five_check.click();

  const six_check = await page.$("#cphNoMargin_f_dclDocType_6");
  six_check.click();

  const seven_check = await page.$("#cphNoMargin_f_dclDocType_7");
  seven_check.click();

  // Search
  const searchBtn = await page.$("#cphNoMargin_SearchButtons2_btnSearch__3");
  searchBtn.click();

  // Next Page
  try {
    const getDocument = await page.waitForSelector(
      '::-p-xpath(//*[@id="ctl00_ctl00_cphNoMargin_cphNoMargin_g_G1_ctl00"]/table/tbody/tr[2]/td/table/tbody[2]/tr/td/div[2]/table/tbody/tr[2]/td[2]/div)'
    );
    getDocument.click();
  } catch {
    console.log("get error document not their exit");
  }
  // Next Dioalog Open
  // const F_page = await page.$("#pageList_1");
  // F_page.click();
  // const S_page = await page.$("#pageList_2");
  // S_page.click();
  // const T_page = await page.$("#pageList_3");
  // T_page.click();

  // btnProcessNow__3

  // const btnProcessNow = await page.$("# btnProcessNow__3");
  // btnProcessNow.click();

  // await browser.close();
})();
