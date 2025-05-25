const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    
    },
    email: {
      type: String,
      require: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    phone: {
      type: String,
      require: true,
      min: 10,
      max: 11,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    //Thêm trường email để xác minh tài khoản đã kích hoạt
    isVerified: {
      type: Boolean,
      default: false, // Mặc định chưa xác minh
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dz7yojvna/image/upload/v1623495972/avatar/avatar-1_ylbq4a.png",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);