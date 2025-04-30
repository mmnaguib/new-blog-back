const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// POST /api/messages/
router.post("/", async (req, res) => {
  const { conversationId, sender, text } = req.body;

  const message = new Message({
    conversationId,
    sender,
    text,
  });

  await message.save();

  // هنا ممكن تبعت بالـ socket كمان
  const io = req.app.get("io");
  io.to(conversationId).emit("receiveMessage", message);

  res.status(201).json(message);
});

router.get("/:conversationId", async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.conversationId,
  }).populate("sender", "username");

  res.status(200).json(messages);
});

module.exports = router;
