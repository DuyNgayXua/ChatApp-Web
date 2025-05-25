require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); // import S3Client từ SDK v3
const multer = require("multer");
const multerS3 = require("multer-s3");

// Khởi tạo S3Client với cấu hình từ .env
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Cấu hình Multer-S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}_${file.originalname}`);
        },
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "video/mp4",
            "video/quicktime",
            "application/x-zip-compressed",
            "application/x-compressed"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not allowed"), false);
        }
    }
});

module.exports = { upload };
