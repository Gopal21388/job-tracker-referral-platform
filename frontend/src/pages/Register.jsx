import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[4xl] border border-white/70 bg-white/75 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Start tracking</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">Create account</h1>
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="mt-6 space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700" />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-700" />
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-bold text-emerald-800">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
