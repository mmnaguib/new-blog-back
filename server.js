const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // عشان تقبل كل الاتصالات لو انت لسه في مرحلة التطوير
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("مستخدم متصل:", socket.id);
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log(`رسالة من ${senderId} إلى ${receiverId}: ${text}`);
    io.emit("getMessage", { senderId, receiverId, text });
  });

  socket.on("disconnect", () => {
    console.log("مستخدم قطع الاتصال:", socket.id);
  });
});


app.set("io", io);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoute = require("./routes/messageRoute");
const conversationRoute = require("./routes/conversationRoute");

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
