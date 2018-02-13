import { Request, RequestHandler } from "express";
import * as multer from "multer";

const upload = multer({
    dest: "uploads/",
    fileFilter: (req: Request, file, cb) => {
        try {
            ["timestamp", "dimension"].forEach(field => {
                if (!req.body[field]) {
                    throw new Error(`missing field "${field}" in form data`);
                }
            });

            const date = new Date(req.body.timestamp);

            if (isNaN(date.getTime())) {
                throw new Error(`field "timestamp" must be a valid timestamp`);
            }

            cb(null, true);
        } catch (err) {
            cb(err, false);
        }
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
