// models/Reaction.ts
const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  type: {
    type: String,
    enum: ["like", "love", "haha", "angry"],
    required: true,
  },
  userIds: [{ type: mongoose.Schema.Types.Mixed }],
});

module.exports = mongoose.model("Reaction", ReactionSchema);
