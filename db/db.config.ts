import {MongoClient} from 'mongodb'
import dotenv from "dotenv";

dotenv.config()

const client = new MongoClient(process.env.MONGO_URI)
const DB = client.db()

export const catalogDB = DB.collection('catalog')

export async function runDB() {
    try {
        await client.connect();
        await DB.command({ping: 1})
        console.log('Connected successfully to mongo server')
    } catch {
        console.log("Can`t connect to db")
        await client.close();
    }
}