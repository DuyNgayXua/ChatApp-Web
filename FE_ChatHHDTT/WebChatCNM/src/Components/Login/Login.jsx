import { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/apiRequest";
import { useDispatch } from "react-redux";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newUser = { email, password };

    // Call the loginUser function from the redux API request
    await loginUser(newUser, dispatch, navigate);
  };

  return (
    <section className="login-container">
      <div className="login-left">
        <h2 className="login-title">Sign In to HHDTT Chat</h2>
        <p className="login-subtitle">
          If you don’t have an account you can{" "}
          <Link to="/register" className="register-link">
            Register here!
          </Link>
        </p>
        <img src="person.png" alt="person" className="img" />
      </div>
      <div className="login-right">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={togglePassword}>
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </span>
          </div>
          <Link to="/recover" className="login-register">
            Recover Password?
          </Link>
          <button type="submit">Continue</button>
        </form>

        <Link className="login-register-link" to="/register">
          Register
        </Link>
        <div className="or">or continue with</div>
        <div className="social-icons">
          <img src="Google.png" alt="Google" className="icon" />
          <img src="apple.png" alt="Apple" className="icon" />
          <img src="facebook.png" alt="Facebook" className="icon" />
        </div>
      </div>
    </section>
  );
};

export default Login;
