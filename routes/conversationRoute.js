const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;
  let conversation = await Conversation.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = new Conversation({ members: [senderId, receiverId] });
    await conversation.save();
  }

  res.status(200).json(conversation);
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
