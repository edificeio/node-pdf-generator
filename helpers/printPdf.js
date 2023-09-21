const puppeteer = require("puppeteer");
const { pageWithInterceptor } = require("../commons/pageWithInterceptor");

const printPdf = async (url, token, basic, cookie) => {
    const browser = await puppeteer.launch({ headless: 'old', args: ['--disable-web-security', "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await pageWithInterceptor(await browser.newPage());
    if (token && basic) {
        await page.setExtraHTTPHeaders({ Authorization: "Basic " + basic + ", Bearer " + token });
    } else if (cookie) {
        await page.setExtraHTTPHeaders({ cookie: "oneSessionId=" + cookie });
    }
    await page.evaluateOnNewDocument(() => {
        //avoid print popup
        window.print = function(){}
        //inform app about context
        window.pupetterMode = true;
    });
    await page.goto(url, {
        waitUntil:['domcontentloaded', 'networkidle0'],
        timeout: 90000
    });
    const config = await page.evaluate(()=>{
        var html = document.getElementsByTagName("html");
        html[0].classList.add("node-pdf-generator");
        return window.pdfGeneratorConfig || {};
    });
    const buffer = await page.pdf({
        format: config.format || 'A4',
        printBackground: true,
        landscape: config.landscape,
        margin: {
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px'
        }
    });    
    await browser.close();
    return buffer;
}

module.exports = printPdf;

