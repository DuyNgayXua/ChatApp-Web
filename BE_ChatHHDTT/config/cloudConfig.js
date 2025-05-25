require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dapvuniyx",
  api_key: "249722262232287",
  api_secret: "VFBfRVuGT-X64QFwowYnJA86ou0",
});

module.exports = cloudinary;