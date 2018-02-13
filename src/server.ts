import * as express from "express";
import * as mqtt from "mqtt";

import { sseMiddleware } from "./sse";
import { uploadMiddleware } from "./upload";
import { deleteAllVideosMiddleware, fetchAllVideosMiddleware, saveVideoMiddleware } from "./videos";

const app = express();

const connections: express.Response[] = [];

app.use(sseMiddleware);

app.get('/stream', sseMiddleware, (req, res) => {
    res.sseSetup();
    connections.push(res);
});

app.post('/upload', uploadMiddleware, saveVideoMiddleware, (req, res, next) => {
    const message = {
        dimension: req.body.dimension,
        timestamp: new Date(req.body.timestamp).getTime()
    };

    connections.forEach(res => {
        res.write(`event: newvideo\ndata: ${JSON.stringify(message)}\n\n`);
    });

    next();
}, (req, res) => {
    res.sendStatus(201);
    res.send();
});

const allowCorsMiddleware: express.RequestHandler = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};

app.get('/videos', allowCorsMiddleware, fetchAllVideosMiddleware);
app.delete('/videos', deleteAllVideosMiddleware);

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
