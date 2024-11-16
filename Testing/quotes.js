import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set User-Agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  );

  const maxPages = 50; // Reduce the number of pages for simplicity

  // Create or clear the file before writing
  fs.writeFileSync("quotes.json", "[");

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const url = `https://www.goodreads.com/quotes?page=${currentPage}`;
    console.log(`Scraping page: ${currentPage}`);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector(".quote", { timeout: 10000 });
    } catch (err) {
      console.error(`Quotes not found on page ${currentPage}. Skipping...`);
      continue;
    }

    const books = await page.evaluate(() => {
      const bookElements = document.querySelectorAll(".quote");
      return Array.from(bookElements).map((book) => {
        const Quotes =
          book.querySelector(".quoteText")?.textContent?.trim() || "No Quote";
        const Author =
          book.querySelector(".authorOrTitle")?.textContent?.trim() ||
          "Unknown Author";
        const Likes =
          book.querySelector(".right")?.textContent?.trim() || "0 Likes";

        const Tags = Array.from(book.querySelectorAll(".greyText a")).map(
          (tag) => tag.textContent.trim()
        );

        const Profile_img =
          book.querySelector(".quoteAvatar img")?.src || "No Image";

        return {
          Quotes,
          Likes,
          Author,
          Tags: Tags.join(", "), // Join tags into a single string
          Profile_img,
        };
      });
    });

    // Append the quotes to the file immediately
    fs.appendFileSync(
      "quotes.json",
      JSON.stringify(books, null, 2).slice(1, -1)
    );
    if (currentPage < maxPages) {
      fs.appendFileSync("quotes.json", ","); // Add a comma between page data
    }

    console.log(`Quotes on page ${currentPage}: ${books.length}`);
  }

  // Close the JSON array
  fs.appendFileSync("quotes.json", "]");
  console.log("Data saved incrementally to quotes.json");

  await browser.close();
};

scrape();
