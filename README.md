
# 💬 ChatApp - Ứng dụng Chat Web & Mobile

## 🛍️ Giới thiệu

**ChatApp** là ứng dụng chat đa nền tảng (Web và Mobile) với các chức năng chính giống Zalo như nhắn tin, gọi điện, gửi ảnh, video, quản lý bạn bè, nhóm chat... Dự án được phát triển bởi **nhóm ChatApp** gồm 4 thành viên, xây dựng theo kiến trúc **microservices** nhằm đảm bảo khả năng mở rộng, hiệu năng cao và dễ dàng bảo trì.

---

## 🧱 Kiến trúc hệ thống
![image](https://user-images.githubusercontent.com/your-username/chatapp-architecture.png)  
- 👤 **Auth Service** – Xác thực người dùng 
- 💬 **Chat Service** – Quản lý nhắn tin, gọi điện, gửi file
- 🧑‍🤝‍🧑 **User Service** – Quản lý thông tin người dùng, danh bạ, nhóm chat  
- ⚙️ **Admin Service** – Quản lý hệ thống, dashboard admin   
- 🌐 **API Gateway** – Định tuyến và tập trung xử lý request từ client  

---

## 🧰 Công nghệ sử dụng

### 🖥️ Backend

- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
- ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
- 🧩 Microservices Architecture
- 🔀 API Gateway
- 🔐 JWT Authentication
- 📨 WebSocket / Socket.IO cho realtime messaging

### 💻 Frontend Web

- ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
- ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
- ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)

### 📱 Frontend Mobile

- ![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
- ![Expo](https://img.shields.io/badge/Expo-1B1F23?logo=expo&logoColor=white)

---

## 🚀 Tính năng nổi bật

- 🗨️ Nhắn tin 1-1 và nhóm với đa dạng biểu tượng, sticker, gửi ảnh/video
- 📞 Gọi thoại, gọi video chất lượng cao
- 👫 Quản lý bạn bè, đồng bộ danh bạ
- 🔔 Thông báo đẩy realtime cho tin nhắn mới, cuộc gọi
- 🔒 Bảo mật thông tin, mã hóa dữ liệu
- 📂 Chia sẻ file nhanh chóng
- 📱 Hỗ trợ đa nền tảng: Web + Mobile (Android, iOS)

---

## 🚀 Đề xuất cải tiến

### 🤖 AI / ML

- Tự động gợi ý từ khóa tìm kiếm bạn bè, nhóm chat
- Phân tích thói quen chat để đề xuất sticker, GIF phù hợp

### 🧩 Hệ thống mở rộng

- Tích hợp chatbot hỗ trợ tự động trả lời
- Dùng Kafka / RabbitMQ để xử lý thông điệp bất đồng bộ
- Sử dụng Redis cho caching realtime message

### ⚙️ CI/CD & DevOps

- Dockerize từng service, sử dụng Docker Compose / Kubernetes
- Triển khai tự động bằng GitHub Actions hoặc Jenkins
- Giám sát dịch vụ qua Prometheus + Grafana

---

## 📬 Liên hệ

- 📧 Email: chatapp.group@gmail.com  
- 🌐 Website: https://chatapp.example.com  

---

## ©️ Bản quyền

Dự án thuộc quyền sở hữu của **Nhóm ChatApp** – phát triển trong khuôn khổ môn học **Công Nghệ Mới – 2025**.

> **© 2025 ChatApp Team**. All rights reserved.
