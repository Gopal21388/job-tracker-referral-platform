import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { setCredentials } from "../redux/features/authSlice.js";

const Profile = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(user);
  const [resume, setResume] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setError("");
      const { data } = await api.get("/auth/me");
      setProfile(data.data);
      dispatch(setCredentials({ user: data.data, accessToken }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const uploadResume = async (event) => {
    event.preventDefault();

    if (!resume) {
      setError("Please select a PDF resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      setLoading(true);
      setError("");
      setMessage("");
      const { data } = await api.post("/auth/resume", formData);
      setProfile(data.data);
      dispatch(setCredentials({ user: data.data, accessToken }));
      setResume(null);
      event.target.reset();
      setMessage("Resume uploaded successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const { data } = await api.post("/auth/send-verification-email");
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");
      const { data } = await api.post("/auth/change-password", passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };


  const downloadResume = async () => {
    try {
      setError("");
      setMessage("");
      const response = await api.get("/auth/resume/download", {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download resume");
    }
  };
  const isVerified = Boolean(profile?.isEmailVerified);
  const hasResume = Boolean(profile?.resumeUrl);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="absolute -right-14 -top-20 h-44 w-44 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-20 h-20 w-20 rounded-full bg-amber-200/60 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Account</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">Profile</h1>
          <p className="mt-3 text-slate-600">Manage your identity, resume, email verification, and password.</p>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="group rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-emerald-800 to-emerald-950 text-4xl font-black text-white shadow-xl shadow-emerald-950/20 transition duration-300 group-hover:rotate-2 group-hover:scale-105">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-950">{profile?.name || "User"}</h2>
          <p className="mt-1 font-semibold text-slate-600">{profile?.email}</p>

          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Role</p>
              <p className="mt-2 text-base text-slate-900">{profile?.role || "user"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
              <p className="mt-2 text-base text-slate-900">{isVerified ? "Verified" : "Not verified"}</p>
            </div>
          </div>

          {hasResume ? (
            <button
              type="button"
              onClick={downloadResume}
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-900 transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              <span>Resume uploaded</span>
              <span className="text-sm">Download PDF</span>
            </button>
          ) : (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">No resume uploaded yet</p>
          )}

          {!isVerified && (
            <button
              type="button"
              disabled={loading}
              onClick={sendVerificationEmail}
              className="mt-5 rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:opacity-60"
            >
              Send verification email
            </button>
          )}
        </div>

        <div className="space-y-5">
          <form onSubmit={uploadResume} className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Upload resume</h2>
                <p className="mt-2 text-sm text-slate-600">PDF only, max 2MB.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${hasResume ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {hasResume ? "Resume live" : "Action needed"}
              </span>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-8 text-center transition hover:border-emerald-700 hover:bg-emerald-50">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setResume(event.target.files?.[0] || null)}
                className="sr-only"
              />
              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-900 shadow-sm">
                Choose PDF
              </span>
              <span className="mt-3 max-w-full truncate text-sm font-semibold text-slate-600">
                {resume ? resume.name : "Click to select your latest resume"}
              </span>
            </label>

            <button disabled={loading} className="mt-4 rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:opacity-60">
              {loading ? "Uploading..." : "Upload resume"}
            </button>
          </form>

          <form onSubmit={changePassword} className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/10">
            <h2 className="text-2xl font-black text-slate-950">Change password</h2>
            <p className="mt-2 text-sm text-slate-600">Keep your account safe with a fresh password.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, oldPassword: event.target.value })}
                placeholder="Old password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                placeholder="New password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <button disabled={loading} className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60">
              Change password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Profile;


