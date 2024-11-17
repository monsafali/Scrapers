import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const progressFile = "progress.json";
  const quotesFile = "quotes.json";
  const maxPages = 50;
  let currentPage = 1;

  // Determine starting point
  if (fs.existsSync(progressFile) && fs.existsSync(quotesFile)) {
    const progressData = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
    currentPage = progressData.lastPage + 1;
    console.log(`Resuming from page ${currentPage}`);
  } else {
    console.log("Starting fresh. Initializing files.");
    fs.writeFileSync(quotesFile, "[");
    if (fs.existsSync(progressFile)) fs.unlinkSync(progressFile);
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set custom User-Agent and headers
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  while (currentPage <= maxPages) {
    console.log(`Scraping page: ${currentPage}`);
    const url = `https://www.goodreads.com/quotes?page=${currentPage}`;

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.waitForSelector(".quote", { timeout: 15000 });
    } catch (err) {
      console.error(`Failed to load page ${currentPage}:`, err);

      // Debug: Capture screenshot
      await page.screenshot({ path: `error_page_${currentPage}.png` });
      console.log(`Saved screenshot for page ${currentPage}`);
      currentPage++;
      continue;
    }

    const quotes = await page.evaluate(() => {
      const quoteElements = document.querySelectorAll(".quote");
      return Array.from(quoteElements).map((quote) => {
        const Quotes =
          quote.querySelector(".quoteText")?.textContent?.trim() || "No Quote";
        const Author =
          quote.querySelector(".authorOrTitle")?.textContent?.trim() ||
          "Unknown Author";
        const Likes =
          quote.querySelector(".right")?.textContent?.trim() || "0 Likes";

        const Tags = Array.from(quote.querySelectorAll(".greyText a")).map(
          (tag) => tag.textContent.trim()
        );

        const Profile_img =
          quote.querySelector(".quoteAvatar img")?.src || "No Image";

        return {
          Quotes,
          Likes,
          Author,
          Tags: Tags.join(", "), // Join tags into a single string
          Profile_img,
        };
      });
    });

    if (quotes.length === 0) {
      console.log(`No quotes found on page ${currentPage}`);
    } else {
      const quotesContent = JSON.stringify(quotes, null, 2).slice(1, -1);
      if (quotesContent.trim()) {
        fs.appendFileSync(
          quotesFile,
          currentPage === 1 ? quotesContent : "," + quotesContent
        );
      }

      console.log(`Quotes on page ${currentPage}: ${quotes.length}`);
    }

    // Save progress
    fs.writeFileSync(
      progressFile,
      JSON.stringify({ lastPage: currentPage }, null, 2)
    );

    currentPage++;
  }

  // Close the JSON array
  if (!fs.readFileSync(quotesFile, "utf-8").trim().endsWith("]")) {
    fs.appendFileSync(quotesFile, "]");
  }

  console.log("Scraping completed.");
  await browser.close();
};

scrape();
