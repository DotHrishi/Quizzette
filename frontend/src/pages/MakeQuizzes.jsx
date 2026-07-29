import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Close, Email, Add, CheckCircle } from "@mui/icons-material";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MakeQuizzes() {
  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "easy",
    numQuestions: 5,
    duration: 15,
    creatorName: "",
  });

  const [loading, setLoading]   = useState(false);
  const [quizCode, setQuizCode] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null); // store full quiz info for email
  const [error, setError]       = useState(null);

  // ── Email modal state ─────────────────────────────────────────────────────
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput]         = useState("");
  const [emails, setEmails]                 = useState([]);
  const [emailFieldError, setEmailFieldError] = useState("");
  const [sending, setSending]               = useState(false);
  const [sendResult, setSendResult]         = useState(null); // { ok, message }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuizCode(null);
    setQuizMeta(null);
    setEmails([]);
    setSendResult(null);

    try {
      const response = await fetch(`${API}/api/quiz/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setQuizCode(data.quizCode);
      setQuizMeta({ ...formData });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // ── Email tag input helpers ───────────────────────────────────────────────
  const addEmail = () => {
    const val = emailInput.trim().toLowerCase();
    if (!val) return;
    if (!EMAIL_REGEX.test(val)) {
      setEmailFieldError("Please enter a valid email address.");
      return;
    }
    if (emails.includes(val)) {
      setEmailFieldError("This email is already added.");
      return;
    }
    setEmails((prev) => [...prev, val]);
    setEmailInput("");
    setEmailFieldError("");
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
    if (e.key === "Backspace" && !emailInput && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const removeEmail = (addr) => {
    setEmails((prev) => prev.filter((e) => e !== addr));
  };

  const handleSendEmails = async () => {
    if (emails.length === 0) {
      setEmailFieldError("Add at least one email before sending.");
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API}/api/email/send-quiz-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          quizCode,
          topic: quizMeta.topic,
          difficulty: quizMeta.difficulty,
          numQuestions: quizMeta.numQuestions,
          duration: quizMeta.duration,
          creatorName: quizMeta.creatorName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send.");
      setSendResult({ ok: true, message: data.message });
    } catch (err) {
      setSendResult({ ok: false, message: err.message });
    }
    setSending(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-black via-[#183fa0] to-[#1900ff] dark:from-white dark:via-blue-400 dark:to-[#1900ff] text-transparent bg-clip-text">
            Generate AI Quiz
          </h1>
          <p className="text-gray-500 text-lg">Provide a topic and let our AI craft a custom assessment instantly.</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-blue-600 border-r-8 border-b-8 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 relative">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Quiz Topic</label>
              <input
                type="text" name="topic" placeholder="e.g. JavaScript Arrays, World War 2"
                value={formData.topic} onChange={handleChange}
                className="w-full border-2 border-gray-200 dark:border-neutral-700 p-4 rounded-sm bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none text-lg text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                  className="w-full border-2 border-gray-200 dark:border-neutral-700 p-4 rounded-sm bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none text-lg text-gray-800 dark:text-white font-medium capitalize">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Questions Count</label>
                <input type="number" name="numQuestions" min="1" max="50" placeholder="Max 50"
                  value={formData.numQuestions} onChange={handleChange}
                  className="w-full border-2 border-gray-200 dark:border-neutral-700 p-4 rounded-sm bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none text-lg text-gray-800 dark:text-white font-medium"
                  required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Duration (Mins)</label>
                <input type="number" name="duration" min="1" max="180" placeholder="e.g. 15"
                  value={formData.duration} onChange={handleChange}
                  className="w-full border-2 border-gray-200 dark:border-neutral-700 p-4 rounded-sm bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none text-lg text-gray-800 dark:text-white font-medium"
                  required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Creator Name</label>
                <input type="text" name="creatorName" placeholder="Your Name"
                  value={formData.creatorName} onChange={handleChange}
                  className="w-full border-2 border-gray-200 dark:border-neutral-700 p-4 rounded-sm bg-gray-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none text-lg text-gray-800 dark:text-white font-medium"
                  required />
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={loading}
                className="w-full md:w-auto px-12 py-4 text-black text-xl font-bold tracking-wide rounded-sm bg-green-500 transform transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : "Create"}
              </button>
            </div>
          </form>

          {/* Success Banner */}
          {quizCode && (
            <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 text-green-900 rounded-r-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎉</span>
                <h3 className="text-xl font-bold">Quiz Successfully Generated!</h3>
              </div>
              <p className="text-green-800 mb-4">Share this code with your participants to let them take the quiz.</p>
              <div className="inline-block bg-white px-6 py-2 border-2 border-green-200 font-mono text-3xl font-black text-green-700 tracking-widest rounded-sm shadow-sm select-all mb-5">
                {quizCode}
              </div>
              <div>
                <button
                  onClick={() => { setShowEmailModal(true); setSendResult(null); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#000dff] text-green-300 font-bold rounded-sm hover:bg-blue-800 transition-all hover:scale-105"
                >
                  <Email fontSize="small" />
                  Send Code via Email
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 rounded-r-sm flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
              <span className="text-xl">⚠</span>
              <span className="font-semibold">{error}</span>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* ── EMAIL MODAL ────────────────────────────────────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowEmailModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-blue-600 border-r-8 border-b-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#000dff] text-green-300 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
                <Email fontSize="small" />
                Send Quiz Invitation
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <Close fontSize="small" />
              </button>
            </div>

            <div className="p-6">
              {/* Quiz code badge */}
              <div className="flex items-center gap-3 mb-6 bg-blue-50 border border-blue-200 rounded-sm p-4">
                <div className="font-mono text-2xl font-black text-[#000dff] tracking-widest">{quizCode}</div>
                <div className="text-sm text-gray-500">
                  <p className="font-semibold text-gray-800">{quizMeta?.topic}</p>
                  <p className="capitalize">{quizMeta?.difficulty} · {quizMeta?.numQuestions} Qs · {quizMeta?.duration} mins</p>
                </div>
              </div>

              {/* Email tag input */}
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Recipient Emails
              </label>
              <div
                className={`flex flex-wrap gap-2 min-h-[52px] w-full border-2 rounded-sm p-2 bg-gray-50 cursor-text transition-colors ${
                  emailFieldError ? "border-red-400" : "border-gray-200 focus-within:border-blue-600"
                }`}
                onClick={() => document.getElementById("email-tag-input").focus()}
              >
                {emails.map((addr) => (
                  <span key={addr} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {addr}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeEmail(addr); }}
                      className="ml-1 text-blue-500 hover:text-red-500 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="email-tag-input"
                  type="text"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailFieldError(""); }}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmail}
                  placeholder={emails.length === 0 ? "Type email and press Enter or comma…" : ""}
                  className="flex-1 min-w-[180px] outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400 py-1"
                />
              </div>

              {/* Add button for mouse users */}
              <div className="flex items-center justify-between mt-2 mb-1">
                {emailFieldError
                  ? <p className="text-red-500 text-xs font-medium">{emailFieldError}</p>
                  : <p className="text-gray-400 text-xs">Press <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> or <kbd className="bg-gray-100 px-1 rounded">,</kbd> to add · Backspace to remove last</p>
                }
                <button
                  type="button"
                  onClick={addEmail}
                  disabled={!emailInput.trim()}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Add fontSize="inherit" /> Add
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-1 mb-6">{emails.length} recipient{emails.length !== 1 ? "s" : ""} added · max 50</p>

              {/* Send result feedback */}
              {sendResult && (
                <div className={`mb-4 p-3 rounded-sm flex items-center gap-2 text-sm font-semibold border-l-4 ${
                  sendResult.ok
                    ? "bg-green-50 border-green-500 text-green-800"
                    : "bg-red-50 border-red-500 text-red-800"
                }`}>
                  {sendResult.ok && <CheckCircle fontSize="small" className="text-green-600" />}
                  {sendResult.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSendEmails}
                  disabled={sending || emails.length === 0}
                  className="flex-1 px-4 py-3 font-bold text-green-300 bg-[#000dff] hover:bg-blue-800 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <Email fontSize="small" />
                      Send to {emails.length || ""} {emails.length === 1 ? "Recipient" : "Recipients"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
