import express from "express";
import validate from "../middleware/validate.middleware.js";
import {
  authLimiter,
  forgotPasswordLimiter,
} from "../middleware/rateLimit.middleware.js";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  verifyEmail,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  uploadResume,
  downloadResume,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  changePasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";

import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register",authLimiter,registerValidator,validate,registerUser);
router.post("/login",authLimiter,loginValidator,validate, loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", protect,changePasswordValidator,validate, changePassword);
router.post("/logout", protect, logoutUser);
router.post("/forgot-password",forgotPasswordLimiter,forgotPasswordValidator,validate, forgotPassword);
router.post("/reset-password/:token",resetPasswordValidator,validate, resetPassword);
router.post("/send-verification-email", protect, sendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);
router.get("/me", protect, getMe);
router.post("/resume", protect, upload.single("resume"), uploadResume);
router.get("/resume/download", protect, downloadResume);

export default router;

