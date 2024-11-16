// using CSV

// import puppeteer from "puppeteer";
// import { createObjectCsvWriter } from "csv-writer";

// const scrape = async () => {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   // Set User-Agent
//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
//   );

//   const allBooks = [];
//   const maxPages = 100;

//   const navigateWithRetry = async (page, url, retries = 3) => {
//     for (let i = 0; i < retries; i++) {
//       try {
//         await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
//         return;
//       } catch (error) {
//         console.error(
//           `Attempt ${i + 1} to navigate to ${url} failed: ${error.message}`
//         );
//         if (i === retries - 1) throw error;
//       }
//     }
//   };

//   for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
//     const url = `https://www.goodreads.com/quotes?page=${currentPage}`;
//     console.log(`Scraping page: ${currentPage}`);

//     try {
//       await navigateWithRetry(page, url);
//       await page.waitForSelector(".quote", { timeout: 10000 });
//     } catch (err) {
//       console.error(`Quotes not found on page ${currentPage}. Skipping...`);
//       continue;
//     }

//     const books = await page.evaluate(() => {
//       const bookElements = document.querySelectorAll(".quote");
//       return Array.from(bookElements).map((book) => {
//         const Quotes =
//           book.querySelector(".quoteText")?.textContent?.trim() || "No Quote";
//         const Author =
//           book.querySelector(".authorOrTitle")?.textContent?.trim() ||
//           "Unknown Author";
//         const Likes =
//           book.querySelector(".right")?.textContent?.trim() || "0 Likes";

//         const Tags = Array.from(book.querySelectorAll(".greyText a")).map(
//           (tag) => tag.textContent.trim()
//         );

//         const Profile_img =
//           book.querySelector(".quoteAvatar img")?.src || "No Image";

//         return {
//           Quotes,
//           Likes,
//           Author,
//           Tags: Tags.join(", "), // Join tags into a single string
//           Profile_img,
//         };
//       });
//     });

//     allBooks.push(...books);
//     console.log(`Quotes on page ${currentPage}: ${books.length}`);
//   }

//   // Save to CSV
//   const csvWriter = createObjectCsvWriter({
//     path: "books.csv",
//     header: [
//       { id: "Quotes", title: "Quotes" },
//       { id: "Likes", title: "Likes" },
//       { id: "Author", title: "Author" },
//       { id: "Tags", title: "Tags" },
//       { id: "Profile_img", title: "Profile_img" },
//     ],
//   });

//   await csvWriter.writeRecords(allBooks);
//   console.log("Data saved to books.csv");

//   await browser.close();
// };

// scrape();

// Simple on Json
import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set User-Agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  );

  const allBooks = [];
  const maxPages = 100; // Reduce the number of pages for simplicity

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

    allBooks.push(...books);
    console.log(`Quotes on page ${currentPage}: ${books.length}`);
  }

  // Save data to JSON
  fs.writeFileSync("quotes.json", JSON.stringify(allBooks, null, 2));
  console.log("Data saved to quotes.json");

  await browser.close();
};

scrape();
