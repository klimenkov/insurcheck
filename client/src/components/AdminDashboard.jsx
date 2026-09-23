import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Search, Trash2, Edit3, Check, X, 
  MessageSquare, FileText, Users, DollarSign, ArrowLeft, RefreshCw, AlertCircle, ExternalLink 
} from 'lucide-react';

export function AdminDashboard({ onExit }) {
  const [token, setToken] = useState(localStorage.getItem('insurcheck_admin_token') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState('submissions'); // 'submissions' | 'reviews' | 'messages' | 'leads' | 'feedback'
  const [overview, setOverview] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Edit states
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  // Verify stored token on mount
  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.authenticated) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem('insurcheck_admin_token');
          setToken('');
          setAuthenticated(false);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem('insurcheck_admin_token', json.token);
        setToken(json.token);
        setAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError(json.error || 'Incorrect password');
      }
    } catch (err) {
      setLoginError('Server error logging in');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('insurcheck_admin_token');
    setToken('');
    setAuthenticated(false);
  };

  // Fetch data
  const fetchData = async () => {
    if (!token || !authenticated) return;
    setLoadingData(true);
    try {
      // 1. Overview
      const oRes = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const oJson = await oRes.json();
      if (oJson.success) setOverview(oJson.data);

      // 2. Submissions
      const sRes = await fetch(`/api/admin/submissions?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sJson = await sRes.json();
      if (sJson.success) setSubmissions(sJson.data);

      // 3. Reviews
      const rRes = await fetch(`/api/admin/reviews?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rJson = await rRes.json();
      if (rJson.success) setReviews(rJson.data);

      // 4. Messages
      const mRes = await fetch('/api/admin/contact-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mJson = await mRes.json();
      if (mJson.success) setMessages(mJson.data);

      // 5. Broker Leads (INS-30)
      const lRes = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lJson = await lRes.json();
      if (lJson.success) setLeads(lJson.data);

      // 6. Benchmark Feedback (INS-38)
      const fRes = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fJson = await fRes.json();
      if (fJson.success) setFeedbacks(fJson.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated, searchQuery]);

  // Actions
  const handleDeleteSubmission = async (id) => {
    if (!confirm(`Delete submission #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSubmissions(submissions.filter((s) => s.id !== id));
      }
    } catch (err) {
      alert('Failed to delete submission');
    }
  };

  const handleSaveSubmission = async (e) => {
    e.preventDefault();
    if (!editingSubmission) return;
    try {
      const res = await fetch(`/api/admin/submissions/${editingSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingSubmission)
      });
      const json = await res.json();
      if (json.success) {
        setSubmissions(submissions.map((s) => (s.id === json.data.id ? json.data : s)));
        setEditingSubmission(null);
      }
    } catch (err) {
      alert('Failed to save submission edit');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm(`Delete review #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingReview)
      });
      const json = await res.json();
      if (json.success) {
        setReviews(reviews.map((r) => (r.id === json.data.id ? { ...r, ...json.data } : r)));
        setEditingReview(null);
      }
    } catch (err) {
      alert('Failed to save review edit');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm(`Delete message #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setMessages(messages.filter((m) => m.id !== id));
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm(`Delete lead #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setLeads(leads.filter((l) => l.id !== id));
      }
    } catch (err) {
      alert('Failed to delete lead');
    }
  };

  const handleToggleLeadStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'contacted' ? 'closed' : currentStatus === 'closed' ? 'new' : 'contacted';
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (json.success) {
        setLeads(leads.map((l) => (l.id === id ? { ...l, status: nextStatus } : l)));
      }
    } catch (err) {
      alert('Failed to update lead status');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!confirm(`Delete feedback #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setFeedbacks(feedbacks.filter((f) => f.id !== id));
      }
    } catch (err) {
      alert('Failed to delete feedback');
    }
  };

  // -------------------------------------------------------------
  // Render: Login Screen
  // -------------------------------------------------------------
  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <button
            onClick={onExit}
            className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>

          <div className="text-center pt-8 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white">InsurCheck Admin</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter the administrator password to access the moderation portal.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Main Dashboard
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            title="Return to user view"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl font-black text-white">InsurCheck Moderation Dashboard</h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review submissions, moderate community reviews, and inspect incoming driver feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={fetchData}
            disabled={loadingData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Metrics Row (Clickable Tabs per INS-30) */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('submissions')}
            className={`border rounded-2xl p-4 text-left transition cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 ${
              activeSubTab === 'submissions'
                ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/80 border-slate-800/80'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Driver Submissions</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{overview.submissionsCount}</div>
            <span className="text-[10px] text-slate-500">Crowdsourced benchmarks • Click to view</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('reviews')}
            className={`border rounded-2xl p-4 text-left transition cursor-pointer hover:border-amber-500/50 hover:bg-slate-900 ${
              activeSubTab === 'reviews'
                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-slate-900/80 border-slate-800/80'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Insurer Reviews</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{overview.reviewsCount}</div>
            <span className="text-[10px] text-slate-500">Across 15 Ontario carriers • Click to view</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('messages')}
            className={`border rounded-2xl p-4 text-left transition cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900 ${
              activeSubTab === 'messages'
                ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20'
                : 'bg-slate-900/80 border-slate-800/80'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Contact Inquiries</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{overview.contactCount}</div>
            <span className="text-[10px] text-slate-500">Unread driver messages • Click to view</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('leads')}
            className={`border rounded-2xl p-4 text-left transition cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 ${
              activeSubTab === 'leads'
                ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/80 border-slate-800/80'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Broker Leads</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1.5">{overview.leadsCount}</div>
            <span className="text-[10px] text-emerald-400/80 font-semibold">High-intent switchers • Click to view</span>
          </button>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'submissions'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'reviews'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSubTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'messages'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contact Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveSubTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'leads'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Broker Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'feedback'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Model Feedback ({feedbacks.length})
          </button>
        </div>

        {activeSubTab !== 'messages' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Submissions */}
      {activeSubTab === 'submissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID / Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver Profile</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Monthly $</th>
                  <th className="px-4 py-3">Comments</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No submissions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        #{sub.id} <br />
                        <span className="text-[10px] text-slate-500">{sub.created_at}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-white">{sub.city}</span> <br />
                        <span className="font-mono text-[10px] text-emerald-400">{sub.fsa}</span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.vehicle_year} {sub.vehicle_make} {sub.vehicle_model}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        Age {sub.driver_age} • {sub.years_licensed} yrs G • {sub.clean_record ? 'Clean' : 'Claims/Tickets'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{sub.provider_name}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-400 text-sm">
                        ${sub.monthly_premium}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-[11px] text-slate-400" title={sub.comment}>
                        {sub.comment || '—'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => setEditingSubmission(sub)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                          title="Edit submission"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews */}
      {activeSubTab === 'reviews' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID / Carrier</th>
                  <th className="px-4 py-3">Rating (Overall)</th>
                  <th className="px-4 py-3">5 Dimensions (V / C / S / R / E)</th>
                  <th className="px-4 py-3">Author & Context</th>
                  <th className="px-4 py-3">Review Text</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No reviews found matching criteria.
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-white">{rev.insurer_name || rev.insurer_id}</span> <br />
                        <span className="font-mono text-[10px] text-slate-500">
                          #{rev.id} • {rev.created_at ? new Date(rev.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-amber-400 text-sm">★ {Number(rev.rating).toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        Val: {rev.rating_value} • Clm: {rev.rating_claims} • Sup: {rev.rating_support} <br />
                        Ren: {rev.rating_renewal} • Ease: {rev.rating_ease}
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {rev.author_city} • {rev.vehicle} <br />
                        {rev.monthly_premium > 0 && <span className="text-emerald-400">${rev.monthly_premium}/mo</span>}
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <span className="font-bold text-white text-[11px] block">{rev.title}</span>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{rev.body || <span className="italic text-slate-500">Rating only</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => setEditingReview(rev)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                          title="Edit review"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Messages */}
      {activeSubTab === 'messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No contact messages received yet.</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div>
                      <span className="font-bold text-white text-sm">{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs text-emerald-400 hover:underline ml-2"
                      >
                        {msg.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Broker Leads (INS-30) */}
      {activeSubTab === 'leads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Lead Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Vehicle & Postal Code</th>
                  <th className="py-3 px-4">Current Premium</th>
                  <th className="py-3 px-4">Est. Savings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-500 text-xs">
                      No broker leads recorded yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">#{lead.id}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{lead.name}</td>
                      <td className="py-3 px-4">
                        <div className="text-emerald-400 font-medium">{lead.email}</div>
                        {lead.phone && <div className="text-[11px] text-slate-400">{lead.phone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{lead.vehicle || 'Not specified'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lead.postal_code || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        ${lead.current_premium || 0}/mo
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 whitespace-nowrap">
                        ${lead.estimated_savings || 0}/yr
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLeadStatus(lead.id, lead.status)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                            lead.status === 'contacted'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : lead.status === 'closed'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                          title="Click to toggle status"
                        >
                          {lead.status || 'new'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Delete lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Benchmark Feedback (INS-38) */}
      {activeSubTab === 'feedback' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Reasonable?</th>
                  <th className="py-3 px-4">Matches?</th>
                  <th className="py-3 px-4">Before Renew?</th>
                  <th className="py-3 px-4">Before Buy?</th>
                  <th className="py-3 px-4">Vehicle & Benchmark</th>
                  <th className="py-3 px-4">Trust Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-12 text-slate-500 text-xs">
                      No model validation feedback recorded yet.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">#{fb.id}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-amber-400 font-bold">{'★'.repeat(fb.rating)}</span>
                        <span className="text-slate-600">{'★'.repeat(5 - fb.rating)}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{fb.is_reasonable || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-white">{fb.matches_knowledge || '-'}</td>
                      <td className="py-3 px-4">{fb.use_before_renew || '-'}</td>
                      <td className="py-3 px-4">{fb.use_before_buy || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{fb.vehicle || 'Unknown'} ({fb.postal_code || 'N/A'})</div>
                        <div className="text-[10px] text-emerald-400 font-bold">Benchmark: ${fb.benchmark_rate || '-'}/mo</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-300 italic text-[11px]">
                        {fb.trust_comment || <span className="text-slate-600 not-italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Submission #{editingSubmission.id}</h3>
            <form onSubmit={handleSaveSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Provider Name</label>
                <input
                  type="text"
                  value={editingSubmission.provider_name}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, provider_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Premium ($)</label>
                  <input
                    type="number"
                    value={editingSubmission.monthly_premium}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, monthly_premium: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editingSubmission.city}
                    onChange={(e) => setEditingSubmission({ ...editingSubmission, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Comment</label>
                <textarea
                  rows={3}
                  value={editingSubmission.comment || ''}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, comment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Review #{editingReview.id}</h3>
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Review Body</label>
                <textarea
                  rows={4}
                  value={editingReview.body}
                  onChange={(e) => setEditingReview({ ...editingReview, body: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Value</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating_value}
                    onChange={(e) => setEditingReview({ ...editingReview, rating_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Claims</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating_claims}
                    onChange={(e) => setEditingReview({ ...editingReview, rating_claims: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Support</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating_support}
                    onChange={(e) => setEditingReview({ ...editingReview, rating_support: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Renewal</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating_renewal}
                    onChange={(e) => setEditingReview({ ...editingReview, rating_renewal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Ease</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingReview.rating_ease}
                    onChange={(e) => setEditingReview({ ...editingReview, rating_ease: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
