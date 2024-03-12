import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import {runDB} from "./db/db.config";
import apiParser from "./src/api/api.parser";

const app = express();
app.use(express.json());

const port = 3000;


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Messages API',
            version: '1.0.0',
        },
    },
    apis: ['./src/**/*.ts', './*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const swaggerDocs = JSON.parse(JSON.stringify(swaggerSpec));
app.get('/ai_docs', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(swaggerDocs.paths));
});

app.use(apiParser);
const starApp = async () => {
    await runDB()
    app.listen(port, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}
starApp()
