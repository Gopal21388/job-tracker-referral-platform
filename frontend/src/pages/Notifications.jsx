import { useEffect, useState } from "react";
import api from "../services/api.js";

const typeStyles = {
  referral_request: "bg-blue-100 text-blue-900",
  referral_status: "bg-emerald-100 text-emerald-900",
  message: "bg-amber-100 text-amber-900",
  general: "bg-slate-100 text-slate-900",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/notifications");
      setNotifications(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark notifications as read");
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Updates</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950">Notifications</h1>
            <p className="mt-3 text-slate-600">Referral requests, status changes, and message updates land here.</p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="w-fit rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Mark all read
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.7rem] bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/10">
          <p className="text-sm font-bold text-slate-300">Total</p>
          <p className="mt-3 text-5xl font-black">{notifications.length}</p>
        </div>
        <div className="rounded-[1.7rem] bg-amber-100 p-5 text-amber-950 shadow-lg shadow-slate-900/5">
          <p className="text-sm font-bold opacity-75">Unread</p>
          <p className="mt-3 text-5xl font-black">{unreadCount}</p>
        </div>
        <div className="rounded-[1.7rem] bg-emerald-100 p-5 text-emerald-950 shadow-lg shadow-slate-900/5">
          <p className="text-sm font-bold opacity-75">Read</p>
          <p className="mt-3 text-5xl font-black">{notifications.length - unreadCount}</p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
        {loading ? (
          <p className="font-bold text-slate-600">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-8 text-center">
            <h2 className="text-2xl font-black text-slate-950">No notifications yet</h2>
            <p className="mt-2 text-slate-600">Referral and message activity will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-3xl border p-4 transition ${
                  notification.isRead
                    ? "border-slate-100 bg-white"
                    : "border-emerald-200 bg-emerald-50/70"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${typeStyles[notification.type] || typeStyles.general}`}>
                        {notification.type.replace("_", " ")}
                      </span>
                      {!notification.isRead && (
                        <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-black text-white">new</span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-black text-slate-950">{notification.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                    {notification.relatedReferral && (
                      <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                        {notification.relatedReferral.companyName} - {notification.relatedReferral.jobTitle} ({notification.relatedReferral.status})
                      </p>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification._id)}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-900 hover:text-white"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
