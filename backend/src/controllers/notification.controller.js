import Notification from "../models/notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .populate("relatedReferral", "companyName jobTitle status")
    .select("-__v")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Notifications fetched successfully",
        notifications
      )
    );
});

export const markNotificationAsRead =asyncHandler(async(req,res)=>{
  const {id}=req.params;
  const notification=await Notification.findOne({_id:id,
    user:req.user._id,
  });

  if(!notification){
    throw new ApiError(404,"Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Notification marked as read", notification));
})

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "All notifications marked as read"));
});
