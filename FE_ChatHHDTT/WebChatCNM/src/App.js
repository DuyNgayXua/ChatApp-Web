import "./App.css";
import HomePage from "./Components/Home/HomePage";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Recover from "./Components/Recover/Recover";
import VerifyEmail from "./Components/Register/verifyMail";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import ChatApp from "./Components/ChatApp/ChatApp";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Import CSS

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        
      />

      <Router>
        {/* Thêm ToastContainer vào đây để hiển thị thông báo toàn cục */}
        <ToastContainer position="top-center" />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<Recover />} />
          <Route path="/recover" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/chat-app" element={<ChatApp />} />
        </Routes>
      </div>
      </Router>
    </>
  );
}

export default App;