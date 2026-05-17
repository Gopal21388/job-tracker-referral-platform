import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Message from "../models/message.model.js";
import Referral from "../models/referral.model.js";
import User from "../models/user.model.js";
import { createNotification } from "../services/notification.service.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { referralId, content } = req.body;

  if (!referralId || !content) {
    throw new ApiError(400, "Referral id and message content are required");
  }

  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new ApiError(404, "Referral not found");
  }

  const isRequester = referral.requester.toString() === req.user._id.toString();
  const isReceiver = referral.receiverEmail === req.user.email;

  if (!isRequester && !isReceiver) {
    throw new ApiError(403, "You are not allowed to message in this referral");
  }

  const message = await Message.create({
    referral: referral._id,
    sender: req.user._id,
    content,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email")
    .select("-__v");

  let notificationUserId = null;

  if (isRequester) {
    const receiverUser = await User.findOne({ email: referral.receiverEmail });

    if (receiverUser) {
      notificationUserId = receiverUser._id;
    }
  } else {
    notificationUserId = referral.requester;
  }

  if (notificationUserId) {
    await createNotification({
      user: notificationUserId,
      type: "message",
      title: "New message",
      message: `${req.user.name} sent a message`,
      relatedReferral: referral._id,
    });
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", populatedMessage));
});

export const getMessagesByReferral = asyncHandler(async (req, res) => {
  const { referralId } = req.params;

  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new ApiError(404, "Referral not found");
  }

  const isRequester = referral.requester.toString() === req.user._id.toString();
  const isReceiver = referral.receiverEmail === req.user.email;

  if (!isRequester && !isReceiver) {
    throw new ApiError(403, "You are not allowed to view these messages");
  }

  const messages = await Message.find({ referral: referralId })
    .populate("sender", "name email")
    .select("-__v")
    .sort({ createdAt: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Messages fetched successfully", messages));
});
