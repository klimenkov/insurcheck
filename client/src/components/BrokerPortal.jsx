import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Car,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  User,
  DollarSign,
  Briefcase,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const PILOT_BROKERS = [
  {
    id: 'brok_sharp',
    name: 'Sharp Insurance Ontario',
    user: 'Sarah Jenkins',
    license: 'RIBO #77312',
    territories: ['GTA', 'Peel Region', 'York Region']
  },
  {
    id: 'brok_ktx',
    name: 'KTX Insurance Brokers',
    user: 'Michael Chang',
    license: 'RIBO #44890',
    territories: ['Toronto', 'Halton', 'Hamilton', 'Niagara']
  },
  {
    id: 'brok_oiba',
    name: 'Ontario Independent Broker Alliance',
    user: 'David Ross',
    license: 'RIBO #91204',
    territories: ['Ottawa', 'Kingston', 'London', 'Kitchener-Waterloo']
  }
];

export function BrokerPortal({ onExit }) {
  const [activeBroker, setActiveBroker] = useState(PILOT_BROKERS[0]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'claimed' | 'pilot_info'

  const [availableLeads, setAvailableLeads] = useState([]);
  const [claimedLeads, setClaimedLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Filters
  const [filterCity, setFilterCity] = useState('All');
  const [filterMinSavings, setFilterMinSavings] = useState('0');
  const [filterTimeline, setFilterTimeline] = useState('all');

  // Status update state for claimed leads
  const [editingNotes, setEditingNotes] = useState({});
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchAvailableLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCity !== 'All') params.append('city', filterCity);
      if (parseInt(filterMinSavings, 10) > 0) params.append('minSavings', filterMinSavings);
      if (filterTimeline !== 'all') params.append('timeline', filterTimeline);

      const res = await fetch(`/api/marketplace/leads/available?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAvailableLeads(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching available leads:', err);
    }
  };

  const fetchClaimedLeads = async () => {
    try {
      const res = await fetch(`/api/marketplace/leads/claimed?brokerageId=${activeBroker.id}`);
      const json = await res.json();
      if (json.success) {
        setClaimedLeads(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching claimed leads:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/marketplace/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching marketplace stats:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchAvailableLeads(), fetchClaimedLeads(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [activeBroker.id, filterCity, filterMinSavings, filterTimeline]);

  const handleClaimLead = async (leadId) => {
    setClaimingId(leadId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/marketplace/leads/${leadId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerageId: activeBroker.id,
          userId: activeBroker.user
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionMessage({
          type: 'error',
          text: data.error || 'Failed to claim lead. It might already be claimed.'
        });
      } else {
        setActionMessage({
          type: 'success',
          text: `🎉 Lead #${leadId} claimed exclusively! Contact details unlocked below in "My Claimed Leads".`
        });
        setActiveTab('claimed');
        await refreshAll();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Network error claiming lead' });
    } finally {
      setClaimingId(null);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    setUpdatingStatusId(leadId);
    try {
      const notes = editingNotes[leadId] || '';
      const res = await fetch(`/api/marketplace/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: notes,
          brokerageId: activeBroker.id
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Lead #${leadId} status updated to: ${newStatus.replace('_', ' ')}`
        });
        await fetchClaimedLeads();
        await fetchStats();
      } else {
        setActionMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const formatTimeline = (t) => {
    switch (t) {
      case 'immediate': return 'Urgent (< 7 days)';
      case 'within_30_days': return 'Within 30 days';
      case '1_to_3_months': return '1 – 3 months';
      case 'car_shopping': return 'Car Shopping / New Policy';
      default: return 'Active Policyholder';
    }
  };

  const formatStatus = (s) => {
    switch (s) {
      case 'claimed': return { label: 'Claimed (Pending Contact)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'contacted': return { label: 'Contacted Driver', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'offer_provided': return { label: 'Offer / Quote Provided', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'converted': return { label: 'Converted Policy Bound 🎉', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'closed_no_deal': return { label: 'Closed - No Deal', color: 'bg-slate-700 text-slate-300 border-slate-600' };
      case 'backup_queue': return { label: 'Backup Queue', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      default: return { label: s, color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header with Broker Switcher for Pilot */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Broker Portal • Closed Pilot
            </span>
            <span className="text-xs text-slate-400">RIBO Compliance Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            Ontario Broker Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time feed of Ontario drivers who benchmarked their premiums and opted in to connect with a licensed broker. Single-broker exclusive claiming.
          </p>
        </div>

        {/* Broker Switcher (Pilot Mode) */}
        <div className="w-full md:w-auto bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pilot Broker Identity</span>
            <span className="text-emerald-400 text-[10px]">Active Session</span>
          </div>
          <select
            value={activeBroker.id}
            onChange={(e) => {
              const b = PILOT_BROKERS.find(x => x.id === e.target.value);
              if (b) setActiveBroker(b);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
          >
            {PILOT_BROKERS.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.user})
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
            <span>{activeBroker.license}</span>
            <span>Territories: {activeBroker.territories.length}</span>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
          actionMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Available Leads</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {stats ? stats.availableLeads : '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready to claim</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">My Claimed Leads</div>
          <div className="text-2xl font-black text-white mt-1">
            {claimedLeads.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{activeBroker.name}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Market Claim Rate</div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {stats ? `${stats.claimRate}%` : '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{stats?.totalLeads || 0} total leads generated</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Conversion Rate</div>
          <div className="text-2xl font-black text-purple-400 mt-1">
            {stats ? `${stats.conversionRate}%` : '...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{stats?.convertedLeads || 0} bound policies</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'available'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Available Leads ({availableLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claimed')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'claimed'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Unlock className="w-4 h-4" />
          <span>My Claimed Leads ({claimedLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pilot_info')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pilot_info'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Closed Pilot Rules & FAQ</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE LEADS */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter by:
              </span>

              {/* City */}
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="All">All Cities</option>
                <option value="Brampton">Brampton</option>
                <option value="Toronto">Toronto</option>
                <option value="Mississauga">Mississauga</option>
                <option value="Hamilton">Hamilton</option>
                <option value="Ottawa">Ottawa</option>
                <option value="London">London</option>
              </select>

              {/* Min Savings */}
              <select
                value={filterMinSavings}
                onChange={(e) => setFilterMinSavings(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="0">Any Savings Gap</option>
                <option value="50">$50+/mo Potential</option>
                <option value="100">$100+/mo High Savings</option>
                <option value="200">$200+/mo Premium Target</option>
              </select>

              {/* Timeline */}
              <select
                value={filterTimeline}
                onChange={(e) => setFilterTimeline(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="all">All Timelines</option>
                <option value="immediate">Immediate (&lt; 7 days)</option>
                <option value="within_30_days">Within 30 Days</option>
                <option value="1_to_3_months">1 – 3 Months</option>
                <option value="car_shopping">Car Shopping</option>
              </select>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>

          {/* Leads Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading available marketplace leads...</p>
            </div>
          ) : availableLeads.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                📭
              </div>
              <h3 className="text-base font-bold text-white">No Unclaimed Leads Matching Filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All matching driver requests have been claimed by participating brokerages, or no new drivers match your filter criteria right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableLeads.map((lead) => {
                const isClaimingThis = claimingId === lead.id;
                return (
                  <div
                    key={lead.id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xl transition relative group"
                  >
                    {/* Top Row: FSA & Urgency */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-800 text-white font-mono text-xs font-bold rounded-lg border border-slate-700">
                          {lead.postal_code} • {lead.city}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          #INS-L{String(lead.id).padStart(5, '0')}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {formatTimeline(lead.renewal_timeline)}
                      </span>
                    </div>

                    {/* Vehicle & Driver Specs */}
                    <div className="space-y-1">
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Age {lead.driver_age}</span>
                        <span>•</span>
                        <span>{lead.years_licensed} yrs licensed</span>
                        <span>•</span>
                        <span>{lead.clean_record ? '✨ Clean Record' : 'Prior Claims/Tickets'}</span>
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Pay</div>
                        <div className="text-sm font-bold text-slate-300 mt-0.5">
                          {lead.current_premium ? `$${lead.current_premium}/mo` : 'Car Shopping'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Benchmark</div>
                        <div className="text-sm font-bold text-slate-300 mt-0.5">
                          ${lead.benchmark_rate}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-400 uppercase font-semibold">Est. Savings</div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">
                          {lead.estimated_savings > 0 ? `-$${lead.estimated_savings}/mo` : '$0'}
                        </div>
                      </div>
                    </div>

                    {/* Privacy Lock Banner */}
                    <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px]">Direct Contact: 🔒 Locked to protect driver privacy</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Unlocks on claim</span>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Exclusive Lead Lock</span>
                      </div>
                      <button
                        type="button"
                        disabled={isClaimingThis}
                        onClick={() => handleClaimLead(lead.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        {isClaimingThis ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Claiming...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Claim Lead Exclusively</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CLAIMED LEADS */}
      {activeTab === 'claimed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span>Claimed Leads for {activeBroker.name}</span>
            </h2>
            <button
              type="button"
              onClick={fetchClaimedLeads}
              className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {claimedLeads.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                📂
              </div>
              <h3 className="text-base font-bold text-white">No Claimed Leads Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Head to the "Available Leads" tab to claim driver inquiries exclusively. Once claimed, driver phone numbers and emails will unlock here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('available')}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Browse Available Leads
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {claimedLeads.map((lead) => {
                const statusMeta = formatStatus(lead.status);
                const isUpdating = updatingStatusId === lead.id;

                return (
                  <div
                    key={lead.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl"
                  >
                    {/* Top Row: Ref, Status & Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded-lg border border-emerald-500/20">
                          #INS-L{String(lead.id).padStart(5, '0')}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Claimed {new Date(lead.claimed_at || lead.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Unlocked Contact Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Driver Contact Details */}
                      <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unlocked Driver Contact</span>
                        </div>
                        <div className="text-base font-black text-white">
                          {lead.contact_name}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <a
                            href={`tel:${lead.contact_phone}`}
                            className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 font-mono font-medium transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{lead.contact_phone}</span>
                          </a>
                          <a
                            href={`mailto:${lead.contact_email}`}
                            className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition break-all"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{lead.contact_email}</span>
                          </a>
                          <div className="flex items-center gap-2 text-slate-400 pt-1">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Prefers: <span className="text-white capitalize">{lead.contact_pref || 'phone'}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle & Risk Details */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Vehicle & Territory
                        </div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>{lead.vehicle_year} {lead.vehicle_make} {lead.vehicle_model}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{lead.postal_code} — {lead.city}, Ontario</span>
                        </div>
                        <div className="text-xs text-slate-400 pt-1 border-t border-slate-900">
                          <span>Driver: {lead.driver_age}yo • {lead.years_licensed}y licensed • {lead.clean_record ? 'Clean record' : 'Prior claims'}</span>
                        </div>
                      </div>

                      {/* Financial Benchmark Gap */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Benchmark & Savings Target
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Current Premium:</span>
                          <span className="text-white font-bold">{lead.current_premium ? `$${lead.current_premium}/mo` : 'New Buyer'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">InsurCheck Fair Benchmark:</span>
                          <span className="text-white font-bold">${lead.benchmark_rate}/mo</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                          <span className="text-emerald-400 font-bold">Target Savings Opportunity:</span>
                          <span className="text-emerald-400 font-black text-sm">
                            ${lead.estimated_savings}/mo
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Renewal: {formatTimeline(lead.renewal_timeline)}
                        </div>
                      </div>
                    </div>

                    {/* Status & Resolution Workflow */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Lead Lifecycle & Resolution Management</span>
                        <span className="text-[11px] text-slate-500">100% resolution required</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            lead.status === 'contacted'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          1. Mark Contacted
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(lead.id, 'offer_provided')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            lead.status === 'offer_provided'
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          2. Offer Provided
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(lead.id, 'converted')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            lead.status === 'converted'
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          🎉 3. Policy Bound / Converted
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(lead.id, 'closed_no_deal')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            lead.status === 'closed_no_deal'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                          }`}
                        >
                          Closed (No Deal)
                        </button>
                      </div>

                      {/* Notes input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder={lead.resolution_notes || 'Add broker notes (e.g. Quoted CAA $178/mo, awaiting pink slip)'}
                          value={editingNotes[lead.id] !== undefined ? editingNotes[lead.id] : (lead.resolution_notes || '')}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(lead.id, lead.status)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PILOT RULES & FAQ */}
      {activeTab === 'pilot_info' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-xl font-black text-white">Closed Pilot Partner Guidelines</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              InsurCheck Marketplace operates under strict guidelines to protect both Ontario drivers and participating brokerages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Single-Broker Exclusivity Lock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you click "Claim Lead", that driver is locked exclusively to your brokerage. No other broker will see the contact details or be permitted to call them. This prevents driver call fatigue.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Contact SLA & Urgency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Participating brokers commit to attempting contact within 2 business hours for leads marked "Urgent / Within 30 days". High contact velocity drastically increases policy bind rate.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-white">100% Lead Resolution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All claimed leads must be resolved through the status workflow ("Offer Provided", "Converted", or "Closed - No Deal"). Unresponsive leads after 48 hours are automatically reviewed.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-sm font-bold text-white">RIBO Regulatory Compliance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                InsurCheck is an independent transparency tool that provides actuarial benchmark calculations. InsurCheck does not solicit or bind insurance; all advisory and binding is executed solely by licensed RIBO brokers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
