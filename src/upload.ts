import { Request, RequestHandler } from "express";
import * as multer from "multer";

interface Req extends Request {
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

export const uploadMiddleware: RequestHandler = (req, res, next) => {
    upload.single("video")(req, res, err => {
        if (err) {
            res.writeHead(400, err.message);
            res.send();
        } else {
            next();
        }
    });
};
