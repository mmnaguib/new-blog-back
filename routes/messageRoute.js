const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

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

router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "الرسالة غير موجودة" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "تم حذف الرسالة بنجاح" });
  } catch (err) {
    console.error("❌ خطأ في حذف الرسالة:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء حذف الرسالة" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "الرسالة غير موجودة" });
    message.text = text;
    message.edited = true;
    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تعديل الرسالة" });
  }
});

const Conversation = require("../models/Conversation");

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
