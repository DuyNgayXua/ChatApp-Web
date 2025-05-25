const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.messageType !== "system";
      },
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "icon", "system"],
      required: true,
    },
    text: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
    },
    imageUrl: {
      type: String,
      required: function () {
        return this.messageType === "image";
      },
    },
    videoUrl: {
      type: String,
      required: function () {
        return this.messageType === "video";
      },
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.messageType === "file";
      },
    },
    fileName: {
      type: String, // lưu tên file gốc để hiển thị
    },
    iconCode: {
      type: String, // ví dụ emoji code hoặc URL sticker
      required: function () {
        return this.messageType === "icon";
      },
    },
    reaction: {
      type: String,
      default: "",
    },
    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isRecalled: { type: Boolean, default: false },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Message",
    },
    isPinned: { type: Boolean, default: false }, 
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
