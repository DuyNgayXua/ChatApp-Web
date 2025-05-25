import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const baseURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/v1/auth`;
        const response = await fetch(`${baseURL}/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.status === "success") {
            setStatus("success");
            setMessage("Email đã được xác minh thành công!");
          } else if (data.status === "already_verified") {
            setStatus("already_verified");
            setMessage("Email của bạn đã được xác minh.");
          } else {
            setStatus("error");
            setMessage("Token không hợp lệ hoặc đã hết hạn.");
          }
        } else {
          setStatus("error");
          setMessage("Có lỗi xảy ra trong quá trình xác minh.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Có lỗi xảy ra trong quá trình xác minh.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div>
      <h1>Hệ Thống Chat xin thông báo! </h1>
      <h1>Xác minh Email </h1>

      <p>{message}</p>
      {status === "success" && (
        <p>Email của bạn đã được xác minh. Bạn có thể đăng nhập ngay.</p>
      )}
      {status === "already_verified" && <p>Email của bạn đã được xác minh.</p>}
      {status === "error" && <p>Đã xảy ra lỗi. Vui lòng thử lại.</p>}
    </div>
  );
};

export default VerifyEmail;
