import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Creator, calcEngagementRate, calcTier, isUnlocked, Tier, TIER_ORDER, TIER_INFO } from '@/types';
import { TierBadge, EngagementBadge } from './Badges';

const NICHES = ['Fitness', 'Tech', 'Travel', 'Beauty', 'Food', 'Fashion', 'Gaming', 'Lifestyle'];

interface Props {
  onCreated: () => void;
}

export function CreatorProfileForm({ onCreated }: Props) {
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState('Fitness');
  const [followers, setFollowers] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [avgLikes, setAvgLikes] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fNum = parseInt(followers) || 0;
  const lNum = parseInt(avgLikes) || 0;
  const vNum = parseInt(avgViews) || 0;
  const er = calcEngagementRate(lNum, fNum);
  const tier = calcTier(fNum);
  const unlocked = isUnlocked(er);
  const canPreview = fNum > 0 && lNum > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !fNum || !lNum) {
      setError('Handle, followers, and avg likes are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const { error: insertError } = await supabase.from('creators').insert({
      handle: cleanHandle,
      niche,
      followers: fNum,
      avg_views: vNum,
      avg_likes: lNum,
      engagement_rate: er,
      tier,
      bio: bio.trim(),
      avatar_url: '',
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setHandle('');
    setFollowers('');
    setAvgViews('');
    setAvgLikes('');
    setBio('');
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Social Handle">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
            <input
              value={handle.replace('@', '')}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourhandle"
              className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
            />
          </div>
        </Field>
        <Field label="Niche">
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          >
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Follower Count">
          <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="e.g. 45000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
        <Field label="Avg Views / Post">
          <input type="number" value={avgViews} onChange={(e) => setAvgViews(e.target.value)} placeholder="e.g. 28000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
        <Field label="Avg Likes / Post">
          <input type="number" value={avgLikes} onChange={(e) => setAvgLikes(e.target.value)} placeholder="e.g. 2700"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
      </div>

      <Field label="Bio (optional)">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Tell brands about yourself..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
      </Field>

      {/* Live preview */}
      {canPreview && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Your Media Kit Preview</p>
          <div className="flex flex-wrap items-center gap-3">
            <TierBadge tier={tier} />
            <EngagementBadge rate={er} unlocked={unlocked} />
            {unlocked && (
              <span className="text-xs font-medium text-orange-600">
                High engagement unlocks higher-tier paid campaigns for you.
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            <span>Engagement rate: <strong className="text-slate-900">{er.toFixed(1)}%</strong></span>
            <span>Estimated reach: <strong className="text-slate-900">{vNum.toLocaleString()}</strong> views/post</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button type="submit" disabled={saving}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
        {saving ? 'Saving profile...' : 'Save Creator Profile'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export { NICHES, TIER_ORDER, TIER_INFO };
