import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login"); // hoặc điều hướng tới trang chat
  };

  return (
    <main className="home-container">
      {/* <div className="overlay"></div> */}
      <div className="content">
        <h1 className="home-title">
          Chào mừng đến với hệ thống chat của chúng tôi!
        </h1>
        <p className="subtitle">
          Nơi bạn có thể kết nối và trò chuyện cùng mọi người trong thời gian
          thực.
        </p>
        <button className="start-btn" onClick={handleStart}>
          Bắt đầu ngay
        </button>
      </div>
    </main>
  );
};

export default HomePage;
