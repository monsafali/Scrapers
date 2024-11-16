import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allBooks = [];
  let currentPage = 1;
  const maxPages = 50;
  const baseUrl = "https://books.toscrape.com/";

  while (currentPage <= maxPages) {
    const url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;

    await page.goto(url);

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

    allBooks.push(...books);
    console.log(`Books on page ${currentPage}: `, books);
    currentPage++;
  }

  fs.writeFileSync("books.json", JSON.stringify(allBooks, null, 2));

  console.log("Data saved to books.json");

  await browser.close();
};

scrape();
