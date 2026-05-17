import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Referral from "../models/referral.model.js";
import User from "../models/user.model.js";
import { createNotification } from "../services/notification.service.js";

export const createReferral =asyncHandler(async(req,res)=>{
    const {receiverEmail, companyName, jobTitle, jobLink, message}=req.body;
    if(!receiverEmail||!companyName||!jobTitle||!message){
    throw new ApiError(
      400,
      "Receiver email, company name, job title and message are required"
    );
    }
    const referral =await Referral.create({
        requester: req.user._id,
        receiverEmail,
        companyName,
        jobTitle,
        jobLink,
        message,
    })

     const receiverUser = await User.findOne({ email: receiverEmail });

if (receiverUser) {
  await createNotification({
    user: receiverUser._id,
    type: "referral_request",
    title: "New referral request",
    message: `${req.user.name} requested a referral for ${companyName} - ${jobTitle}`,
    relatedReferral: referral._id,
  });
}

    res
    .status(201)
    .json(new ApiResponse(201, "Referral request created successfully", referral));
})


export const getSentReferrals =asyncHandler(async(req,res)=>{
    const referrals =await Referral.find({requester: req.user._id}).select("-__v").sort({createdAt:-1});
    res.status(200).json(new ApiResponse(200,"Sent referrals fetched successfully",referrals));
})

export const getReceivedReferrals =asyncHandler(async(req,res)=>{
    const referrals=await Referral.find({
      receiverEmail: req.user.email,
    }).populate("requester", "name email")
    .select("-__v")
    .sort({ createdAt: -1 });
     res
    .status(200)
    .json(
      new ApiResponse(200, "Received referrals fetched successfully", referrals)
    );

})


export const updateReferralStatus =asyncHandler(async(req,res)=>{
    const { id } = req.params;
  const { status, responseMessage } = req.body;
  if (!status) {
    throw new ApiError(400, "Status is required");
  }
  if(!["accepted","rejected"].includes(status)){
        throw new ApiError(400, "Status must be accepted or rejected");
  }

  const referral=await Referral.findOne({
    _id: id,
    receiverEmail: req.user.email,
  })
  if (!referral) {
    throw new ApiError(404, "Referral not found");
  }
  referral.status = status;

  if (responseMessage !== undefined) {
    referral.responseMessage = responseMessage;
  }

  const updatedReferral = await referral.save();

  await createNotification({
  user: referral.requester,
  type: "referral_status",
  title: "Referral status updated",
  message: `Your referral request for ${referral.companyName} - ${referral.jobTitle} was ${status}`,
  relatedReferral: referral._id,
});


  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Referral status updated successfully",
        updatedReferral
      )
    );

})

export const getReferralById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const referral = await Referral.findOne({
    _id: id,
    $or: [
      { requester: req.user._id },
      { receiverEmail: req.user.email },
    ],
  })
    .populate("requester", "name email")
    .select("-__v");

  if (!referral) {
    throw new ApiError(404, "Referral not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Referral fetched successfully", referral));
});

export const cancelReferral =asyncHandler(async(req,res)=>{
     const {id}=req.params;
     const referral =await Referral.findOne({
      _id:id,
      requester:req.user._id,
     });
     if(!referral){
       throw new ApiError(404, "Referral not found");

     }
     if(referral.status!="pending"){
      throw new ApiError(400, "Only pending referrals can be cancelled");
     }
     await referral.deleteOne();
     res
    .status(200)
    .json(new ApiResponse(200, "Referral cancelled successfully"));
})


