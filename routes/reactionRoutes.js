const express = require("express");
const Reaction = require("../models/Reaction");
const Notification = require("../models/Notification");

const router = express.Router();

router.post("/:postId/react", async (req, res) => {
  const { postId } = req.params;
  const { type, userId } = req.body;
  const io = req.app.get("io"); // خد الـ io اللي جهزناه فوق

  if (!type || !userId) {
    return res.status(400).json({ message: "type و userId مطلوبين" });
  }

  try {
    let reaction = await Reaction.findOne({ postId, type });

    const Post = require("../models/Post");
    const post = await Post.findById(postId); // 👈 هنا كانت المشكلة، جيبنا post الأول

    if (!post) {
      return res.status(404).json({ message: "البوست غير موجود" });
    }

    if (reaction) {
      const index = reaction.userIds.indexOf(userId);

      if (index > -1) {
        // ❌ remove user from reaction
        reaction.userIds.splice(index, 1);
        if (reaction.userIds.length === 0) {
          // ✅ لو مفيش ولا يوزر، نحذف الريأكشن من الـ reactions
          await Reaction.deleteOne({ _id: reaction._id });

          // ✅ نحذفه كمان من post.reactions
          await Post.findByIdAndUpdate(postId, {
            $pull: { reactions: reaction._id },
          });

          return res.status(200).json({ message: "تم حذف الريأكشن" });
        }
      } else {
        // ✅ add reaction
        reaction.userIds.push(userId);
      }

      await reaction.save();
    } else {
      // 🔨 create new reaction for this type
      reaction = new Reaction({ postId, type, userIds: [userId] });
      await reaction.save();

      // ✅ أضف الـ Reaction الجديد للبوست
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { reactions: reaction._id },
      });
    }

    if (post.authorId.toString() !== userId) {
      const notification = await Notification.create({
        userId: post.authorId,
        type: "reaction",
        message: `تفاعل شخص على بوستك`,
        postId: postId,
      });
      
    io.emit("newNotification", { userId: post.authorId, notification });
    }

    res.status(200).json(reaction);
  } catch (err) {
    res
      .status(500)
      .json({ message: "خطأ أثناء التعامل مع التفاعل", error: err });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const reactions = await Reaction.find({ postId });
    res.status(200).json(reactions);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب التفاعلات", error: err });
  }
});

module.exports = router;
