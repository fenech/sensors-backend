import * as express from "express";
import * as mongoose from "mongoose";

const schema = new mongoose.Schema({
    timestamp: Date,
    dimension: String,
    path: String
});

const Video = mongoose.model("Video", schema);

mongoose.connect("mongodb://database/videos");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

export const saveVideoMiddleware: express.RequestHandler = (req, res, next) => {
    const video = new Video({
        timestamp: req.body.timestamp,
        dimension: req.body.dimension,
        path: req.file.path
    });

    video.save((err, video) => {
        if (err) {
            console.error(err);
        } else {
            next();
        }
    });
};

export const fetchAllVideosMiddleware: express.RequestHandler = (req, res, next) => {
    Video.aggregate([{
        $group: {
            _id: "$dimension",
            timestamps: { $addToSet: "$timestamp" }
        }
    }], (err: Error, videos: { _id: string, timestamps: Date[] }[]) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }

        const response = videos.reduce((prev, curr) => ({
            ...prev,
            [curr._id]: curr.timestamps.map(t => t.getTime())
        }), {});

        res.json(response);
    });
};

export const deleteAllVideosMiddleware: express.RequestHandler = (req, res, next) => {
    Video.find({}, (err, videos) => {
        videos.forEach(video => video.remove());
        res.sendStatus(204);
    });
};
