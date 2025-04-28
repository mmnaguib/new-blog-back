const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

const router = express.Router();

// 🆕 POST /api/comments/:postId
router.post("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { content, userId } = req.body;
  const io = req.app.get("io"); // خد الـ io اللي جهزناه فوق

  if (!content || !userId) {
    return res.status(400).json({ message: "محتوى التعليق والمستخدم مطلوبين" });
  }

  try {
    const newComment = new Comment({
      postId,
      content,
      userId,
      date: new Date().toISOString(),
    });

    const post = await Post.findById(postId); // 👈 هنا كان ناقص

    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    await newComment.save();

    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId"
    );

    if (post && post.authorId.toString() !== userId) {
      const notification =  await Notification.create({
        userId: post.authorId,
        type: "comment",
        message: `علق ${populatedComment.userId.username} على ${post.title}`,
        postId: postId,
      });
    io.emit("newNotification", { userId: post.authorId, notification });
    }



    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "فشل في إضافة التعليق", error: err });
  }
});

// 📄 GET /api/comments/:postId
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate(
      "userId"
    );
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب التعليقات", error: err });
  }
});

router.get("/:postId/count", async (req, res) => {
  try {
    const count = await Comment.countDocuments({ postId: req.params.postId });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب عدد التعليقات", error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "الكومنت غير موجود للتعديل" });
    }

    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json({ message: "فشل في تعديل الكومنت" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "الكومنت غير موجود للحذف" });
    }
    res.status(200).json({ message: "تم حذف الكومنت بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء حذف الكومنت" });
  }
});

module.exports = router;
