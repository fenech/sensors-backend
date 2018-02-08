import { RequestHandler } from "express";

declare global {
    namespace Express {
        interface Response {
            sseSetup: { (): void };
            sseSend: { (message: string): void };
        }
    }
}

export const sseMiddleware: RequestHandler = (request, response, next) => {
    response.sseSetup = function () {
        response.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
    }

    response.sseSend = function (message) {
        response.write("data: " + message + "\n\n");
    }

    next();
};
