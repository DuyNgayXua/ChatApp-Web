const express = require("express");
const router = express.Router();
const friendshipController = require("../controllers/friendshipController");

// Định tuyến các API
router.get("/search", friendshipController.searchUser);
router.post("/send-request", friendshipController.sendFriendRequest);
router.post("/accept-request", friendshipController.acceptFriendRequest);
router.post("/reject-request", friendshipController.rejectFriendRequest);
router.post("/cancel-request", friendshipController.cancelFriendRequest);
router.post("/unfriend", friendshipController.unfriend);
router.get("/checkfriend/:senderId/:receiverId", friendshipController.checkFriendRequestStatus);
router.get("/friend-requests/:userId", friendshipController.getFriendRequests);
router.get("/getfriend/:userId", friendshipController.getFriendsList);

module.exports = router;
