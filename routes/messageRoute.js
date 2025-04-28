const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Create a new message
router.post("/", async (req, res) => {
  const { conversationId, senderId, text } = req.body;

  const newMessage = new Message({
    conversationId,
    senderId,
    text,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get messages of a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
