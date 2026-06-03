import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/api.js";
import { clearCredentials } from "../../redux/features/authSlice.js";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Jobs", path: "/jobs" },
  { label: "Referrals", path: "/referrals" },
  { label: "Notifications", path: "/notifications" },
  { label: "Profile", path: "/profile" },
];

const NavItems = ({ onNavigate }) => (
  <nav className="space-y-2">
    {navItems.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition duration-200 ${
            isActive
              ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20"
              : "text-slate-600 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span>{item.label}</span>
            <span
              className={`h-2 w-2 rounded-full transition ${
                isActive ? "bg-white" : "bg-emerald-300 opacity-0 group-hover:opacity-100"
              }`}
            />
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local logout should still happen if the server token is already invalid.
    } finally {
      dispatch(clearCredentials());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen px-4 py-5 text-slate-900 md:px-8">
      <div className="mx-auto flex max-w-7xl gap-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur md:block">
          <div className="mb-8 rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-5 shadow-inner shadow-slate-900/5">
            <div className="mb-5 h-10 w-10 rounded-2xl bg-emerald-900" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">JobFlow</p>
            <h1 className="mt-3 text-2xl font-black leading-tight text-slate-950">Tracker + Referrals</h1>
          </div>
          <NavItems />
          <button type="button" onClick={toggleTheme} className="theme-toggle mt-6">
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </button>
          <div className="mt-4 rounded-3xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-600 shadow-inner shadow-slate-900/5">
            <p className="font-black text-slate-800">Signed in</p>
            <p className="mt-1 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
          >
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="sticky top-3 z-30 mb-5 rounded-[1.5rem] border border-white/70 bg-white/85 p-3 shadow-lg shadow-slate-900/5 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">JobFlow</p>
                <p className="max-w-[11rem] truncate text-sm font-black text-slate-950">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-2xl bg-emerald-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/20"
              >
                {mobileOpen ? "Close" : "Menu"}
              </button>
            </div>
            {mobileOpen && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <NavItems onNavigate={() => setMobileOpen(false)} />
                <button type="button" onClick={toggleTheme} className="theme-toggle mt-3">
                  {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
