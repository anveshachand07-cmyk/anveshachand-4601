import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Creator, Campaign, Application, creatorMatchesCampaign, estimateRate, formatCurrency, formatFollowers } from '@/types';
import { TierBadge, EngagementBadge, CollabTypeBadge, StatusBadge, Avatar, CreatorStatsInline } from './Badges';

interface Props {
  creators: Creator[];
  campaigns: Campaign[];
  applications: Application[];
  onApply: () => void;
}

export function CreatorView({ creators, campaigns, applications, onApply }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(creators[0]?.id ?? null);
  const selected = creators.find((c) => c.id === selectedId) ?? null;

  if (creators.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No creator profiles yet. Create one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile selector + media kit */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your Media Kit</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {creators.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selectedId === c.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}>
              <Avatar src={c.avatar_url} alt={c.handle} size={22} />
              {c.handle}
            </button>
          ))}
        </div>

        {selected && <MediaKit creator={selected} />}
      </div>

      {/* Smart feed */}
      {selected && (
        <SmartFeed
          creator={selected}
          campaigns={campaigns}
          applications={applications}
          onApply={onApply}
        />
      )}
    </div>
  );
}

function MediaKit({ creator }: { creator: Creator }) {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[auto_1fr]">
      <div className="flex items-start gap-4">
        <Avatar src={creator.avatar_url} alt={creator.handle} size={72} />
        <div>
          <h3 className="text-lg font-bold text-slate-900">{creator.handle}</h3>
          <p className="text-sm text-slate-500">{creator.niche}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <TierBadge tier={creator.tier} />
            <EngagementBadge rate={creator.engagement_rate} unlocked={creator.engagement_rate > 8} />
          </div>
        </div>
      </div>
      <div>
        {creator.bio && <p className="mb-3 text-sm text-slate-600">{creator.bio}</p>}
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4">
          <div><span className="block text-lg font-bold text-slate-900">{formatFollowers(creator.followers)}</span><span className="text-xs text-slate-500">Followers</span></div>
          <div><span className="block text-lg font-bold text-slate-900">{formatFollowers(creator.avg_views)}</span><span className="text-xs text-slate-500">Avg Views</span></div>
          <div><span className="block text-lg font-bold text-slate-900">{formatFollowers(creator.avg_likes)}</span><span className="text-xs text-slate-500">Avg Likes</span></div>
        </div>
        <div className="mt-2 text-xs text-slate-400">Engagement rate = (avg likes ÷ followers) × 100</div>
      </div>
    </div>
  );
}

function SmartFeed({ creator, campaigns, applications, onApply }: {
  creator: Creator;
  campaigns: Campaign[];
  applications: Application[];
  onApply: () => void;
}) {
  const matched = campaigns.filter((c) => creatorMatchesCampaign(creator, c));
  const other = campaigns.filter((c) => !creatorMatchesCampaign(creator, c));
  const myApps = applications.filter((a) => a.creator_id === creator.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">Smart Feed — Matched Campaigns</h2>
        <p className="mb-4 text-xs text-slate-400">Showing campaigns matching your tier, engagement rate, and niche.</p>
        {matched.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No matching campaigns right now. Check back as brands post new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matched.map((c) => (
              <CampaignCard key={c.id} campaign={c} creator={creator} hasApplied={myApps.some((a) => a.campaign_id === c.id)} onApply={onApply} />
            ))}
          </div>
        )}
      </div>

      {other.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-300">Other Campaigns (not matched)</h2>
          <p className="mb-4 text-xs text-slate-400">These don't match your current profile.</p>
          <div className="grid gap-4 md:grid-cols-2 opacity-60">
            {other.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500">{c.brand_name} · {c.niche}</p>
                  </div>
                  <CollabTypeBadge type={c.collab_type} />
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{c.description}</p>
                <p className="mt-3 text-xs text-slate-400">Requires {c.target_tier} tier, {c.min_engagement_rate}% min engagement</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {myApps.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Your Applications</h2>
          <div className="space-y-3">
            {myApps.map((app) => {
              const camp = campaigns.find((c) => c.id === app.campaign_id);
              if (!camp) return null;
              return (
                <div key={app.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{camp.title}</h3>
                    <p className="text-xs text-slate-500">{camp.brand_name} · {camp.collab_type}</p>
                    {app.rate_estimate > 0 && <p className="mt-1 text-xs text-slate-400">Proposed rate: {formatCurrency(app.rate_estimate)}</p>}
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, creator, hasApplied, onApply }: {
  campaign: Campaign;
  creator: Creator;
  hasApplied: boolean;
  onApply: () => void;
}) {
  const [applying, setApplying] = useState(false);
  const [pitch, setPitch] = useState('');
  const rate = estimateRate(creator, campaign);
  const showForm = applying && !hasApplied;

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const defaultPitch = `Hi! I'm ${creator.handle}, a ${creator.tier.toLowerCase()} ${creator.niche.toLowerCase()} creator with ${creator.engagement_rate.toFixed(1)}% engagement. I'd love to collaborate on "${campaign.title}" and can deliver authentic content that resonates with my audience.`;
    const { error } = await supabase.from('applications').insert({
      creator_id: creator.id,
      campaign_id: campaign.id,
      pitch: pitch.trim() || defaultPitch,
      rate_estimate: rate,
      status: 'Applied',
    });
    if (!error) {
      setApplying(false);
      setPitch('');
      onApply();
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900">{campaign.title}</h3>
          <p className="text-xs text-slate-500">{campaign.brand_name} · {campaign.niche}</p>
        </div>
        <CollabTypeBadge type={campaign.collab_type} />
      </div>
      <p className="mb-4 text-sm text-slate-600">{campaign.description}</p>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">Target: {campaign.target_tier}+</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">Min {campaign.min_engagement_rate}% engagement</span>
        {campaign.budget > 0 && <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">Budget {formatCurrency(campaign.budget)}</span>}
      </div>

      <div className="mt-auto">
        {hasApplied ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center text-sm font-medium text-slate-500">
            Already applied
          </div>
        ) : showForm ? (
          <form onSubmit={handleApply} className="space-y-3">
            <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} rows={3}
              placeholder="Optional: customize your pitch. Leave blank for auto-generated."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
            {rate > 0 && <p className="text-xs text-slate-500">Suggested rate: <strong className="text-slate-700">{formatCurrency(rate)}</strong></p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500">
                Submit Application
              </button>
              <button type="button" onClick={() => setApplying(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setApplying(true)}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            One-Click Apply{rate > 0 ? ` · Est. ${formatCurrency(rate)}` : ''}
          </button>
        )}
      </div>
    </div>
  );
}
