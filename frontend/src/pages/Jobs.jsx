import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const initialForm = {
  companyName: "",
  jobTitle: "",
  jobLink: "",
  location: "",
  jobType: "full-time",
  status: "saved",
  appliedDate: "",
  notes: "",
  isBookmarked: false,
};

const statusOptions = ["saved", "applied", "interview", "offer", "rejected"];
const jobTypeOptions = ["full-time", "part-time", "internship", "contract", "remote"];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", jobType: "", isBookmarked: "", page: 1 });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", filters.page);
    params.set("limit", 8);

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.isBookmarked) params.set("isBookmarked", filters.isBookmarked);

    return params.toString();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/jobs?${queryString}`);
      setJobs(data.data.jobs);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [queryString]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value, page: 1 });
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        appliedDate: form.appliedDate || undefined,
      };

      await api.post("/jobs", payload);
      setForm(initialForm);
      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      await api.patch(`/jobs/${jobId}`, { status });
      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update job");
    }
  };

  const toggleBookmark = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/bookmark`);
      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bookmark");
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm("Delete this job?");
    if (!confirmed) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[4xl] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Applications</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">Jobs</h1>
        <p className="mt-3 text-slate-600">Create, filter, bookmark, and move jobs through your pipeline.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <form onSubmit={handleCreateJob} className="rounded-[4xl] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-black text-slate-950">Add job</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input name="companyName" value={form.companyName} onChange={handleFormChange} placeholder="Company name" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="jobTitle" value={form.jobTitle} onChange={handleFormChange} placeholder="Job title" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="jobLink" value={form.jobLink} onChange={handleFormChange} placeholder="Job link" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="location" value={form.location} onChange={handleFormChange} placeholder="Location" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select name="jobType" value={form.jobType} onChange={handleFormChange} className="rounded-2xl border border-slate-200 px-4 py-3">
            {jobTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleFormChange} className="rounded-2xl border border-slate-200 px-4 py-3">
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <input name="appliedDate" type="date" value={form.appliedDate} onChange={handleFormChange} className="rounded-2xl border border-slate-200 px-4 py-3" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">
            <input name="isBookmarked" type="checkbox" checked={form.isBookmarked} onChange={handleFormChange} />
            Bookmark
          </label>
          <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Notes" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2 xl:col-span-3" />
        </div>
        <button disabled={saving} className="mt-4 rounded-2xl bg-emerald-900 px-6 py-3 font-bold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Add job"}
        </button>
      </form>

      <div className="rounded-[4xl] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
        <div className="grid gap-3 md:grid-cols-4">
          <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search company or title" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="">All types</option>
            {jobTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="isBookmarked" value={filters.isBookmarked} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-3">
            <option value="">All bookmarks</option>
            <option value="true">Bookmarked</option>
            <option value="false">Not bookmarked</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          <p className="rounded-2xl bg-white/75 p-5 font-bold text-slate-600">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="rounded-2xl bg-white/75 p-5 font-bold text-slate-600">No jobs found.</p>
        ) : (
          jobs.map((job) => (
            <article key={job._id} className="rounded-[4xl] border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-900/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{job.jobTitle}</h2>
                  <p className="mt-1 font-bold text-emerald-800">{job.companyName}</p>
                  <p className="mt-2 text-sm text-slate-500">{job.location || "No location"} • {job.jobType}</p>
                </div>
                <button type="button" onClick={() => toggleBookmark(job._id)} className="rounded-full bg-amber-100 px-3 py-2 text-sm font-black text-amber-900">
                  {job.isBookmarked ? "★" : "☆"}
                </button>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{job.notes || "No notes yet."}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select value={job.status} onChange={(event) => updateJobStatus(job._id, event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold">
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {job.jobLink && (
                  <a href={job.jobLink} target="_blank" className="rounded-2xl bg-emerald-50 px-4 py-2 font-bold text-emerald-800">Open job</a>
                )}
                <button type="button" onClick={() => deleteJob(job._id)} className="rounded-2xl bg-red-50 px-4 py-2 font-bold text-red-700">Delete</button>
              </div>
            </article>
          ))
        )}
      </div>

      {pagination && (
        <div className="flex items-center justify-between rounded-[4xl] bg-white/75 p-4 shadow-lg shadow-slate-900/5">
          <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="rounded-2xl bg-slate-100 px-4 py-2 font-bold disabled:opacity-40">
            Previous
          </button>
          <p className="font-bold text-slate-600">Page {pagination.currentPage} of {pagination.totalPages || 1}</p>
          <button disabled={filters.page >= (pagination.totalPages || 1)} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="rounded-2xl bg-slate-100 px-4 py-2 font-bold disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Jobs;
