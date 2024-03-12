import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import {catalogDB} from "../db/db.config";


const downloadPath = path.resolve(process.cwd(), 'downloads');
if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
}


class ParserService {
    private async scrapeDataFromWebsite(url: string) {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle2'});
        return {page, browser};
    }
    private async downloadFile(url: string, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    const fileStream = fs.createWriteStream(filePath);
                    response.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close(() => resolve());
                    });
                } else {
                    reject(new Error(`Failed to download file: ${url}`));
                }
            }).on('error', (err) => reject(err));
        });
    }

    public async getAndSaveCatalogs(url: string): Promise<void> {
        const {page, browser} = await this.scrapeDataFromWebsite(url)

        await new Promise(resolve => setTimeout(resolve, 2000))

        await page.waitForSelector('#usercentrics-root');
        const shadowHost = await page.$('#usercentrics-root');
        const shadowRoot = await shadowHost.getProperty('shadowRoot');
        const button = await shadowRoot.$$('button[data-testid="uc-accept-all-button"]');
        await button[0].click()

        const catalogLinks = await page.$$eval('.mu-multi-link-teaser__button--horizontal.mu-multi-link-teaser__button--size_25', links => links.map(link => (link as HTMLAnchorElement).href));
        const pdfLinks = catalogLinks.filter(link => link.includes('.pdf'));

        const catalogsData = await page.$$eval('.mu-multi-link-teaser__content-wrapper', elements => {
            return elements.map(element => {
                const titleElement = element.querySelector('.mu-multi-link-teaser__headline--horizontal');
                const dateElement = element.querySelector('.mu-multi-link-teaser__headline--subheadline');

                return {
                    title: titleElement ? titleElement.textContent.trim() : '',
                    dates: dateElement ? dateElement.textContent.trim() : '',
                };
            });
        });

        for (const link of pdfLinks) {
            const fileName = link.split('/').pop().split('?')[0];
            const filePath = path.join(downloadPath, fileName);
            await this.downloadFile(link, filePath);
        }
        await catalogDB.insertMany(catalogsData)
        await browser.close();
    }
}
export default ParserService
