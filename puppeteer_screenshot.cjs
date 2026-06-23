const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        const html = await page.content();
        console.log("HTML length:", html.length);
        if (html.includes('id="root"')) {
            const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
            console.log("Root content length:", rootHtml.length);
        }
        
        await browser.close();
    } catch(err) {
        console.error(err);
    }
})();
