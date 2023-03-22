const puppeteer = require('puppeteer');

let browser, page;

(async () => {await activatePage();})()

// Activate the page
async function activatePage(){
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36');
  await page.setDefaultNavigationTimeout(30000);
  await page.goto(`https://www.deepl.com/translator#ja/en/こんにちわ`);
}

async function deepLTranslate(text){
  // Navigate to the page
  await page.goto(`https://www.deepl.com/translator#ja/en/${encodeURIComponent(text)}`);
  // Wait for the loading indicator to disappear
  await page.waitForSelector('div[dl-test="loading-indicator"]', {hidden: true});
  // Get the translated text
  return await page.evaluate(() => {return document.querySelector('.lmt__textarea.lmt__target_textarea').value});
}

module.exports = deepLTranslate;