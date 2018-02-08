import * as express from "express";
import * as mqtt from "mqtt";

import { sseMiddleware } from "./sse";
import { uploadMiddleware } from "./upload";

const app = express();

const connections: express.Response[] = [];

app.use(sseMiddleware);

app.get('/stream', sseMiddleware, (req, res) => {
    res.sseSetup();
    connections.push(res);
});

app.post('/upload', uploadMiddleware, (req, res) => {
    res.sendStatus(201);
    res.send();
});

const client = mqtt.connect("mqtt://message-broker");

client.on("connect", () => {
    client.subscribe("subscriber");
});

client.on("message", (topic, message) => {
    connections.forEach(res => {
        res.sseSend(message.toString());
    });
});

app.listen(3000);
