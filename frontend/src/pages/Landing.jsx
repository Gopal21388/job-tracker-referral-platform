import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen px-6 py-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm">
            Production-style job search workspace
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tighter text-slate-950 md:text-7xl">
            Track every application. Turn referrals into momentum.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-650">
            A focused dashboard for applications, referral requests, messages, resumes, and status updates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-2xl bg-emerald-900 px-6 py-3 font-bold text-white shadow-xl shadow-emerald-900/20">
              Create account
            </Link>
            <Link to="/login" className="rounded-2xl border border-slate-900/10 bg-white/70 px-6 py-3 font-bold text-slate-900">
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/70 bg-white/65 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="rounded-[4xl] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">Today</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {["Applied", "Interview", "Referrals", "Unread"].map((label, index) => (
                <div key={label} className="rounded-3xl bg-white/10 p-4">
                  <p className="text-3xl font-black">{[12, 4, 3, 7][index]}</p>
                  <p className="mt-1 text-sm text-slate-300">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl bg-emerald-300 p-5 text-slate-950">
              <p className="font-black">Google - Backend Developer</p>
              <p className="mt-2 text-sm font-semibold">Referral accepted. Send resume and follow up.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
