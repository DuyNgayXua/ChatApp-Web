import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import "./forgotPassword.css"; // Updated CSS file name
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../redux/apiRequest";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword(email, dispatch);
    };


  return (
    <section className="forgotPassword-container">
      {/* Left section */}
      <div className="forgotPassword-left">
        <h2 className="forgotPassword-title">FORGOT PASSWORD</h2>
        <p className="forgotPassword-subtitle">
          Already have an account?{" "}
          <Link to="/login" className="forgotPassword-link">
            Sign in here!
          </Link>
        </p>

        <img src="person.png" alt="Forgot Password" className="img" />
      </div>

      {/* Right section */}
      <div className="forgotPassword-right">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
          />
          <button type="submit">Send Reset Link</button>
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

export default ForgotPassword;
