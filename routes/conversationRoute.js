const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

// Create a new conversation
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all conversations of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
