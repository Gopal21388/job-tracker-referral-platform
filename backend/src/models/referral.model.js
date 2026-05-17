import mongoose from "mongoose";

const referralSchema=new mongoose.Schema({
    requester:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiverEmail:{
      type:String,
      required: [true, "Receiver email is required"],
      lowercase: true,
      trim: true,
    },
    companyName:{
        type:String,
        required:[true,"Company name is required "],
        trim:true,
    },
    jobTitle:{
        type:String,
        required:[true,"Job title is required"],
        trim:true,
    },
    jobLink: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    responseMessage: {
      type: String,
      default: "",
      trim: true,
    },
     
},
    {
        timestamps: true,
     },
  
) 

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;