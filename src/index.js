const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({width: 1920, height: 1080});

  await page.tracing.start({path: 'trace.json', screenshots: true});
  await page.goto('http://sina.com.cn', {waitUntil: 'networkidle', networkIdleTimeout: 5000});
  await page.tracing.stop();

  await browser.close();
})();
