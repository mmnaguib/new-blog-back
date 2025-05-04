const express = require("express");
const Post = require("../models/Post");
const upload = require("../middlewares/upload");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("reactions").populate("authorId");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب البوستات" });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content, authorId, type, facebookProfile, tags } = req.body;

    const newPost = new Post({
      title,
      content,
      authorId,
      date: new Date(),
      image: req.file ? req.file.filename : null,
      type,
      facebookProfile,
      tags: tags ? JSON.parse(tags) : [],
      comments: [],
      reactions: [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("reactions")
      .populate("comments")
      .populate("authorId");
    if (!post) return res.status(404).json({ message: "البوست غير موجود" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب البوست" });
  }
});

// 📝 PUT /api/posts/:id
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("reactions")
      .populate("comments")
      .populate("authorId");
    if (!post) return res.status(404).json({ message: "البوست غير موجود" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب البوست" });
  }
});

// 📝 PUT /api/posts/:id
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // لو فيه صورة مرفوعة، نضيفها للبيانات اللي هنحدث بيها
    if (req.file) {
      updateData.image = req.file.filename; // أو حط المسار حسب شغلك
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "البوست غير موجود للتعديل" });
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "فشل في تعديل البوست" });
  }
});

// ❌ DELETE /api/posts/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "البوست غير موجود للحذف" });
    }
    res.status(200).json({ message: "تم حذف البوست بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء حذف البوست" });
  }
});

module.exports = router;
