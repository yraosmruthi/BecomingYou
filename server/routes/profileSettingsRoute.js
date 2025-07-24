const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyFirebaseToken = require("../middlewares/firebase-auth");

// Apply Firebase auth middleware to all routes
router.use(verifyFirebaseToken);

// Profile routes
router.get("/", profileController.getProfile);
router.put("/update", profileController.updateProfile);
router.put("/email", profileController.updateEmail);
router.put("/photo", profileController.updatePhoto);
router.put("/privacy", profileController.updatePrivacySettings);

// Support routes
router.get("/support", profileController.getSupportSettings);
router.put("/support", profileController.updateSupportSettings);
router.post("/support/emergency-number", profileController.addEmergencyNumber);
router.delete(
  "/support/emergency-number/:numberId",
  profileController.removeEmergencyNumber
);

module.exports = router;
