const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: { type: [String] }, // array of user ids
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
