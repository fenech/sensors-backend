import * as express from "express";
import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
    timestamp: Date,
    path: String
});

const Video = mongoose.model("Video", schema);

const connect = (onOpen: express.RequestHandler): express.RequestHandler => (req, res, next) => {
    mongoose.connect("mongodb://database/videos");

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => onOpen(req, res, next));
};

export const saveVideoMiddleware = connect((req, res, next) => {
    const video = new Video({
        timestamp: req.body.timestamp,
        path: req.file.path
    });

    video.save((err, video) => {
        if (err) {
            console.error(err);
        } else {
            next();
        }
    });
});

export const fetchAllVideosMiddleware = connect((req, res, next) => {
    Video.find((err, videos) => {
        if (err) {
            console.error(err);
            return;
        }

        res.send(videos);
    });
});
