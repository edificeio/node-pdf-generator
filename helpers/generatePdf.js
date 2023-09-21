const puppeteer = require("puppeteer");
const fs = require("fs");
const { pageWithInterceptor } = require("../commons/pageWithInterceptor");

const generatePdf = async (template, token, basic, cookie) => {
    const browser = await puppeteer.launch({ headless:'old', args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await pageWithInterceptor(await browser.newPage());
    if (token && basic) {
        await page.setExtraHTTPHeaders({ Authorization: "Basic " + basic + ", Bearer " + token });
    } else if (cookie) {
        await page.setExtraHTTPHeaders({ cookie: "oneSessionId=" + cookie });
    }
    const content = fs.readFileSync(template, 'utf-8');
    page.setDefaultNavigationTimeout(0);     
    await page.setContent(content, {timeout: 1800000, waitUntil:'domcontentloaded'});
    const config = await page.evaluate(() => window.pdfGeneratorConfig || {});
    const options = {
        format: 'A4',
        printBackground: true,
        margin: {
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px'
        }
    };
    console.log(new Date(), "[generatePdf] start....")
    const buffer = await page.pdf(!Object.keys(config).length ? options : config);
    await browser.close();
    console.log(new Date(), "[generatePdf] finished....")
    return buffer;
}

module.exports = generatePdf;

