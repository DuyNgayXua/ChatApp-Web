import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Don't forget to import Link
import "./recover.css"; // Đổi tên file CSS sang recover.css
import { useDispatch } from "react-redux";
import { resetPassword } from "../../redux/apiRequest";

const Recover = () => {
  const navigate = useNavigate();
  // State để kiểm soát hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Hàm chuyển đổi hiển thị mật khẩu
  const togglePassword = () => setShowPassword(!showPassword);
  const togglePasswordConfirm = () =>
    setShowPasswordConfirm(!showPasswordConfirm);

  const { token } = useParams(); // Lấy token từ URL

  const dispatch = useDispatch();

  // State để lưu mật khẩu và thông báo lỗi/success
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem mật khẩu và xác nhận mật khẩu có trùng khớp không
    // if (password !== confirmPassword) {
    //     setError("Mật khẩu và xác nhận mật khẩu không khớp.");
    //     return;
    // }

    // Gọi phương thức resetPassword
    await resetPassword(token, password, confirmPassword, dispatch, navigate);
  };

  return (
    <section className="recover-container">
      {/* Left section */}
      <div className="recover-left">
        <h2 className="recover-title">RECOVER PASSWORD</h2>
        <p className="recover-subtitle">
          Already have an account?{" "}
          <Link to="/login" className="recover-link">
            Sign in here!
          </Link>
        </p>

        <img src="/person.png" alt="Sign Up" className="img" />
      </div>

      {/* Right section */}
      <div className="recover-right">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={togglePassword}>
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </span>
          </div>

          <div className="input-container">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Enter your password confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={togglePasswordConfirm}>
              <i
                className={`fas ${
                  showPasswordConfirm ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </span>
          </div>
          <button type="submit">Confirm</button>
        </form>

        <div className="or">or continue with</div>
        <div className="social-icons">
          <img src="/Google.png" alt="Google" className="icon" />
          <img src="/apple.png" alt="Apple" className="icon" />
          <img src="/facebook.png" alt="Facebook" className="icon" />
        </div>
      </div>
    </section>
  );
};

export default Recover;
