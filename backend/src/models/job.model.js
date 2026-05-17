import mongoose from "mongoose";

const jobSchema =new mongoose.Schema({
      user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
      },
      companyName:{
        type:String,
        required:true,
      },
       jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
      jobLink:{
        type:String,
        trim:true,
        default:""
      },
      location:{
        type:String,
        trim:true,
        default:""
      },
       jobType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract", "remote"],
      default: "full-time",
    },
    status: {
      type: String,
      enum: ["saved", "applied", "interview", "offer", "rejected"],
      default: "saved",
    },
    appliedDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  

})

export default mongoose.model("Job",jobSchema);