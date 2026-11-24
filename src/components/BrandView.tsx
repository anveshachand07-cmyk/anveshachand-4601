import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Creator, Campaign, Application, AppStatus, creatorMatchesCampaign, formatCurrency, formatFollowers } from '@/types';
import { TierBadge, EngagementBadge, CollabTypeBadge, StatusBadge, Avatar, CreatorStatsInline } from './Badges';

interface Props {
  campaigns: Campaign[];
  creators: Creator[];
  applications: Application[];
  onDataChange: () => void;
}

const STATUS_FLOW: AppStatus[] = ['Applied', 'Approved', 'Content Live', 'Paid'];

export function BrandView({ campaigns, creators, applications, onDataChange }: Props) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(campaigns[0]?.id ?? null);

  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No campaigns yet. Create one above to start receiving applications.</p>
      </div>
    );
  }

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? campaigns[0];
  const campaignApps = applications.filter((a) => a.campaign_id === selectedCampaign.id);
  const matchedCreators = creators.filter((c) => creatorMatchesCampaign(c, selectedCampaign));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">Your Campaigns</h2>
        <p className="mb-4 text-xs text-slate-400">Select a campaign to view matched creators and applicants.</p>
        <div className="flex flex-wrap gap-2">
          {campaigns.map((c) => {
            const count = applications.filter((a) => a.campaign_id === c.id).length;
            return (
              <button key={c.id} onClick={() => setSelectedCampaignId(c.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedCampaign.id === c.id ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}>
                <div className="text-sm font-semibold">{c.title}</div>
                <div className={`text-xs ${selectedCampaign.id === c.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {c.brand_name} · {count} applicant{count !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign detail */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{selectedCampaign.title}</h3>
            <p className="text-sm text-slate-500">{selectedCampaign.brand_name} · {selectedCampaign.niche}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CollabTypeBadge type={selectedCampaign.collab_type} />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Target: {selectedCampaign.target_tier}+</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Min {selectedCampaign.min_engagement_rate}% eng.</span>
            {selectedCampaign.budget > 0 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{formatCurrency(selectedCampaign.budget)}</span>}
          </div>
        </div>
        {selectedCampaign.description && <p className="mt-3 text-sm text-slate-600">{selectedCampaign.description}</p>}
      </div>

      {/* Applicants */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Applicant Dashboard</h2>
        {campaignApps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No applications yet for this campaign.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaignApps.map((app) => {
              const creator = creators.find((c) => c.id === app.creator_id);
              if (!creator) return null;
              return (
                <ApplicantRow key={app.id} app={app} creator={creator} campaign={selectedCampaign} onDataChange={onDataChange} />
              );
            })}
          </div>
        )}
      </div>

      {/* Matched creators (not yet applied) */}
      {matchedCreators.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">Matched Creators</h2>
          <p className="mb-4 text-xs text-slate-400">Creators whose profile qualifies for this campaign.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {matchedCreators.map((c) => {
              const hasApp = campaignApps.some((a) => a.creator_id === c.id);
              if (hasApp) return null;
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Avatar src={c.avatar_url} alt={c.handle} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{c.handle}</h3>
                      <TierBadge tier={c.tier} size="sm" />
                    </div>
                    <CreatorStatsInline followers={c.followers} avgViews={c.avg_views} avgLikes={c.avg_likes} />
                    <div className="mt-1.5">
                      <EngagementBadge rate={c.engagement_rate} unlocked={c.engagement_rate > 8} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantRow({ app, creator, campaign, onDataChange }: {
  app: Application;
  creator: Creator;
  campaign: Campaign;
  onDataChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const currentIdx = STATUS_FLOW.indexOf(app.status as AppStatus);

  async function updateStatus(status: AppStatus) {
    setBusy(true);
    await supabase.from('applications').update({ status }).eq('id', app.id);
    setBusy(false);
    onDataChange();
  }

  async function reject() {
    setBusy(true);
    await supabase.from('applications').delete().eq('id', app.id);
    setBusy(false);
    onDataChange();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar src={creator.avatar_url} alt={creator.handle} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{creator.handle}</h3>
            <TierBadge tier={creator.tier} size="sm" />
            <EngagementBadge rate={creator.engagement_rate} unlocked={creator.engagement_rate > 8} />
          </div>
          <div className="mt-1.5">
            <CreatorStatsInline followers={creator.followers} avgViews={creator.avg_views} avgLikes={creator.avg_likes} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
        </div>
      </div>

      {app.pitch && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{app.pitch}</p>}
      {app.rate_estimate > 0 && <p className="mt-2 text-xs text-slate-500">Creator's rate estimate: <strong className="text-slate-700">{formatCurrency(app.rate_estimate)}</strong></p>}

      {/* Status progress + actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {app.status === 'Applied' && (
          <>
            <button disabled={busy} onClick={() => updateStatus('Approved')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">
              Approve
            </button>
            <button disabled={busy} onClick={reject}
              className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">
              Reject
            </button>
          </>
        )}
        {app.status === 'Approved' && (
          <button disabled={busy} onClick={() => updateStatus('Content Live')}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50">
            Mark Content Live
          </button>
        )}
        {app.status === 'Content Live' && (
          <button disabled={busy} onClick={() => updateStatus('Paid')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">
            Mark as Paid
          </button>
        )}
        {app.status === 'Paid' && (
          <span className="text-xs font-medium text-emerald-600">Collaboration complete</span>
        )}
      </div>

      {/* Progress tracker */}
      <div className="mt-4 flex items-center gap-1">
        {STATUS_FLOW.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400">
        {STATUS_FLOW.map((s) => <span key={s} className={STATUS_FLOW.indexOf(app.status as AppStatus) >= STATUS_FLOW.indexOf(s) ? 'text-emerald-600' : ''}>{s}</span>)}
      </div>
    </div>
  );
}
