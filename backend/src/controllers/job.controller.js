import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Job from "../models/job.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const normalizeJobType = (job = {}) => {
  const text = [job.title, job.location, ...(job.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("remote")) return "remote";
  if (text.includes("intern")) return "internship";
  if (text.includes("contract") || text.includes("freelance")) return "contract";
  if (text.includes("part time") || text.includes("part-time")) return "part-time";

  return "full-time";
};

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const mapArbeitnowJob = (job) => ({
  source: "arbeitnow",
  externalId: String(job.slug || job.url || job.title || "external-job"),
  companyName: job.company_name || "Unknown company",
  jobTitle: job.title || "Untitled role",
  jobLink: job.url || "",
  location: job.location || "Not specified",
  jobType: normalizeJobType(job),
  tags: Array.isArray(job.tags) ? job.tags.slice(0, 5) : [],
  description: stripHtml(job.description || "").slice(0, 240),
  postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
});

export const createJob = asyncHandler(async (req, res) => {
  const {
    companyName,
    jobTitle,
    jobLink,
    location,
    jobType,
    status,
    appliedDate,
    notes,
    isBookmarked,
  } = req.body;

  if (!companyName || !jobTitle) {
    throw new ApiError(400, "Company name and job title are required");
  }

  const job = await Job.create({
    user: req.user._id,
    companyName,
    jobTitle,
    jobLink,
    location,
    jobType,
    status,
    appliedDate,
    notes,
    isBookmarked,
  });

  res.status(201).json(new ApiResponse(201, "Job created successfully", job));
});

export const searchExternalJobs = asyncHandler(async (req, res) => {
  const { query = "", location = "", page = 1 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const apiUrl = `https://www.arbeitnow.com/api/job-board-api?page=${pageNumber}`;

  let response;
  try {
    response = await fetch(apiUrl);
  } catch (error) {
    throw new ApiError(502, "External job search service is not reachable");
  }

  if (!response.ok) {
    throw new ApiError(502, "External job search service failed");
  }

  const payload = await response.json();
  const allJobs = Array.isArray(payload.data) ? payload.data : [];
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLocation = location.trim().toLowerCase();

  const filteredJobs = allJobs
    .filter((job) => {
      const searchableText = [
        job.title,
        job.company_name,
        job.location,
        ...(job.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery
        ? searchableText.includes(normalizedQuery)
        : true;
      const matchesLocation = normalizedLocation
        ? String(job.location || "").toLowerCase().includes(normalizedLocation)
        : true;

      return matchesQuery && matchesLocation;
    })
    .slice(0, 20)
    .map(mapArbeitnowJob);

  res.status(200).json(
    new ApiResponse(200, "External jobs fetched successfully", {
      jobs: filteredJobs,
      source: "arbeitnow",
      page: pageNumber,
      total: filteredJobs.length,
    })
  );
});

export const saveExternalJob = asyncHandler(async (req, res) => {
  const {
    companyName,
    jobTitle,
    jobLink,
    location,
    jobType = "full-time",
    notes,
    isBookmarked = false,
  } = req.body;

  if (!companyName || !jobTitle) {
    throw new ApiError(400, "Company name and job title are required");
  }

  if (jobLink) {
    const existingJob = await Job.findOne({ user: req.user._id, jobLink }).select("-__v");

    if (existingJob) {
      return res
        .status(200)
        .json(new ApiResponse(200, "Job already saved in tracker", existingJob));
    }
  }

  const job = await Job.create({
    user: req.user._id,
    companyName,
    jobTitle,
    jobLink,
    location,
    jobType,
    status: "saved",
    notes: notes || "Saved from external job search",
    isBookmarked,
  });

  res.status(201).json(new ApiResponse(201, "External job saved successfully", job));
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    jobType,
    isBookmarked,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {
    user: req.user._id,
  };

  if (status) {
    query.status = status;
  }

  if (jobType) {
    query.jobType = jobType;
  }

  if (isBookmarked !== undefined) {
    query.isBookmarked = isBookmarked === "true";
  }

  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const jobs = await Job.find(query)
    .select("-__v")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const totalJobs = await Job.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, "Jobs fetched successfully", {
      jobs,
      pagination: {
        totalJobs,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalJobs / limitNumber),
        limit: limitNumber,
      },
    })
  );
});

export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, user: req.user._id }).select("-__v");

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.status(200).json(new ApiResponse(200, "Job fetched successfully", job));
});

export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, user: req.user._id });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const allowedFields = [
    "companyName",
    "jobTitle",
    "jobLink",
    "location",
    "jobType",
    "status",
    "appliedDate",
    "notes",
    "isBookmarked",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  const updatedJob = await job.save();
  const cleanJob = await Job.findById(updatedJob._id).select("-__v");

  res
    .status(200)
    .json(new ApiResponse(200, "Job updated successfully", cleanJob));
});

export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, user: req.user._id });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  await job.deleteOne();

  res.status(200).json(new ApiResponse(200, "Job deleted successfully"));
});

export const getJobStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalJobs = await Job.countDocuments({ user: userId });
  const saved = await Job.countDocuments({ user: userId, status: "saved" });
  const applied = await Job.countDocuments({ user: userId, status: "applied" });
  const interview = await Job.countDocuments({
    user: userId,
    status: "interview",
  });
  const offer = await Job.countDocuments({ user: userId, status: "offer" });
  const rejected = await Job.countDocuments({
    user: userId,
    status: "rejected",
  });
  const bookmarked = await Job.countDocuments({
    user: userId,
    isBookmarked: true,
  });

  const stats = {
    totalJobs,
    saved,
    applied,
    interview,
    offer,
    rejected,
    bookmarked,
  };

  res
    .status(200)
    .json(new ApiResponse(200, "Job stats fetched successfully", stats));
});

export const getBookmarkedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({
    user: req.user._id,
    isBookmarked: true,
  })
    .select("-__v")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Bookmarked jobs fetched successfully", jobs));
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, user: req.user._id });

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  job.isBookmarked = !job.isBookmarked;

  const updatedJob = await job.save();
  const cleanJob = await Job.findById(updatedJob._id).select("-__v");

  res
    .status(200)
    .json(new ApiResponse(200, "Bookmark updated successfully", cleanJob));
});
