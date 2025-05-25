const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { upload } = require("../middlewares/multerConfig");

// Lấy danh sách message theo conversationId
router.get("/get/:conversationId", messageController.getMessagesByConversation);

// Tạo message mới
router.post("/create", messageController.createMessage);

// Pin message
router.put('/pin/:messageId', messageController.pinMessage);

// Delete message
router.put('/recall/:messageId', messageController.recallMessage);

// Delete from
router.put('/deletefrom/:messageId', messageController.deleteMessageFrom);

// Reply message
router.put('/reply', messageController.replyToMessage);

//Upload file, video, image
router.post("/upload", upload.array("files", 10), messageController.uploadFile);

module.exports = router;
