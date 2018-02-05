import { RequestHandler, Response } from "express";

export interface SseResponse extends Response {
    sseSetup: { (): void };
    sseSend: { (data: {}): void };
}

export const sseMiddleware: RequestHandler = (request, response: SseResponse, next) => {
    response.sseSetup = function () {
        response.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
    }

    response.sseSend = function (data) {
        response.write("data: " + JSON.stringify(data) + "\n\n");
    }

    next();
};
