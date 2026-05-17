import express from "express";
import { sendMessage,getMessagesByReferral } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { sendMessageValidator } from "../validators/message.validator.js";


const router = express.Router();

router.post("/", protect,sendMessageValidator,validate, sendMessage);
router.get("/:referralId", protect, getMessagesByReferral);


export default router;
