import {Router} from "express";
import puppeteer from "puppeteer";
import { Request, Response } from 'express';
import path from "path";
import * as fs from "fs";
import * as https from "https";
import {catalogDB} from "../../db/db.config";
import ParserService from "../service.parser";

const parserRout = Router()
const parserService = new ParserService();

async function scrapeDataFromWebsite(url) {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2'});
    return {page, browser}
}


/**
 * @openapi
 * /get-catalogs:
 *   get:
 *     summary: Retrieve and save catalogs
 *     description: Downloads and saves catalogs from the specified URL to the database.
 *     responses:
 *       200:
 *         description: Catalogs successfully retrieved and saved.
 *       500:
 *         description: Internal server error.
 */
parserRout.get('/get-catalogs', async (req: Request, res: Response) => {
    try {
        await parserService.getAndSaveCatalogs('https://www.mueller.si/letaki-in-revije/')
        res.sendStatus(200)
    } catch (e) {
        res.sendStatus(500)
    }
})


export default parserRout