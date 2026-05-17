import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../services/api.js";
import { clearCredentials } from "../redux/features/authSlice.js";

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      dispatch(clearCredentials());
      setMessage(`${data.message}. Please login with your new password.`);
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">New password</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">Reset password</h1>
        {message && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700"
        />
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white disabled:opacity-60">
          {loading ? "Resetting..." : "Reset password"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Back to <Link to="/login" className="font-bold text-emerald-800">login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
