import { Response } from 'express';
import { IncomingMessage } from 'http';
import morgan from 'morgan';
import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.printf(({level, message, timestamp})=>{
            return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

export const log = morgan((tokens, req: IncomingMessage & {body?: Object}, res)=>{
    let logMessage = `[${tokens.method(req, res)}] ${tokens.url(req, res)} ${tokens.status(req, res)} - ${tokens["response-time"](req, res)} ms`

    if (req.body) {
        logMessage += ` [Request] ${JSON.stringify(req.body)}`;
    }

    logger.info(logMessage);
    return null
})