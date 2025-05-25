const User = require("../models/User");
const express = require("express");
const bcrypt = require("bcryptjs");
const { upload } = require("../middlewares/multerCloudiary");
const router = express.Router();

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    ); // Ẩn thông tin nhạy cảm
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, phone, password } = req.body;

    // ======= Kiểm tra không rỗng =======
    if (!username) {
      return res.status(400).json({ error: "Username không được để trống" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ error: "Số điện thoại không được để trống" });
    }

    // ======= Regex kiểm tra =======
    const usernameRegex = /^[a-zA-ZÀ-ỹ]+(?:\s[a-zA-ZÀ-ỹ]+)*$/;
    const phoneRegex = /^0\d{9}$/;
    const passwordRegex = /^.{6,}$/; // Mật khẩu từ 6 ký tự trở lên

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error:
          "Tên đăng nhập phải từ 3 đến 20 ký tự, chỉ gồm chữ cái (có hoặc không dấu)",
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Số điện thoại không hợp lệ (bắt đầu bằng 0) gồm 10 kí tự",
      });
    }

    if (password && !passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Mật khẩu phải từ 6 ký tự trở lên" });
    }

    // ======= Kiểm tra trùng số điện thoại =======
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== id) {
      return res
        .status(400)
        .json({ error: "Số điện thoại đã được sử dụng bởi người dùng khác." });
    }
    // ====== Cập nhật ======
    let updatedFields = {
      username,
      phone,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedFields.password = hashedPassword;
    }

    if (req.file) {
      updatedFields.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
