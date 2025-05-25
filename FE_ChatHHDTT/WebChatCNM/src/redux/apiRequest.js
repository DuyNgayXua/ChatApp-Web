import axios from "axios";
import {
  forgotPasswordFailed,
  forgotPasswordStart,
  forgotPasswordSuccess,
  loginFailed,
  loginStart,
  loginSuccess,
  logoutFailed,
  logoutStart,
  logoutSuccess,
  registerFailed,
  registerStart,
  registerSuccess,
  resetPasswordFailed,
  resetPasswordStart,
  resetPasswordSuccess,
} from "./authSlice";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post(
      "https://bechatcnm-production.up.railway.app/v1/auth/login",
      user
    );

    if (res.data.message) {
      toast.error(res.data.message); // Hiển thị thông báo lỗi
      dispatch(loginFailed());
      return;
    }

    dispatch(loginSuccess(res.data));
    navigate("/chat-app", { state: { user: res.data } });
    toast.success("Đăng nhập thành công! Chào mừng bạn đến với hệ thống!"); // Thông báo thành công
  } catch (error) {
    console.log("Error caught:", error);

    if (error.response) {
      const errorMessage =
        error.response?.data?.message ||
        "Đã có lỗi từ server, vui lòng thử lại!";
      toast.error(errorMessage); // Hiển thị thông báo lỗi từ server
    } else if (error.request) {
      toast.error("Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.");
    } else {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }

    dispatch(loginFailed());
  }
};

export const registerUser = async (user, dispatch, navigate) => {
  dispatch(registerStart());
  try {
    await axios.post(
      "https://bechatcnm-production.up.railway.app/v1/auth/register",
      user
    );
    dispatch(registerSuccess());
    navigate("/login");
    toast.success(
      "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
    ); // Thông báo thành công
  } catch (error) {
    dispatch(registerFailed());
    const errorMessage =
      error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
    toast.error(errorMessage); // Thông báo lỗi
  }
};

export const logout = async (dispatch, id, navigate, accessToken, axiosJWT) => {
  dispatch(logoutStart());
  try {
    await axiosJWT.post(
      "https://bechatcnm-production.up.railway.app/v1/auth/logout",
      id,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(logoutSuccess());
    navigate("/login");
    toast.success("Đăng xuất thành công!"); // Thông báo thành công
  } catch (error) {
    dispatch(logoutFailed());
    toast.error("Đã có lỗi khi đăng xuất. Vui lòng thử lại."); // Thông báo lỗi
  }
};

export const forgotPassword = async (email, dispatch) => {
  dispatch(forgotPasswordStart());
  try {
    const res = await axios.post(
      "https://bechatcnm-production.up.railway.app/v1/auth/forgot-password",
      { email }
    );

    dispatch(forgotPasswordSuccess(res.data.message));

    toast.success(
      "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn."
    ); // Thông báo thành công
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
    dispatch(forgotPasswordFailed(errorMessage));

    toast.error(errorMessage); // Thông báo lỗi
  }
};

export const resetPassword = async (
  token,
  newPassword,
  confirmPassword,
  dispatch,
  navigate
) => {
  dispatch(resetPasswordStart());
  try {
    const res = await axios.post(
      `https://bechatcnm-production.up.railway.app/v1/auth/reset-password/${token}`,
      {
        newPassword,
        confirmPassword,
      }
    );

    dispatch(resetPasswordSuccess(res.data.message));

    navigate("/login"); // Chuyển hướng đến trang đăng nhập
    toast.success("Đổi mật khẩu thành công!"); // Thông báo thành công
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.";
    dispatch(resetPasswordFailed(errorMessage));

    toast.error(errorMessage); // Thông báo lỗi
  }
};
