import { body } from "express-validator";

export const createReferralValidator = [
  body("receiverEmail")
    .trim()
    .notEmpty()
    .withMessage("Receiver email is required")
    .isEmail()
    .withMessage("Please provide a valid receiver email"),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("jobTitle")
    .trim()
    .notEmpty()
    .withMessage("Job title is required"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required"),

  body("jobLink")
    .optional()
    .trim()
    .isURL()
    .withMessage("Job link must be a valid URL"),
];

export const updateReferralStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["accepted", "rejected"])
    .withMessage("Status must be accepted or rejected"),

  body("responseMessage")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Response message must be less than 500 characters"),
];
