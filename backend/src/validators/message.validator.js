import { body } from "express-validator";

export const sendMessageValidator = [
  body("referralId")
    .notEmpty()
    .withMessage("Referral id is required")
    .isMongoId()
    .withMessage("Referral id must be valid"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 1000 })
    .withMessage("Message content must be less than 1000 characters"),
];
