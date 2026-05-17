import mongoose from "mongoose";

const notificationSchema= new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["referral_request", "referral_status", "message", "general"],
      default: "general",
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    relatedReferral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
    },
},
 {
    timestamps: true,
  }


)
 const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;