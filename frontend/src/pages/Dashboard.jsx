import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { setCredentials } from "../redux/features/authSlice.js";

const statCards = [
  { key: "totalJobs", label: "Total jobs", detail: "All tracked roles", accent: "bg-cyan-400" },
  { key: "applied", label: "Applied", detail: "Applications sent", accent: "bg-blue-400" },
  { key: "interview", label: "Interviews", detail: "Active interview loops", accent: "bg-amber-400" },
  { key: "offer", label: "Offers", detail: "Potential wins", accent: "bg-emerald-400" },
  { key: "rejected", label: "Rejected", detail: "Closed outcomes", accent: "bg-rose-400" },
  { key: "bookmarked", label: "Bookmarked", detail: "Saved opportunities", accent: "bg-violet-400" },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");
        setLoading(true);

        const [meResponse, statsResponse, jobsResponse, notificationsResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/jobs/stats"),
          api.get("/jobs?page=1&limit=4"),
          api.get("/notifications"),
        ]);

        dispatch(
          setCredentials({
            user: meResponse.data.data,
            accessToken,
          })
        );

        setStats(statsResponse.data.data);
        setRecentJobs(jobsResponse.data.data.jobs || []);
        setNotifications((notificationsResponse.data.data || []).slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [accessToken, dispatch]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-emerald-700">Overview</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">
              Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Track your job search pipeline, referrals, messages, and resume from one workspace.
            </p>
          </div>
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
            {user?.isEmailVerified ? "Verified account" : "Email not verified"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <article key={card.key} className="rounded-[1.6rem] border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-800">{card.label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{card.detail}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${card.accent}`} />
            </div>
            <p className="mt-6 text-5xl font-black tracking-[-0.06em] text-slate-950">
              {loading ? "..." : stats?.[card.key] ?? 0}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Recent jobs</h2>
              <p className="mt-1 text-sm text-slate-500">Latest applications in your tracker.</p>
            </div>
            <a href="/jobs" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">View all</a>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-500">Loading jobs...</p>
            ) : recentJobs.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-500">No jobs yet. Add your first application.</p>
            ) : (
              recentJobs.map((job) => (
                <div key={job._id} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{job.jobTitle}</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-800">{job.companyName}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{job.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{job.location || "No location"} - {job.jobType}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-emerald-200/40 bg-emerald-900 p-6 text-white shadow-xl shadow-emerald-950/20">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Activity</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{unreadCount} unread</span>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <p className="text-sm text-emerald-50/80">Loading activity...</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-emerald-50/80">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id} className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{notification.type.replace("_", " ")}</p>
                    <p className="mt-2 font-black">{notification.title}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-50/75">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
            <h2 className="text-2xl font-black text-slate-950">Next actions</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
              <li className="rounded-2xl bg-slate-50 p-4">Update interview statuses after recruiter calls.</li>
              <li className="rounded-2xl bg-slate-50 p-4">Check referral responses and unread messages.</li>
              <li className="rounded-2xl bg-slate-50 p-4">Upload your latest resume from Profile.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
