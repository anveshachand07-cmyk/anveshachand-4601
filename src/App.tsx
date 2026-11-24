import { useState, useEffect, useCallback } from 'react';
import { Sparkles, User, Building2, Plus, TrendingUp, Users, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Creator, Campaign, Application, ViewMode, formatFollowers, formatCurrency } from '@/types';
import { CreatorProfileForm } from '@/components/CreatorProfileForm';
import { CampaignForm } from '@/components/CampaignForm';
import { CreatorView } from '@/components/CreatorView';
import { BrandView } from '@/components/BrandView';
import { TierBadge } from '@/components/Badges';

export default function App() {
  const [mode, setMode] = useState<ViewMode>('creator');
  const [showForm, setShowForm] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [cRes, campRes, appRes] = await Promise.all([
      supabase.from('creators').select('*').order('created_at', { ascending: true }),
      supabase.from('campaigns').select('*').order('created_at', { ascending: true }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
    ]);
    setCreators((cRes.data as Creator[]) ?? []);
    setCampaigns((campRes.data as Campaign[]) ?? []);
    setApplications((appRes.data as Application[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  function switchMode(m: ViewMode) {
    setMode(m);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">CollabMatch</h1>
                <p className="-mt-0.5 hidden text-xs text-slate-500 sm:block">Influencer & Brand Collaboration Marketplace</p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-full bg-slate-100 p-1">
              <ModeButton active={mode === 'creator'} onClick={() => switchMode('creator')} icon={<User className="h-4 w-4" />} label="Creator" />
              <ModeButton active={mode === 'brand'} onClick={() => switchMode('brand')} icon={<Building2 className="h-4 w-4" />} label="Brand" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero stats */}
        {!loading && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<Users className="h-4 w-4" />} label="Creators" value={`${creators.length}`} />
            <StatCard icon={<Megaphone className="h-4 w-4" />} label="Campaigns" value={`${campaigns.length}`} />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Applications" value={`${applications.length}`} />
            <StatCard icon={<Sparkles className="h-4 w-4" />} label="Matched" value={`${applications.length}`} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <>
            {/* Mode intro + create button */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {mode === 'creator' ? 'Creator Hub' : 'Brand Hub'}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === 'creator'
                    ? 'Build your media kit, browse matched campaigns, and apply in one click.'
                    : 'Post campaigns, review matched creators, and manage your collaborations.'}
                </p>
              </div>
              <button
                onClick={() => setShowForm((s) => !s)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                {mode === 'creator' ? 'New Creator Profile' : 'New Campaign'}
              </button>
            </div>

            {/* Create form */}
            {showForm && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 text-base font-bold text-slate-900">
                  {mode === 'creator' ? 'Create Your Media Kit' : 'Create a Campaign'}
                </h3>
                {mode === 'creator' ? (
                  <CreatorProfileForm onCreated={() => { loadAll(); setShowForm(false); }} />
                ) : (
                  <CampaignForm onCreated={() => { loadAll(); setShowForm(false); }} />
                )}
              </div>
            )}

            {/* Main view */}
            {mode === 'creator' ? (
              <CreatorView
                creators={creators}
                campaigns={campaigns}
                applications={applications}
                onApply={loadAll}
              />
            ) : (
              <BrandView
                campaigns={campaigns}
                creators={creators}
                applications={applications}
                onDataChange={loadAll}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-slate-400">CollabMatch · Tier logic: Nano (500–10K) · Micro (10K–100K) · Mid (100K–500K) · Macro (500K+) · &gt;8% engagement unlocks higher tiers</p>
      </footer>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4 ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">{icon}</div>
      <div>
        <div className="text-lg font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
