import React, { useState } from 'react';
import { X, HelpCircle, Loader2, AlertCircle, CheckCircle2, MessageSquare, Mail, User } from 'lucide-react';

export function DiscussionModal({ isOpen, onClose, insurer, onDiscussionCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !insurer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a question title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/insurers/${insurer.id}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_title: title.trim(),
          question_body: body.trim(),
          author_name: authorName.trim() || 'Ontario Driver',
          author_email: authorEmail.trim() || null,
          category
        })
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        if (onDiscussionCreated) {
          onDiscussionCreated(json.data);
        }
      } else {
        setError(json.error || 'Failed to post question');
      }
    } catch (err) {
      console.error(err);
      setError('Network error posting question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError(null);
    setTitle('');
    setBody('');
    setAuthorName('');
    setAuthorEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Question Posted</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Your question regarding <strong className="text-white">{insurer.name}</strong> is now live for Ontario drivers and licensed brokers to answer.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Ask About {insurer.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Community Q&A • Ask about claims, discounts, broker requirements, or renewal rates
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'pricing', label: 'Rates & Hikes' },
                    { id: 'claims', label: 'Claims' },
                    { id: 'coverage', label: 'Endorsements' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        category === cat.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Question Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Does CAA MyPace increase your rate after 1,000 km in a single road trip?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Additional Details (Optional)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Context helps get better answers</span>
                </label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Provide background, vehicle type, or specific Ontario policy wording questions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Dave M. or Ontario Commuter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    Email (Private for reply alerts)
                  </label>
                  <input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-300 hover:opacity-95 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 fill-slate-950" />
                    <span>Post Question to Community</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
