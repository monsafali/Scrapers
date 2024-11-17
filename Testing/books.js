import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const baseUrl = "https://books.toscrape.com/";
  const maxPages = 50;
  const progressFile = "progress.json";
  const booksFile = "books.json";

  // Determine the starting page
  let currentPage = 1;

  // Check if books.json exists; if not, reset progress
  if (!fs.existsSync(booksFile)) {
    console.log(`File ${booksFile} does not exist. Starting fresh.`);
    if (fs.existsSync(progressFile)) {
      fs.unlinkSync(progressFile); // Delete progress file to restart
    }
    fs.writeFileSync(booksFile, "["); // Initialize books file
  } else {
    // If progress file exists, resume from the last saved page
    if (fs.existsSync(progressFile)) {
      const progressData = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
      currentPage = progressData.lastPage + 1; // Start from the next unprocessed page
      console.log(`Resuming from page ${currentPage}`);
    } else {
      console.log("No progress file found. Starting fresh from page 1.");
    }
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  while (currentPage <= maxPages) {
    console.log(`Scraping page: ${currentPage}`); // Display current page number in the console

    const url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      const books = await page.evaluate((baseUrl) => {
        const bookElements = document.querySelectorAll(".product_pod");
        return Array.from(bookElements).map((book) => {
          const title = book.querySelector("h3 a").getAttribute("title");
          const price = book.querySelector(".price_color").textContent;
          const stock = book.querySelector(".instock.availability")
            ? "In Stock"
            : "Out Of Stock";
          const rating = book
            .querySelector(".star-rating")
            .className.split(" ")[1];
          const link = book.querySelector("h3 a").getAttribute("href");
          const img_Url =
            baseUrl +
            (book.querySelector(".image_container img")?.getAttribute("src") ||
              "No Image");

          return {
            title,
            price,
            stock,
            rating,
            link,
            img_Url,
          };
        });
      }, baseUrl);

      // Append the data for the current page to the file
      const booksContent = JSON.stringify(books, null, 2).slice(1, -1);
      if (booksContent.trim()) {
        fs.appendFileSync(
          booksFile,
          currentPage === 1 ? booksContent : "," + booksContent
        );
      }

      // Update progress file
      fs.writeFileSync(
        progressFile,
        JSON.stringify({ lastPage: currentPage }, null, 2)
      );
    } catch (err) {
      console.error(`Failed to scrape page ${currentPage}:`, err);
      break;
    }

    currentPage++;
  }

  // Close the JSON array if it's still open
  if (!fs.readFileSync(booksFile, "utf-8").trim().endsWith("]")) {
    fs.appendFileSync(booksFile, "]");
  }

  console.log("Data saved incrementally to books.json");

  await browser.close();
};

// Start scraping
scrape();
