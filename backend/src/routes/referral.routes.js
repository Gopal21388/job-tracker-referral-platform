import express from "express";
import validate from "../middleware/validate.middleware.js";
import {
  createReferral,
  updateReferralStatus,
  getReferralById,
  cancelReferral,
  getSentReferrals,
  getReceivedReferrals,
} from "../controllers/referral.controller.js";
import {
  createReferralValidator,
  updateReferralStatusValidator,
} from "../validators/referral.validator.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect,createReferralValidator,validate, createReferral);
router.get("/sent", protect, getSentReferrals);
router.get("/received", protect, getReceivedReferrals);
router.patch("/:id/status", protect,updateReferralStatusValidator,validate, updateReferralStatus);
router.get("/:id", protect, getReferralById);
router.delete("/:id", protect, cancelReferral);

export default router;
