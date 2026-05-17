import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="rounded-[2rem] bg-white/75 p-8 text-center shadow-xl">
        <h1 className="text-5xl font-black">404</h1>
        <p className="mt-3 text-slate-600">This page does not exist.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white">Back home</Link>
      </div>
    </div>
  );
};

export default NotFound;
