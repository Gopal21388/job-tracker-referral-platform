import express from "express";
import validate from "../middleware/validate.middleware.js";
import {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  getBookmarkedJobs,
  toggleBookmark,
  searchExternalJobs,
  saveExternalJob,
} from "../controllers/job.controller.js";
import {
  createJobValidator,
  updateJobValidator,
} from "../validators/job.validator.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createJobValidator, validate, createJob);
router.get("/", protect, getMyJobs);
router.get("/stats", protect, getJobStats);
router.get("/bookmarked", protect, getBookmarkedJobs);
router.get("/external/search", protect, searchExternalJobs);
router.post("/external/save", protect, saveExternalJob);
router.patch("/:id/bookmark", protect, toggleBookmark);
router.get("/:id", protect, getJobById);
router.patch("/:id", protect, updateJobValidator, validate, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
