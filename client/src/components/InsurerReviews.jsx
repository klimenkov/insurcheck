import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Check,
  X,
  ExternalLink,
  PlusCircle,
  Search,
  ShieldCheck,
  ThumbsUp,
  Building2,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  PhoneCall,
  Clock,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { ReviewModal } from './ReviewModal.jsx';
import { DiscussionModal } from './DiscussionModal.jsx';

const EDITORIAL_PILLARS = [
  { key: 'editorial_claims', label: 'Claims Integrity & Speed', weight: '25%' },
  { key: 'editorial_service', label: 'Customer Support & Broker Access', weight: '20%' },
  { key: 'editorial_coverage', label: 'Coverage Options & Endorsements', weight: '20%' },
  { key: 'editorial_transparency', label: 'Rate Stability & Transparency', weight: '20%' },
  { key: 'editorial_digital', label: 'Digital App & Self-Service', weight: '15%' }
];

const COMMUNITY_DIMENSIONS = [
  { key: 'rating_value', title: 'Value for Money' },
  { key: 'rating_claims', title: 'Claims Handling (Accidents Only)' },
  { key: 'rating_support', title: 'Support & Service' },
  { key: 'rating_renewal', title: 'Renewal Stability' },
  { key: 'rating_ease', title: 'Ease of Policy Changes' }
];

function formatReviewDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function InsurerReviews({ onNavigate, onPreselectInsurer }) {
  const [insurers, setInsurers] = useState([]);
  const [loadingInsurers, setLoadingInsurers] = useState(true);
  const [activeSlug, setActiveSlug] = useState(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/reviews\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }
    return null;
  });

  // Insurer Profile Detail State
  const [selectedInsurerData, setSelectedInsurerData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters & Sorting in Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('revenue'); // revenue, editorial, rating, reviews, name

  // Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalInsurerId, setReviewModalInsurerId] = useState(null);
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);

  // Inline Reply State
  const [replyOpenForDiscId, setReplyOpenForDiscId] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Reviews Filter on Detail View
  const [reviewFilter, setReviewFilter] = useState('all'); // all, claims_only, positive, critical

  // Fetch directory of insurers
  const fetchInsurers = async (sortParam = sortBy) => {
    setLoadingInsurers(true);
    try {
      const res = await fetch(`/api/insurers?sort=${sortParam}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInsurers(json.data);
      }
    } catch (err) {
      console.error('Error fetching insurers:', err);
    } finally {
      setLoadingInsurers(false);
    }
  };

  // Fetch individual insurer profile when slug changes
  const fetchInsurerProfile = async (slug) => {
    if (!slug) {
      setSelectedInsurerData(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/insurers/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedInsurerData(json.data);
      } else {
        setSelectedInsurerData(null);
      }
    } catch (err) {
      console.error('Error loading insurer profile:', err);
      setSelectedInsurerData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchInsurers(sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (activeSlug) {
      fetchInsurerProfile(activeSlug);
    }
  }, [activeSlug]);

  // Sync URL changes via popstate
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/reviews\/([a-zA-Z0-9_-]+)/);
      setActiveSlug(match ? match[1] : null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToProfile = (slug) => {
    setActiveSlug(slug);
    const targetUrl = `/reviews/${slug}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDirectory = () => {
    setActiveSlug(null);
    setSelectedInsurerData(null);
    if (window.location.pathname !== '/reviews') {
      window.history.pushState({}, '', '/reviews');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewSubmitted = (result) => {
    fetchInsurers(sortBy);
    if (activeSlug) {
      fetchInsurerProfile(activeSlug);
    }
  };

  const handleDiscussionCreated = (newDisc) => {
    if (selectedInsurerData) {
      setSelectedInsurerData(prev => ({
        ...prev,
        discussions: [newDisc, ...(prev.discussions || [])]
      }));
    }
  };

  const handlePostReply = async (discId) => {
    if (!replyBody.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/discussions/${discId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_body: replyBody.trim(),
          author_name: replyAuthorName.trim() || 'Ontario Driver',
          is_verified_customer: true
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedInsurerData(prev => {
          const updatedDiscussions = prev.discussions.map(d => {
            if (d.id === discId) {
              return {
                ...d,
                replies: [...(d.replies || []), json.data]
              };
            }
            return d;
          });
          return { ...prev, discussions: updatedDiscussions };
        });
        setReplyBody('');
        setReplyOpenForDiscId(null);
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleVoteReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_helpful: true })
      });
      const json = await res.json();
      if (json.success && selectedInsurerData) {
        setSelectedInsurerData(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r.id === reviewId ? { ...r, helpful_count: json.data.helpful_count } : r)
        }));
      }
    } catch (err) {
      console.error('Failed to vote review:', err);
    }
  };

  // Filtered insurers for directory
  const filteredInsurers = useMemo(() => {
    let list = insurers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.parent_group && i.parent_group.toLowerCase().includes(q)) ||
        (i.distribution_channel && i.distribution_channel.toLowerCase().includes(q))
      );
    }
    return list;
  }, [insurers, searchQuery]);

  // Reviews filtering on detail view
  const displayedReviews = useMemo(() => {
    if (!selectedInsurerData?.reviews) return [];
    let list = selectedInsurerData.reviews;
    if (reviewFilter === 'claims_only') {
      list = list.filter(r => r.had_accident === 1);
    } else if (reviewFilter === 'positive') {
      list = list.filter(r => r.rating >= 4.0);
    } else if (reviewFilter === 'critical') {
      list = list.filter(r => r.rating < 4.0);
    }
    return list;
  }, [selectedInsurerData?.reviews, reviewFilter]);

  // =========================================================================
  // RENDER: COMPANY PROFILE DETAIL VIEW (/reviews/:slug)
  // =========================================================================
  if (activeSlug) {
    if (loadingDetail) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading verified insurer profile & driver reviews...</p>
        </div>
      );
    }

    if (!selectedInsurerData || !selectedInsurerData.insurer) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-2xl font-black text-white">Insurer Profile Not Found</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">
            We couldn't find an Ontario insurer corresponding to "{activeSlug}".
          </p>
          <button
            onClick={navigateToDirectory}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition"
          >
            ← Return to Ontario Insurer Directory
          </button>
        </div>
      );
    }

    const { insurer, reviews = [], discussions = [] } = selectedInsurerData;
    const strengths = Array.isArray(insurer.key_strengths) ? insurer.key_strengths : [];
    const limitations = Array.isArray(insurer.key_limitations) ? insurer.key_limitations : [];
    const isSmallSample = insurer.total_reviews > 0 && insurer.total_reviews < 10;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-150">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={navigateToDirectory}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Ontario Insurers</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            Audited Profile: {insurer.last_reviewed_date || 'October 2026'}
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl shrink-0 border border-white/10"
                style={{ backgroundColor: insurer.logo_color }}
              >
                {insurer.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{insurer.name}</h1>
                  {insurer.is_residual_market ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Residual High-Risk Market
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {insurer.distribution_channel || (insurer.direct_online ? 'Direct Online' : 'Broker Intermediary')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                  <span>Parent Group: <strong className="text-slate-200">{insurer.parent_group || insurer.name}</strong></span>
                  <span>•</span>
                  <span>Underwriter: <strong className="text-slate-200">{insurer.underwriting_entity || insurer.name}</strong></span>
                  {insurer.website && (
                    <>
                      <span>•</span>
                      <a
                        href={insurer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => {
                  if (onPreselectInsurer) {
                    onPreselectInsurer(insurer.name);
                  }
                }}
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Check My Rate vs {insurer.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setReviewModalInsurerId(insurer.id);
                  setReviewModalOpen(true);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition border border-slate-700 cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Rate {insurer.name}</span>
              </button>
            </div>
          </div>

          {/* Sourced Financial & Regulatory Scale Fact-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                FY2025 Financial Scale
              </span>
              <div className="text-lg font-black text-white">
                {insurer.revenue_formatted || 'Not publicly disclosed'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {insurer.revenue_metric || 'Direct Written Premiums (P&C Canada)'}
              </p>
              {insurer.revenue_source_url && (
                <a
                  href={insurer.revenue_source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  <span>Regulatory Filing Source</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Policyholders & Footprint
              </span>
              <div className="text-lg font-black text-white">
                {insurer.customer_count || 'Broad Ontario Distribution'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                {insurer.customer_count_scope || 'Personal & commercial vehicle coverage'}
              </p>
              {insurer.customer_source_url && (
                <a
                  href={insurer.customer_source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  <span>Verification Citation</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                InsurCheck Editorial Score
              </span>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>{insurer.editorial_score ? insurer.editorial_score.toFixed(1) : '8.0'}</span>
                <span className="text-xs text-slate-500 font-normal">/ 10</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Weighted across claims speed, stability, coverage, transparency & apps.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Driver Community Rating
              </span>
              {insurer.total_reviews > 0 && insurer.overall_rating ? (
                <>
                  <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{insurer.overall_rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>{insurer.total_reviews} verified {insurer.total_reviews === 1 ? 'review' : 'reviews'}</span>
                    {isSmallSample && (
                      <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Small sample
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-bold text-slate-400 mt-1">No ratings yet</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Zero published submissions. Be the first Ontario driver to rate them!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dual Evaluation: Editorial Score vs Community Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editorial Scorecard */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">InsurCheck Editorial Assessment</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Independent Benchmark
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 italic">
              "{insurer.verdict || `A major Ontario carrier providing regulated auto insurance solutions.`}"
            </p>

            {/* 5 Editorial Pillars */}
            <div className="space-y-3 pt-1">
              {EDITORIAL_PILLARS.map(pillar => {
                const val = insurer[pillar.key] || 8.0;
                const pct = (val / 10) * 100;
                return (
                  <div key={pillar.key}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-300">{pillar.label}</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {val.toFixed(1)} <span className="text-slate-500 text-[10px]">/ 10</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Driver Scorecard */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Driver Community Breakdown</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {insurer.total_reviews} {insurer.total_reviews === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            {insurer.total_reviews === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 space-y-3">
                <p className="text-sm font-bold text-slate-300">No driver ratings submitted yet for {insurer.name}.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  InsurCheck never fakes review counts or ratings. Have you insured a vehicle with this company?
                </p>
                <button
                  onClick={() => {
                    setReviewModalInsurerId(insurer.id);
                    setReviewModalOpen(true);
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition cursor-pointer"
                >
                  Be First to Rate {insurer.name}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {isSmallSample && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Early community feedback sample ({insurer.total_reviews} submissions). Ratings update dynamically as more drivers review.</span>
                  </div>
                )}

                {COMMUNITY_DIMENSIONS.map(dim => {
                  const score = insurer[dim.key];
                  const hasScore = score !== null && score !== undefined;
                  const pct = hasScore ? (score / 5) * 100 : 0;

                  return (
                    <div key={dim.key}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-300">{dim.title}</span>
                        {hasScore ? (
                          <span className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {Number(score).toFixed(1)} <span className="text-slate-500 text-[10px]">/ 5</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No ratings</span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fit, Advantages & Watchouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Who Should Consider */}
          <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Who Should Consider {insurer.name}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insurer.who_should_consider || 'Drivers looking for reliable Ontario vehicle coverage with established market presence.'}
            </p>
            {strengths.length > 0 && (
              <ul className="space-y-1.5 pt-2 border-t border-emerald-500/20 text-xs text-slate-300">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Who Should Avoid */}
          <div className="bg-rose-950/20 border border-rose-500/25 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Who Should Avoid or Compare Alternatives</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insurer.who_should_avoid || 'Drivers seeking niche coverage or strictly minimal liability without comprehensive packages.'}
            </p>
            {limitations.length > 0 && (
              <ul className="space-y-1.5 pt-2 border-t border-rose-500/20 text-xs text-slate-300">
                {limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Claims Procedure & Telematics Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Claims Procedure & Emergency Response</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insurer.claims_procedure || 'Contact their 24/7 dedicated intake line or your independent broker immediately following an accident.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Discounts & Telematics Program</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insurer.discounts_telematics || 'Winter tire discount (5%), multi-vehicle and bundle savings available on qualifying Ontario policies.'}
            </p>
          </div>
        </div>

        {/* Community Driver Reviews List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Verified Driver Reviews ({reviews.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic reports from Ontario policyholders. Zero automated or phantom reviews.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setReviewModalInsurerId(insurer.id);
                  setReviewModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Your Review</span>
              </button>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No written reviews posted yet for {insurer.name}. Click above to share your experience!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {rev.title || 'Ontario Driver Review'}
                        </span>
                        {rev.is_verified_email === 1 && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified Driver
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{rev.display_name || rev.author_name || 'Driver'}</span>
                        <span>•</span>
                        <span>{rev.author_city || 'Ontario'}</span>
                        <span>•</span>
                        <span>{rev.vehicle || 'Passenger Vehicle'}</span>
                        {rev.monthly_premium > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">${rev.monthly_premium}/mo</span>
                          </>
                        )}
                        {rev.created_at && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{formatReviewDate(rev.created_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{Number(rev.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  {rev.body && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rev.body}
                    </p>
                  )}

                  {/* Dimensional breakdown badges if present */}
                  {(rev.rating_value || rev.rating_support || rev.rating_renewal || rev.rating_ease) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                      {rev.rating_value && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Value: <strong className="text-white">{rev.rating_value}/5</strong>
                        </span>
                      )}
                      {rev.rating_support && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Support: <strong className="text-white">{rev.rating_support}/5</strong>
                        </span>
                      )}
                      {rev.rating_renewal && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Renewal: <strong className="text-white">{rev.rating_renewal}/5</strong>
                        </span>
                      )}
                      {rev.rating_ease && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Service: <strong className="text-white">{rev.rating_ease}/5</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {rev.had_accident === 1 && (
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-400 font-bold">🚨 Claim Experience:</span>
                        <span>{rev.claims_experience || 'Reported collision'}</span>
                      </div>
                      {rev.payout_speed && (
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                          {rev.payout_speed}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Helpful Vote Button */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleVoteReview(rev.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800 transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Helpful ({rev.helpful_count || 0})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Q&A & Discussions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Community Q&A & Advice ({discussions.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Questions answered by Ontario policyholders and certified broker contributors.
              </p>
            </div>

            <button
              onClick={() => setDiscussionModalOpen(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask a Question</span>
            </button>
          </div>

          {discussions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No discussions active for {insurer.name}. Have a question regarding their rate increases or claims? Click "Ask a Question" above.
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map(disc => (
                <div key={disc.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{disc.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{disc.display_name || disc.author_name || 'Ontario Driver'}</span>
                        <span>•</span>
                        <span className="text-slate-500">{formatReviewDate(disc.created_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setReplyOpenForDiscId(replyOpenForDiscId === disc.id ? null : disc.id)}
                      className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
                    >
                      {replyOpenForDiscId === disc.id ? 'Cancel' : 'Reply'}
                    </button>
                  </div>

                  {disc.body && (
                    <p className="text-xs text-slate-300 leading-relaxed">{disc.body}</p>
                  )}

                  {/* Replies List */}
                  {disc.replies && disc.replies.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-900 pl-3 sm:pl-4 border-l-2 border-l-cyan-500/30">
                      {disc.replies.map(rep => (
                        <div key={rep.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {rep.display_name || rep.author_name || 'Driver'}
                              {rep.is_staff === 1 && (
                                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                  Broker Associate
                                </span>
                              )}
                            </span>
                            <span className="text-slate-500">{formatReviewDate(rep.created_at)}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{rep.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Form */}
                  {replyOpenForDiscId === disc.id && (
                    <div className="pt-3 border-t border-slate-900 space-y-2">
                      <textarea
                        rows={2}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write your answer or share your experience..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Your Name (optional)"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500"
                        />
                        <button
                          type="button"
                          disabled={submittingReply || !replyBody.trim()}
                          onClick={() => handlePostReply(disc.id)}
                          className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          {submittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Declarations */}
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          insurers={insurers}
          defaultInsurerId={reviewModalInsurerId || insurer.id}
          onReviewSubmitted={handleReviewSubmitted}
        />

        <DiscussionModal
          isOpen={discussionModalOpen}
          onClose={() => setDiscussionModalOpen(false)}
          insurer={insurer}
          onDiscussionCreated={handleDiscussionCreated}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER: DIRECTORY GRID VIEW (/reviews)
  // =========================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-8 h-8 text-emerald-400" />
            Ontario Auto Insurer Directory & Benchmark
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Compare 17 licensed Ontario property & casualty carriers by audited FY2025 revenue scale, independent InsurCheck Editorial Scores (/10), and verified community driver reviews.
          </p>
        </div>

        <button
          onClick={() => {
            setReviewModalInsurerId(insurers[0]?.id || 'intact');
            setReviewModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 text-slate-950 font-black text-sm hover:opacity-95 transition shadow-lg shadow-emerald-500/20 cursor-pointer self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Rate Your Insurer</span>
        </button>
      </div>

      {/* Trust & Methodology Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">FY2025 Financial Scale</span>
            <span className="text-slate-400 text-[11px]">Sourced directly from annual investor reports & AM Best filings.</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Editorial Score (/10)</span>
            <span className="text-slate-400 text-[11px]">Independent evaluation of claims response, repair guarantees, and service.</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <span className="font-bold text-white block">Driver Rating (/5)</span>
            <span className="text-slate-400 text-[11px]">True database review counts. Displays "No ratings yet" when 0.</span>
          </div>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ontario insurer, group, or channel..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">
            Sort:
          </span>
          {[
            { id: 'revenue', label: 'Financial Scale' },
            { id: 'editorial', label: 'Editorial Score' },
            { id: 'rating', label: 'Community Rating' },
            { id: 'reviews', label: 'Most Reviews' },
            { id: 'name', label: 'A – Z' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer border ${
                sortBy === tab.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insurers Cards Grid */}
      {loadingInsurers ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading Ontario insurer directory...</div>
      ) : filteredInsurers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-sm">No insurers matched your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInsurers.map((ins) => {
            const strengths = Array.isArray(ins.key_strengths) ? ins.key_strengths : [];
            const limitations = Array.isArray(ins.key_limitations) ? ins.key_limitations : [];
            const isSmallSample = ins.total_reviews > 0 && ins.total_reviews < 10;

            return (
              <div
                key={ins.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Card Top: Logo & Titles */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0 border border-white/10"
                        style={{ backgroundColor: ins.logo_color }}
                      >
                        {ins.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                          {ins.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {ins.parent_group || ins.name}
                        </span>
                      </div>
                    </div>

                    {ins.is_residual_market ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Residual Market
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                        {ins.direct_online ? 'Direct' : 'Broker'}
                      </span>
                    )}
                  </div>

                  {/* Dual Score Badges */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    {/* Editorial Score */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Editorial Score</span>
                      <div className="text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{ins.editorial_score ? ins.editorial_score.toFixed(1) : '8.0'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">/ 10</span>
                      </div>
                    </div>

                    {/* Community Rating */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Community Rating</span>
                      {ins.total_reviews > 0 && ins.overall_rating ? (
                        <>
                          <div className="text-base font-black text-amber-400 flex items-center gap-1 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{ins.overall_rating.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-500 font-normal">/ 5</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {ins.total_reviews} {ins.total_reviews === 1 ? 'review' : 'reviews'}
                            {isSmallSample && ' (small sample)'}
                          </span>
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-slate-500 mt-1 italic">
                          No ratings yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sourced Financial Scale Line */}
                  <div className="text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 mb-3">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span className="font-medium">Market Scale:</span>
                      <strong className="text-white font-mono">{ins.revenue_formatted || 'Undisclosed'}</strong>
                    </div>
                  </div>

                  {/* 1 Strength & 1 Limitation Preview */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                    {strengths[0] && (
                      <div className="flex items-start gap-1.5 line-clamp-2">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-slate-300">{strengths[0]}</span>
                      </div>
                    )}
                    {limitations[0] && (
                      <div className="flex items-start gap-1.5 line-clamp-2">
                        <X className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-slate-400">{limitations[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigateToProfile(ins.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <span>Read Profile & Reviews</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      setReviewModalInsurerId(ins.id);
                      setReviewModalOpen(true);
                    }}
                    title="Leave a review for this insurer"
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition border border-slate-800 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Directory Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        insurers={insurers}
        defaultInsurerId={reviewModalInsurerId}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
