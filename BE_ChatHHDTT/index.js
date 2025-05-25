const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const conversationRoute = require("./routes/conversationRoute");
const messageRoute = require("./routes/messageRoute");
const userRoute = require("./routes/userRoute");
const friendshipRoute = require("./routes/friendshipRoute");
const http = require("http");

const chatSocket = require("./chat-socket/chat-sockets");

dotenv.config();
const app = express();

// Kết nối MongoDB với async/await
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Thoát nếu không kết nối được
  }
};

// Gọi hàm kết nối
connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//Router
app.use("/v1/auth", authRoute);
app.use("/conversations", conversationRoute);
app.use("/messages", messageRoute);
app.use("/users", userRoute);
app.use("/friends", friendshipRoute);
app.use((req, res, next) => {
  req.io = io;
  next();
});
//Socket
const server = http.createServer(app);

// ✅ Tạo io từ server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc frontend URL
    methods: ["GET", "POST"],
  },
});

chatSocket(io);

const PORT = process.env.PORT || 8004;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
