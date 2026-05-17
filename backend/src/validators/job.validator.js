import { body } from "express-validator";

const validJobTypes = ["full-time", "part-time", "internship", "contract", "remote"];
const validStatuses = ["saved", "applied", "interview", "offer", "rejected"];

export const createJobValidator = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("jobTitle")
    .trim()
    .notEmpty()
    .withMessage("Job title is required"),

  body("jobType")
    .optional()
    .isIn(validJobTypes)
    .withMessage("Invalid job type"),

  body("status")
    .optional()
    .isIn(validStatuses)
    .withMessage("Invalid job status"),

  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("Applied date must be a valid date"),

  body("isBookmarked")
    .optional()
    .isBoolean()
    .withMessage("isBookmarked must be true or false"),
];

export const updateJobValidator = [
  body("companyName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty"),

  body("jobTitle")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Job title cannot be empty"),

  body("jobType")
    .optional()
    .isIn(validJobTypes)
    .withMessage("Invalid job type"),

  body("status")
    .optional()
    .isIn(validStatuses)
    .withMessage("Invalid job status"),

  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("Applied date must be a valid date"),

  body("isBookmarked")
    .optional()
    .isBoolean()
    .withMessage("isBookmarked must be true or false"),
];
