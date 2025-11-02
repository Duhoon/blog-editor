import express, { Request, Response } from 'express';
import {logger, log} from './logger';

const PORT_NUMBER = 8081;

const app = express();

app.use(log);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/list", (req: Request, res: Response)=>{
    res.send("Hello World!");
})

app.listen(PORT_NUMBER,()=>{
    logger.info(`Running server on ${PORT_NUMBER}`);
})