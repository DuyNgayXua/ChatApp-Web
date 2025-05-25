const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../service/sendEmail");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const client_id = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(client_id);

let refreshTokens = [];
const authController = {
  //Register
  // registerUser: async(req,res)=>{
  //   try {
  //     const { username, email, password } = req.body;

  //     // 1. Kiểm tra email đã tồn tại
  //     const existingUser = await User.findOne({ email });
  //     if (existingUser) {
  //       return res.status(400).json({ message: "Email đã tồn tại." });
  //     }

  //     // 2. Mã hóa password
  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(password, salt);

  //     // 3. Tạo user mới
  //     const newUser = new User({
  //       username,
  //       email,
  //       password: hashedPassword,
  //     });

  //     // 4. Lưu vào database
  //     const user = await newUser.save();

  //     // 5. Tạo token xác minh email
  //     const emailToken = jwt.sign(
  //       { id: user._id },
  //       process.env.JWT_EMAIL_SECRET,
  //       { expiresIn: "1h" }
  //     );
  //      // 6. Gửi email xác minh
  // try {
  //   await sendVerificationEmail(user.email, emailToken);
  //   res.status(200).json({
  //     message: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
  //   });
  // } catch (err) {
  //   await User.findByIdAndDelete(user._id); // Xóa user nếu gửi email thất bại
  //   res.status(500).json({
  //     message: "Gửi email xác minh thất bại. Vui lòng thử lại.",
  //   });
  // }
  //     } catch (err) {
  //         res.status(500).json(err)
  //     }

  // },

  // Register
  registerUser: async (req, res) => {
    try {
      const { phone, email, password, username } = req.body;

      // 1. Kiểm tra số điện thoại đã tồn tại
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "Số điện thoại đã tồn tại." });
      }
      // 2. Ràng buộc số điện thoại (10-11 ký tự số)
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phone)) {
        return res
          .status(400)
          .json({ message: "Số điện thoại phải có từ 10 đến 11 ký tự số." });
      }
      // 3. Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }

      // 4. Ràng buộc định dạng email (chỉ cho phép gmail)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email sai  định dạng " });
      }

      // 5. Tạo username mặc định nếu không cung cấp
      const generatedUsername = username || `Khach_${Date.now()}`;

      // 6. Mã hóa password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 7. Tạo user mới
      const newUser = new User({
        phone,
        email,
        password: hashedPassword,
        username: generatedUsername,
      });

      // 8. Lưu vào database
      const user = await newUser.save();

      // 9. Tạo token xác minh email
      const emailToken = jwt.sign(
        { id: user._id },
        process.env.JWT_EMAIL_SECRET,
        { expiresIn: "1h" }
      );

      // 10. Tạo link xác minh
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;

      // 11. Gửi email xác minh
      try {
        await sendVerificationEmail(user.email, verificationUrl);
        res.status(200).json({
          message:
            "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
        });
      } catch (err) {
        await User.findByIdAndDelete(user._id); // Xóa user nếu gửi email thất bại
        res.status(500).json({
          message: "Gửi email xác minh thất bại. Vui lòng thử lại.",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      // Xác minh token
      const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);

      // Tìm user theo ID
      const user = await User.findById(decoded.id);
      if (!user)
        return res
          .status(404)
          .json({ status: "error", message: "Người dùng không tồn tại." });

      // Kiểm tra nếu email đã xác minh
      if (user.isVerified)
        return res
          .status(200)
          .json({
            status: "already_verified",
            message: "Email đã được xác minh.",
          });

      // Cập nhật trạng thái isVerified thành true
      user.isVerified = true;
      await user.save();

      res
        .status(200)
        .json({
          status: "success",
          message: "Email đã được xác minh thành công!",
        });
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .json({
          status: "error",
          message: "Token không hợp lệ hoặc đã hết hạn.",
        });
    }
  },

  //Genegare AccessToken
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_ACCESS_kEY,
      //thoi gian hoat dong
      { expiresIn: "30s" }
    );
  },
  //Genegare RefreshToken
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_REFRESH_kEY,
      //thoi gian hoat dong
      { expiresIn: "365d" }
    );
  },

  //Login
  // Login
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({ message: "Email Không chính xác!" }); // Chuyển từ 404 thành 401
      }

      // Kiểm tra mật khẩu
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(401).json({ message: "Password không chính xác!" }); // Chuyển từ 404 thành 401
      }

      // Đánh dấu người dùng là online và lưu
      user.isOnline = true;
      await user.save();

      // Tạo token và refresh token
      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);

      // Lưu refresh token vào cookies
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      // Trả về thông tin người dùng mà không có mật khẩu
      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      console.error("Login Error:", err); // Log lỗi để dễ dàng debug
      res
        .status(500)
        .json({ message: "Đã có lỗi từ server, vui lòng thử lại!" });
    }
  },

  requestRefreshToken: async (req, res) => {
    //Take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    //Send error if token is not valid
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    // if (!refreshTokens.includes(refreshToken)) {
    //   return res.status(403).json("Refresh token is not valid");
    // }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_kEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      //create new access token, refresh token and send to user
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  },

  //LOG OUT
  // LOG OUT
  logOut: async (req, res) => {
    try {
      const { id } = req.body; // Lấy đúng id từ body
      console.log("ID nhận từ auth:", id);

      const user = await User.findById(id); // Tìm user theo ID

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isOnline = false;
      await user.save();

      console.log("User sau khi update:", user);

      // Có thể thêm xử lý xóa refreshToken nếu cần
      // refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
      // res.clearCookie("refreshToken");

      return res.status(200).json("Logged out successfully!");
    } catch (error) {
      console.error("Lỗi trong logOut:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Gửi yêu cầu khôi phục mật khẩu

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Kiểm tra nếu email tồn tại
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Email không tồn tại." });
      }

      // Tạo token khôi phục mật khẩu
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 phút

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = tokenExpiry;
      await user.save();

      // Gửi email khôi phục
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await sendVerificationEmail(
        user.email,
        resetUrl,
        "Khôi phục mật khẩu",
        "Nhấp vào liên kết dưới đây để đặt lại mật khẩu:"
      );

      res
        .status(200)
        .json({ message: "Liên kết khôi phục mật khẩu đã được gửi." });
    } catch (err) {
      res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body;

      if (newPassword != confirmPassword) {
        return res
          .status(400)
          .json({ message: "Mật khẩu và mật khẩu xác nhận không khớp." });
      }
      // Hash token và kiểm tra trong cơ sở dữ liệu
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
      }

      // Cập nhật mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (err) {
      res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
  },
};

module.exports = authController;
