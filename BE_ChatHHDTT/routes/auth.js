const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

router.post("/register", authController.registerUser);
//Login
router.post("/login", authController.loginUser);

//REFRESH TOKEN
router.post("/refresh", authController.requestRefreshToken);

//Logout
router.post("/logout", authController.logOut);
// Xác minh email
router.get("/verify/:token", authController.verifyEmail);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
