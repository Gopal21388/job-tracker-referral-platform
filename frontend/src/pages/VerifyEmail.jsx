import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus(data.message);
        setSuccess(true);
      } catch (err) {
        setStatus(err.response?.data?.message || "Email verification failed");
        setSuccess(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/75 p-8 text-center shadow-2xl shadow-slate-900/10 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Email verification</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">
          {success ? "Verified" : "Verification"}
        </h1>
        <p className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${success ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          {status}
        </p>
        <Link to="/login" className="mt-6 inline-flex rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white">
          Go to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
