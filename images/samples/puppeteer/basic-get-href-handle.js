const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://danube-web.shop/')
  const element = await page.$('a')
  const href = await element.evaluate((node) => node.href)
  console.log(href)
  await browser.close()
})()
