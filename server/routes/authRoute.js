const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middleware/firebase-auth");
const authController = require("../Controllers/authController")

router.post("/register", verifyFirebaseToken, authController.register);
router.post("/login", verifyFirebaseToken, authController.login);
router.post("/google", verifyFirebaseToken, authController.googleAuth);
router.get("/verify", verifyFirebaseToken, authController.verify);
router.get("/profile", verifyFirebaseToken, authController.getProfile);
router.put("/profile", verifyFirebaseToken, authController.updateProfile);

module.exports = router;
