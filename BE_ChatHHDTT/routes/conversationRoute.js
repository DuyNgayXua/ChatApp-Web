const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { upload } = require("../middlewares/multerCloudiary");

router.post("/create", conversationController.createConversation);
router.get("/:userId", conversationController.getUserConversationsWithMessages);
router.get("/:userId/search", conversationController.getUserConversationsWithMessagesSearch);
router.put("/:id", conversationController.updateConversationMembers);
router.get("/get/:id", conversationController.getConversationById);
router.post("/createwithimage", upload.single("groupAvatar"), conversationController.createConversationWithImage);
router.put("/group/:id", upload.single("groupAvatar"), conversationController.updateGroup);
module.exports = router;
