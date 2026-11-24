import { Tier, TIER_INFO, formatFollowers } from '@/types';

export function TierBadge({ tier, size = 'md' }: { tier: Tier; size?: 'sm' | 'md' }) {
  const info = TIER_INFO[tier];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${info.bg} ${info.text} ring-1 ${info.ring} ${padding}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {tier}
    </span>
  );
}

export function EngagementBadge({ rate, unlocked }: { rate: number; unlocked: boolean }) {
  const isHigh = rate > 8;
  const cls = isHigh
    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 ring-1 ring-orange-200'
    : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {rate.toFixed(1)}% engagement
      {unlocked && <span className="text-[10px] font-bold uppercase tracking-wide">unlocked</span>}
    </span>
  );
}

export function CollabTypeBadge({ type }: { type: 'Barter' | 'Paid' | 'Affiliate' }) {
  const map = {
    Barter: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    Paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Affiliate: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[type]}`}>{type}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Applied: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    Approved: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    'Content Live': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.Applied}`}>{status}</span>;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-bold text-slate-900">{value}</span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

export function Avatar({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  const initials = alt.replace('@', '').slice(0, 2).toUpperCase();
  return (
    <div className="flex-shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-600">
          {initials}
        </div>
      )}
    </div>
  );
}

export function CreatorStatsInline({ followers, avgViews, avgLikes }: { followers: number; avgViews: number; avgLikes: number }) {
  return (
    <div className="flex gap-4 text-xs text-slate-500">
      <span><span className="font-semibold text-slate-700">{formatFollowers(followers)}</span> followers</span>
      <span><span className="font-semibold text-slate-700">{formatFollowers(avgViews)}</span> avg views</span>
      <span><span className="font-semibold text-slate-700">{formatFollowers(avgLikes)}</span> avg likes</span>
    </div>
  );
}
