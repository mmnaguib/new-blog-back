// models/Post.ts
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },  date: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, required: true },
  facebookProfile: { type: String },
  tags: [{ type: String }],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  reactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reaction",
    },
  ],
});

module.exports = mongoose.model("Post", PostSchema);
