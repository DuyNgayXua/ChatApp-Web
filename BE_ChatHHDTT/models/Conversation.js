const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestmessage: {
      type: String,
      default: "",
    },
    lastMessageSenderId: {
      // Thêm trường này
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageId: {
      // Thêm trường này
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: function () {
        return this.isGroup;
      },
    },
    unreadCounts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    groupAvatar: {
      type: String,
      default: "",
    },
    lastMessageTime: { type: Date, default: Date.now },
    deleteBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    leftMembers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        leftAt: { type: Date, default: Date.now },
        lastMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
    addMembers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
        addBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
        lastMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
    createGroup: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
      createAt: { type: Date, default: Date.now },
      lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    },
    groupLeader: {
      // Trưởng nhóm - 1 người
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupDeputies: [
      // Nhóm phó - nhiều người
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDissolved: {
      // Đánh dấu nhóm đã bị giải tán
      type: Boolean,
      default: false,
    },
    

  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;
