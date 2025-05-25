const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudConfig");

// Cấu hình Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log("📌 MIME type nhận được:", file.mimetype);

        let resourceType = "auto"; // Để Cloudinary tự nhận diện

        // Định nghĩa lại loại file
        if (file.mimetype.startsWith("image/")) {
            resourceType = "image";
        } else if (file.mimetype.startsWith("video/")) {
            resourceType = "video";
        } else {
            resourceType = "raw"; // File Word cần loại "raw"
        }

        return {
            folder: "chat_app_uploads",
            resource_type: resourceType,
            format: file.mimetype.split("/")[1], // Định dạng file
            allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "mov", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
        };
    },
});

// Middleware Multer
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg", "image/png", "image/gif",
            "video/mp4", "video/quicktime",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not supported"), false);
        }
    }
});

module.exports = { upload };
