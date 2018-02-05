import * as express from "express";
import { sseMiddleware, SseResponse } from "./sse";
import { data } from "./data";
import { setTimeout } from "timers";

const app = express();
var connections: SseResponse[] = [];

app.use(sseMiddleware);

app.get('/stream', (req, res: SseResponse) => {
    res.sseSetup();

    setInterval(() => res.sseSend(data()), 1000);
    connections.push(res);
});

app.listen(3000);
