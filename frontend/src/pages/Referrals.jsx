import { useEffect, useState } from "react";
import api from "../services/api.js";

const initialForm = {
  receiverEmail: "",
  companyName: "",
  jobTitle: "",
  jobLink: "",
  message: "",
};

const Referrals = () => {
  const [activeTab, setActiveTab] = useState("sent");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [form, setForm] = useState(initialForm);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReferrals = async () => {
    try {
      setLoading(true);
      setError("");
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/referrals/sent"),
        api.get("/referrals/received"),
      ]);
      setSent(sentResponse.data.data);
      setReceived(receivedResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (referralId) => {
    try {
      const { data } = await api.get(`/messages/${referralId}`);
      setMessages(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleFormChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const createReferral = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/referrals", form);
      setForm(initialForm);
      await loadReferrals();
      setActiveTab("sent");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create referral");
    }
  };

  const selectReferral = async (referral) => {
    setSelectedReferral(referral);
    setResponseMessage(referral.responseMessage || "");
    await loadMessages(referral._id);
  };

  const updateStatus = async (status) => {
    if (!selectedReferral) return;

    try {
      setError("");
      const { data } = await api.patch(`/referrals/${selectedReferral._id}/status`, {
        status,
        responseMessage,
      });
      setSelectedReferral(data.data);
      await loadReferrals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update referral");
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!selectedReferral || !messageText.trim()) return;

    try {
      setError("");
      await api.post("/messages", {
        referralId: selectedReferral._id,
        content: messageText,
      });
      setMessageText("");
      await loadMessages(selectedReferral._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const cancelReferral = async (referralId) => {
    const confirmed = window.confirm("Cancel this pending referral?");
    if (!confirmed) return;

    try {
      await api.delete(`/referrals/${referralId}`);
      if (selectedReferral?._id === referralId) {
        setSelectedReferral(null);
        setMessages([]);
      }
      await loadReferrals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel referral");
    }
  };

  const list = activeTab === "sent" ? sent : received;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">Network</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">Referrals</h1>
        <p className="mt-3 text-slate-600">Request referrals, respond to incoming requests, and keep the conversation moving.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <form onSubmit={createReferral} className="rounded-[2rem] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-black text-slate-950">Request referral</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="receiverEmail" value={form.receiverEmail} onChange={handleFormChange} placeholder="Receiver email" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="companyName" value={form.companyName} onChange={handleFormChange} placeholder="Company" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="jobTitle" value={form.jobTitle} onChange={handleFormChange} placeholder="Job title" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <input name="jobLink" value={form.jobLink} onChange={handleFormChange} placeholder="Job link" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <textarea name="message" value={form.message} onChange={handleFormChange} placeholder="Message" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" />
        </div>
        <button className="mt-4 rounded-2xl bg-emerald-900 px-6 py-3 font-bold text-white">Send request</button>
      </form>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
          <div className="mb-4 flex gap-2">
            {[
              { key: "sent", label: `Sent (${sent.length})` },
              { key: "received", label: `Received (${received.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-4 py-2 text-sm font-bold ${activeTab === tab.key ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="font-bold text-slate-600">Loading referrals...</p>
          ) : list.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-600">No referrals found.</p>
          ) : (
            <div className="space-y-3">
              {list.map((referral) => (
                <article key={referral._id} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <button type="button" onClick={() => selectReferral(referral)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950">{referral.companyName}</h3>
                        <p className="text-sm font-semibold text-slate-600">{referral.jobTitle}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{referral.status}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500">{referral.message}</p>
                  </button>
                  {activeTab === "sent" && referral.status === "pending" && (
                    <button type="button" onClick={() => cancelReferral(referral._id)} className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                      Cancel request
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white/75 p-5 shadow-xl shadow-slate-900/5">
          {!selectedReferral ? (
            <div className="grid min-h-80 place-items-center rounded-3xl bg-slate-50 p-6 text-center text-slate-500">
              Select a referral to view details and messages.
            </div>
          ) : (
            <div>
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">{selectedReferral.status}</p>
                <h2 className="mt-2 text-2xl font-black">{selectedReferral.companyName}</h2>
                <p className="text-slate-300">{selectedReferral.jobTitle}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">{selectedReferral.message}</p>
              </div>

              {activeTab === "received" && selectedReferral.status === "pending" && (
                <div className="mt-4 rounded-3xl bg-amber-50 p-4">
                  <textarea value={responseMessage} onChange={(event) => setResponseMessage(event.target.value)} placeholder="Response message" className="min-h-24 w-full rounded-2xl border border-amber-200 px-4 py-3" />
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => updateStatus("accepted")} className="rounded-2xl bg-emerald-900 px-4 py-2 font-bold text-white">Accept</button>
                    <button type="button" onClick={() => updateStatus("rejected")} className="rounded-2xl bg-red-100 px-4 py-2 font-bold text-red-700">Reject</button>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="text-xl font-black text-slate-950">Messages</h3>
                <div className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-3xl bg-slate-50 p-4">
                  {messages.length === 0 ? (
                    <p className="text-sm font-semibold text-slate-500">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message._id} className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-xs font-bold text-emerald-700">{message.sender?.name || "User"}</p>
                        <p className="mt-1 text-sm text-slate-700">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                  <input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message" className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3" />
                  <button className="rounded-2xl bg-emerald-900 px-5 py-3 font-bold text-white">Send</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Referrals;
