import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const baseUrl = "https://books.toscrape.com/";
  const maxPages = 50;
  let currentPage = 1;

  // Create or clear the file before writing
  fs.writeFileSync("books.json", "[");

  while (currentPage <= maxPages) {
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
      fs.appendFileSync(
        "books.json",
        JSON.stringify(books, null, 2).slice(1, -1)
      );
      if (currentPage < maxPages) {
        fs.appendFileSync("books.json", ",");
      }

      console.log(`Books on page ${currentPage}: `, books);
    } catch (err) {
      console.error(`Failed to scrape page ${currentPage}:`, err);
    }

    currentPage++;
  }

  // Close the JSON array
  fs.appendFileSync("books.json", "]");
  console.log("Data saved incrementally to books.json");

  await browser.close();
};

scrape();
