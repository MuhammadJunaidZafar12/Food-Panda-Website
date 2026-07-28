import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => ({
        folder: "FoodPanda",
        resource_type: "image",

        allowed_formats: ["jpg", "jpeg", "png", "webp"],

        public_id: `${Date.now()}-${file.originalname
            .split(".")[0]
            .replace(/\s+/g, "-")}`,
    }),
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only image files are allowed."
                ),
                false
            );
        }
    },
});

export default upload;