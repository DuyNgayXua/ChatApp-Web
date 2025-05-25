const nodemailer = require("nodemailer");


const sendVerificationEmail = async (email, link, subject = "Xác minh email của bạn", message = "Nhấp vào liên kết bên dưới để xác minh email của bạn:") => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HHDTT Chat " <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <h1>${subject}</h1>
        <p>${message}</p>
        <a href="${link}">Click here</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email đã được gửi đến ${email}`);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error.message);
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
};




module.exports = sendVerificationEmail;
