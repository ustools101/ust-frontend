'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-mono font-medium text-gray-700 dark:text-gray-200 transition-colors"
    >
      {copied ? (
        <CheckCircleSolid className="w-4 h-4 text-green-500" />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
      )}
      {text}
    </button>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
      {n}
    </span>
  );
}

export default function ConnectTelegramPage() {
  const { data: session } = useSession();
  const [telegramId, setTelegramId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (value: string): string | null => {
    if (!value) return null;
    if (value.startsWith('+') || value.startsWith('0') || value.length > 13)
      return "That looks like a phone number. Your Telegram ID is a plain number you get from the bot — not your phone number.";
    if (value.length < 5)
      return 'Too short. A Telegram ID is usually 9–10 digits.';
    if (!/^\d+$/.test(value))
      return 'Telegram IDs contain digits only — no letters, spaces, or symbols.';
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, ''); // strip non-digits as typed
    setTelegramId(raw);
    setInputError(validate(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(telegramId);
    if (err) { setInputError(err); return; }
    if (!telegramId) {
      setInputError('Please enter your Telegram ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/user/change-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: parseInt(telegramId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update Telegram ID');
        return;
      }

      if (data.welcomeBonusAwarded) {
        toast.success(`🎉 Congratulations! You received ${data.bonusAmount.toLocaleString()} credits welcome bonus!`, { duration: 5000 });
        router.push('/dashboard?bonus=claimed');
      } else {
        toast.success('Telegram connected successfully!');
        router.push('/dashboard');
      }

      setTelegramId('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {/* Telegram icon */}
          <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#229ED9]">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Connect Telegram</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your link data arrives</p>
          </div>
        </div>
      </div>

      {/* ── Important callout ── */}
      <div className="mb-6 flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Telegram ID ≠ Phone number</p>
          <p className="text-amber-700 dark:text-amber-400">
            Your Telegram ID is a <strong>plain number</strong> (e.g. <span className="font-mono">947382610</span>) assigned by Telegram — not your phone number, not your @username. You will get it from the bot in Step 2.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">

        {/* Step 1 */}
        <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <StepBadge n={1} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Open the UST Telegram bot</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tap the button below — it opens directly in Telegram.</p>
            <Link
              href="https://t.me/USTools_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1a8fc4] text-white text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
              Open @USTools_Bot
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <StepBadge n={2} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Send this command to the bot</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Press <strong>Start</strong> if it's your first time, then send the command below.
            </p>
            <CopyButton text="/telegramid" />

            {/* Mock bot reply */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">The bot will reply with:</p>
              <div className="flex justify-start">
                <div className="max-w-[260px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                    Your Telegram ID is:<br />
                    <span className="font-mono font-bold text-primary-500 text-base">947382610</span>
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right mt-1">USTools Bot</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 mt-2">
                <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Copy that number exactly. It is your Telegram ID.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <StepBadge n={3} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Paste your Telegram ID here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Paste the number the bot sent you — digits only, no spaces or symbols.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={telegramId}
                    onChange={handleChange}
                    placeholder="e.g. 947382610"
                    maxLength={13}
                    className={`w-full px-4 py-2.5 rounded-xl border font-mono text-base bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      inputError
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500/30'
                        : telegramId && !inputError
                        ? 'border-green-300 dark:border-green-600 focus:ring-green-500/30'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500/30'
                    }`}
                  />
                  {telegramId && !inputError && (
                    <CheckCircleSolid className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>

                {inputError ? (
                  <div className="flex items-start gap-1.5 mt-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-500 leading-relaxed">{inputError}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    Numbers only · Typically 9–10 digits · Example: <span className="font-mono">947382610</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !!inputError || !telegramId}
                className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting…' : 'Connect Telegram'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
