const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/multerCloudiary");

// Lấy user theo id
router.get("/get/:id", userController.getUserById);
//Đổi thông tin user
router.put("/update/:id", upload.single("avatar"), userController.updateUser);

router.get("/", userController.getAllUsers);

module.exports = router;
