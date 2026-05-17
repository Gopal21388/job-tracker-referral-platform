 import User from "../models/user.model.js";
 import ApiError from "../utils/ApiError.js";
 import asyncHandler from "../utils/asyncHandler.js"
 import ApiResponse from "../utils/ApiResponse.js"
 import sendEmail from "../services/email.service.js";
 import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.service.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import crypto from "crypto";

export const registerUser= asyncHandler(async(req,res)=>{
    const {name,email,password}=req.body;

    if(!name||!email||!password){
        throw new ApiError(400," All fields are required ");
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
       throw new ApiError(409,"Email already exist with this email");
    }

    const user= await User.create({
        name,
        email,
        password
    });

    const createdUser= await User.findById(user._id).select(
  "-refreshToken -emailVerificationToken -emailVerificationExpire -forgotPasswordToken -forgotPasswordExpire -__v"
);;
    res.status(201).json(new ApiResponse(201,"User created successfully ",createdUser));
});

export const loginUser = asyncHandler(async function(req,res){
    const {email,password}=req.body;
     if(!email||!password){
        throw new ApiError(400,"email and passwor boyh fields are required");
     }

     const user= await User.findOne({email}).select("+password");
     if(!user){
        throw new ApiError(402,"Invalid email or password");
     }
   const isPasswordCorrect = await user.comparePassword(password);
   if(!isPasswordCorrect){
    throw new ApiError(403,"Invalid email or password");
   }
   const accessToken = user.generateAccessToken();
   const refreshToken =user.generateRefreshToken();
   user.refreshToken=refreshToken;
   await user.save({ validateBeforeSave: false });
const loggedInUser = await User.findById(user._id).select(
  "-refreshToken -emailVerificationToken -emailVerificationExpire -forgotPasswordToken -forgotPasswordExpire -__v"
);

    const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    };

    res.status(200).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,"User loggedIn Successfully",{
            user:loggedInUser,
            accessToken
         })
    )

});

export const getMe=asyncHandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,"User profile fetched successfully", req.user))
})

export const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
         {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );
    const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});


export const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken =req.cookies?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token not found");
    }

    const decoded= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
     const user=await User.findById(decoded.id);
     if(!user){
        throw new ApiError(401,"Invalid refresh token")
     }
     if(incomingRefreshToken!==user.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used");
     }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken=refreshToken;
  await user.save({validateBeforeSave:false});

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  res.status(200)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200,"Access token refreshed successfully",{accessToken}

  ));

})

export const changePassword =asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword||!newPassword){
      throw new ApiError(400,"Old password and new password are required");
    }
  
    const user= await User.findById(req.user._id).select("+password");
    if(!user){
      throw new ApiError(404,"User not found");
    }

    const isOldPasswordCorrect = await user.comparePassword(oldPassword);
     if (!isOldPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
    }
    user.password=newPassword;
    await user.save();
     res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));

})


export const forgotPassword=asyncHandler(async(req,res)=>{
      const {email}=req.body;

      if(!email){
        throw new ApiError(400,"Email is required");
      }

      const user=await User.findOne({email});
      if(!user){
        throw new ApiError(404,"User not found with this email");
      }
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
     user.forgotPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Password reset email sent successfully"));
  
})

export const resetPassword =asyncHandler(async(req,res)=>{
      const {token}=req.params;
      const {password}=req.body;
      if(!password){
        throw new ApiError(400,"password is required");
      }

      const hashedToken=crypto.createHash("sha256")
      .update(token)
      .digest("hex");

      const user= await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpire: { $gt: Date.now() },
      })
      if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
    }
    user.password = password;
  user.forgotPasswordToken = null;
  user.forgotPasswordExpire = null;
  user.refreshToken = null;
  await user.save();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Password reset successfully"));
});


export const sendVerificationEmail =asyncHandler(async(req,res)=>{
   const user= await User.findById(req.user._id);
   if(!user){
    throw new ApiError(404,"User not found ");
   }
   if(user.isEmailVerified) {
    throw new ApiError(400,"Email is already verified");
   }  

   const verificationToken  =crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken=crypto.createHash("sha256" )
    .update(verificationToken )
    .digest("hex");
      user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
 
    await user.save({validateBeforeSave:false});

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to:user.email,
      subject:"verify your email",
       html: `
      <h2>Email Verification</h2>
      <p>Please verify your email address.</p>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    })
    res.status(200).json(new ApiResponse(200," Verification Email sent successfully"));
})
export const verifyEmail =asyncHandler(async(req,res)=>{
     const {token}=req.params;

     const hashedToken =crypto.createHash("sha256")
     .update(token).
     digest("hex");

     const user= await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
     })

     if(!user){
      throw new ApiError(400, "Invalid or expired verification token");
     }
     user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpire = null;

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully"));
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.resumePublicId) {
    await deleteFromCloudinary(user.resumePublicId);
  }

  const result = await uploadBufferToCloudinary(
    req.file.buffer,
    "job-tracker/resumes",
    req.file.originalname
  );

  user.resumeUrl = result.secure_url;
  user.resumePublicId = result.public_id;

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "name email role isEmailVerified resumeUrl createdAt updatedAt"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Resume uploaded successfully", updatedUser));
});





export const downloadResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("resumeUrl name");

  if (!user || !user.resumeUrl) {
    throw new ApiError(404, "Resume not found");
  }

  const cloudinaryResponse = await fetch(user.resumeUrl);

  if (!cloudinaryResponse.ok) {
    throw new ApiError(502, "Failed to download resume from storage");
  }

  const arrayBuffer = await cloudinaryResponse.arrayBuffer();
  const resumeBuffer = Buffer.from(arrayBuffer);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
  res.setHeader("Content-Length", resumeBuffer.length);

  res.send(resumeBuffer);
});
