import * as express from "express";
import * as mqtt from "mqtt";
import * as multer from "multer";

import { sseMiddleware } from "./sse";

interface Req extends express.Request {
    body: {
        timestamp: string;
    };
}

const upload = multer({
    dest: "uploads/",
    fileFilter: (req: Req, file, cb) => {
        if (!req.body.timestamp) {
            cb(new Error("missing field \"timestamp\" in form data"), false);
            return;
        }

        const date = new Date(+req.body.timestamp);

        if (isNaN(date.getTime())) {
            cb(new Error("field \"timestamp\" must be a valid timestamp"), false);
            return;
        }

        cb(null, true);
    }
});

const app = express();

const connections: express.Response[] = [];

app.use(sseMiddleware);

app.get('/stream', sseMiddleware, (req, res) => {
    res.sseSetup();
    connections.push(res);
});

const handleUpload: express.RequestHandler = (req, res, next) => {
    upload.single("video")(req, res, err => {
        if (err) {
            res.writeHead(400, err.message);
            res.send();
        } else {
            next();
        }
    });
};

const sendCreated: express.RequestHandler = (req, res, next) => {
    res.sendStatus(201);
    res.send();
};

app.post('/upload',
    handleUpload,
    sendCreated
);

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
