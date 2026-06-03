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
  const [externalSearch, setExternalSearch] = useState({ query: "", location: "" });
  const [externalJobs, setExternalJobs] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalMessage, setExternalMessage] = useState("");
  const [savingExternalId, setSavingExternalId] = useState("");
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

  const handleExternalSearchChange = (event) => {
    setExternalSearch({ ...externalSearch, [event.target.name]: event.target.value });
  };

  const searchExternalJobs = async (event) => {
    event.preventDefault();
    setExternalLoading(true);
    setExternalMessage("");
    setError("");

    try {
      const params = new URLSearchParams();
      if (externalSearch.query.trim()) params.set("query", externalSearch.query.trim());
      if (externalSearch.location.trim()) params.set("location", externalSearch.location.trim());

      const { data } = await api.get(`/jobs/external/search?${params.toString()}`);
      const results = data.data.jobs || [];
      setExternalJobs(results);
      setExternalMessage(results.length ? `${results.length} live jobs found.` : "No live jobs found. Try another keyword.");
    } catch (err) {
      setExternalJobs([]);
      setError(err.response?.data?.message || "Failed to search live jobs");
    } finally {
      setExternalLoading(false);
    }
  };

  const saveExternalJob = async (externalJob) => {
    const externalId = externalJob.externalId || externalJob.jobLink;
    setSavingExternalId(externalId);
    setExternalMessage("");
    setError("");

    try {
      await api.post("/jobs/external/save", {
        companyName: externalJob.companyName,
        jobTitle: externalJob.jobTitle,
        jobLink: externalJob.jobLink,
        location: externalJob.location,
        jobType: externalJob.jobType,
        notes: externalJob.description
          ? `Saved from live job search. ${externalJob.description}`
          : "Saved from live job search",
        isBookmarked: true,
      });

      setExternalMessage("Job saved to tracker.");
      await fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save external job");
    } finally {
      setSavingExternalId("");
    }
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

      <div className="rounded-[4xl] border border-emerald-100 bg-emerald-950 p-5 text-white shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-200">Live job search</p>
            <h2 className="mt-2 text-2xl font-black">Search jobs and save them to tracker</h2>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/80">
              Search external job listings from the backend, then save matching roles as bookmarked saved jobs.
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-emerald-100">Source: Arbeitnow</span>
        </div>

        <form onSubmit={searchExternalJobs} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            name="query"
            value={externalSearch.query}
            onChange={handleExternalSearchChange}
            placeholder="Role, skill, or company"
            className="rounded-2xl border border-white/15 bg-white px-4 py-3 text-slate-950 outline-none"
          />
          <input
            name="location"
            value={externalSearch.location}
            onChange={handleExternalSearchChange}
            placeholder="Location, e.g. Remote, India"
            className="rounded-2xl border border-white/15 bg-white px-4 py-3 text-slate-950 outline-none"
          />
          <button disabled={externalLoading} className="rounded-2xl bg-amber-300 px-6 py-3 font-black text-slate-950 disabled:opacity-60">
            {externalLoading ? "Searching..." : "Search jobs"}
          </button>
        </form>

        {externalMessage && <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm font-bold text-emerald-50">{externalMessage}</p>}

        {externalJobs.length > 0 && (
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {externalJobs.map((job) => {
              const externalId = job.externalId || job.jobLink;
              const isSavingThisJob = savingExternalId === externalId;

              return (
                <article key={externalId} className="rounded-3xl border border-white/10 bg-white/95 p-4 text-slate-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-black">{job.jobTitle}</h3>
                      <p className="mt-1 font-bold text-emerald-800">{job.companyName}</p>
                      <p className="mt-2 text-sm text-slate-500">{job.location || "No location"} - {job.jobType}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">
                      {job.source}
                    </span>
                  </div>

                  {job.description && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{job.description}</p>}

                  {job.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.jobLink && (
                      <a href={job.jobLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                        Open job
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={isSavingThisJob}
                      onClick={() => saveExternalJob(job)}
                      className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {isSavingThisJob ? "Saving..." : "Save to tracker"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

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
                  <p className="mt-2 text-sm text-slate-500">{job.location || "No location"} - {job.jobType}</p>
                </div>
                <button type="button" onClick={() => toggleBookmark(job._id)} className="rounded-full bg-amber-100 px-3 py-2 text-sm font-black text-amber-900">
                  {job.isBookmarked ? "Saved" : "Save"}
                </button>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{job.notes || "No notes yet."}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select value={job.status} onChange={(event) => updateJobStatus(job._id, event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold">
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                {job.jobLink && (
                  <a href={job.jobLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-emerald-50 px-4 py-2 font-bold text-emerald-800">Open job</a>
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
