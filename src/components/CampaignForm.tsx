import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Campaign, CollabType, Tier, TIER_ORDER } from '@/types';
import { formatCurrency } from '@/types';
import { NICHES } from './CreatorProfileForm';

const COLLAB_TYPES: CollabType[] = ['Barter', 'Paid', 'Affiliate'];

interface Props {
  onCreated: () => void;
}

export function CampaignForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [niche, setNiche] = useState('Fitness');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [collabType, setCollabType] = useState<CollabType>('Paid');
  const [targetTier, setTargetTier] = useState<Tier>('Micro');
  const [minEngagement, setMinEngagement] = useState('3');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !brandName.trim()) {
      setError('Campaign title and brand name are required.');
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from('campaigns').insert({
      title: title.trim(),
      brand_name: brandName.trim(),
      niche,
      description: description.trim(),
      budget: parseFloat(budget) || 0,
      collab_type: collabType,
      target_tier: targetTier,
      min_engagement_rate: parseFloat(minEngagement) || 0,
      status: 'Active',
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setTitle(''); setBrandName(''); setDescription(''); setBudget(''); setMinEngagement('3');
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Campaign Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Skincare Launch"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
        <Field label="Brand Name">
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Lumiere Cosmetics"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Niche">
          <select value={niche} onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none">
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Collab Type">
          <div className="flex gap-2">
            {COLLAB_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setCollabType(t)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  collabType === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Campaign Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          placeholder="Describe what you want the creator to do..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Budget (USD)">
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 5000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
          {collabType !== 'Paid' && <span className="mt-1 block text-xs text-slate-400">{collabType === 'Barter' ? 'Product/gift only' : 'Commission-based'}</span>}
        </Field>
        <Field label="Target Tier (minimum)">
          <select value={targetTier} onChange={(e) => setTargetTier(e.target.value as Tier)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none">
            {TIER_ORDER.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Min Engagement Rate (%)">
          <input type="number" step="0.1" value={minEngagement} onChange={(e) => setMinEngagement(e.target.value)} placeholder="e.g. 3.0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none" />
        </Field>
      </div>

      {budget && parseFloat(budget) > 0 && (
        <p className="text-xs text-slate-500">Budget: <strong className="text-slate-700">{formatCurrency(parseFloat(budget))}</strong> total · creators with &gt;8% engagement can apply regardless of tier.</p>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button type="submit" disabled={saving}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
        {saving ? 'Publishing campaign...' : 'Publish Campaign'}
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
