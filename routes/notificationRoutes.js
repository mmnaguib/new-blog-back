const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الإشعارات" });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: "فشل في تحديث الإشعار" });
  }
});

module.exports = router;
