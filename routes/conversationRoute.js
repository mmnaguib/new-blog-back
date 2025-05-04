const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

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


router.delete("/:id", async (req, res) => {
  try {
    const convId = req.params.id;

    await Message.deleteMany({ conversationId: convId });

    await Conversation.findByIdAndDelete(convId);

    res.status(200).json({ message: "تم حذف المحادثة والرسائل المرتبطة بها" });
  } catch (err) {
    console.error("❌ خطأ في حذف المحادثة:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء حذف المحادثة" });
  }
});

module.exports = router;
