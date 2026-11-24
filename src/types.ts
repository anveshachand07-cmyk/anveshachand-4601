export type Tier = 'Nano' | 'Micro' | 'Mid' | 'Macro';
export type CollabType = 'Barter' | 'Paid' | 'Affiliate';
export type AppStatus = 'Applied' | 'Approved' | 'Content Live' | 'Paid';
export type ViewMode = 'creator' | 'brand';

export interface Creator {
  id: string;
  handle: string;
  niche: string;
  followers: number;
  avg_views: number;
  avg_likes: number;
  engagement_rate: number;
  tier: Tier;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  niche: string;
  description: string;
  budget: number;
  collab_type: CollabType;
  target_tier: Tier;
  min_engagement_rate: number;
  status: string;
  created_at: string;
}

export interface Application {
  id: string;
  creator_id: string;
  campaign_id: string;
  pitch: string;
  rate_estimate: number;
  status: AppStatus;
  created_at: string;
  creator?: Creator;
  campaign?: Campaign;
}

export const TIER_ORDER: Tier[] = ['Nano', 'Micro', 'Mid', 'Macro'];

export const TIER_INFO: Record<Tier, { color: string; bg: string; text: string; ring: string; dot: string }> = {
  Nano: { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  Micro: { color: 'sky', bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', dot: 'bg-sky-500' },
  Mid: { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  Macro: { color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
};

export function calcEngagementRate(avgLikes: number, followers: number): number {
  if (followers <= 0) return 0;
  return Math.round((avgLikes / followers) * 1000) / 10;
}

export function calcTier(followers: number): Tier {
  if (followers < 10000) return 'Nano';
  if (followers < 100000) return 'Micro';
  if (followers < 500000) return 'Mid';
  return 'Macro';
}

export function isUnlocked(engagementRate: number): boolean {
  return engagementRate > 8;
}

/**
 * Determine if a creator qualifies for a campaign.
 * - Creator tier must be >= campaign target tier OR engagement > 8% (unlock)
 * - Creator engagement rate must be >= campaign min engagement rate
 * - Creator niche must match campaign niche
 */
export function creatorMatchesCampaign(creator: Creator, campaign: Campaign): boolean {
  if (creator.niche !== campaign.niche) return false;
  if (creator.engagement_rate < campaign.min_engagement_rate) return false;
  if (isUnlocked(creator.engagement_rate)) return true;
  const creatorTierIndex = TIER_ORDER.indexOf(creator.tier);
  const campaignTierIndex = TIER_ORDER.indexOf(campaign.target_tier);
  return creatorTierIndex >= campaignTierIndex;
}

export function estimateRate(creator: Creator, campaign: Campaign): number {
  const basePerFollower = creator.tier === 'Nano' ? 0.01 : creator.tier === 'Micro' ? 0.02 : creator.tier === 'Mid' ? 0.03 : 0.05;
  const engagementMultiplier = 1 + creator.engagement_rate / 10;
  const base = creator.followers * basePerFollower * engagementMultiplier;
  if (campaign.collab_type === 'Barter') return 0;
  if (campaign.collab_type === 'Affiliate') return 0;
  const budgetCap = campaign.budget * 0.4;
  return Math.round(Math.min(base, budgetCap));
}

export function formatFollowers(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
