import Notification from "../models/notification.model.js";

export const createNotification = async ({
  user,
  type = "general",
  title,
  message,
  relatedReferral = null,
}) => {
  if (!user || !title || !message) {
    return null;
  }

  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    relatedReferral,
  });

  return notification;
};
