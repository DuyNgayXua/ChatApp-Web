import { useState } from "react";
import { Link } from "react-router-dom";
import "./register.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../redux/apiRequest";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { email, password, phone };


    registerUser(newUser, dispatch, navigate);
  };

  return (
    <section className="register-container">
      <div className="register-left">
        <h2 className="register-title">Sign Up for HHDTT Chat</h2>
        <p className="register-subtitle">
          Already have an account?{" "}
          <Link to="/login" className="register-link">
            Sign in here!
          </Link>
        </p>
        <img src="person.png" alt="Sign Up" className="img" />
      </div>

      <div className="register-right">
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Enter your Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={togglePassword}>
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </span>
          </div>
          <button type="submit">Sign Up</button>


        </form>



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

export default Register;