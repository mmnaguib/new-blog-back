// ======== server.js =========
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map(); // نقوم بتخزين الـ users المتصلين

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // عند الإرسال
  socket.on("sendMessage", async (msg) => {
    try {
      const savedMsg = await Message.create(msg);
      const populatedMsg = await Message.findById(savedMsg._id).populate(
        "sender",
        "username image"
      );

      // شوف الـ socket الخاص بالمستقبل
      const receiverSocketId = onlineUsers.get(msg.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getMessage", populatedMsg);
      }

      // كمان ابعته للمرسل علشان يظهر عنده فورًا
      socket.emit("getMessage", populatedMsg);
    } catch (err) {
    }
  });

  // عند الخروج
  socket.on("disconnect", () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    // عند قطع الاتصال أرسل الـ onlineUsers المحدث لكل المتصلين
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.use(cors());
app.use(express.json());

dotenv.config();

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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
