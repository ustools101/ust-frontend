'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  BellAlertIcon,
  LinkIcon,
  CreditCardIcon,
  ClockIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface Props {
  onComplete: () => void;
}

const TOTAL_STEPS = 5;

export default function OnboardingModal({ onComplete }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const goAndClose = (path: string) => {
    onComplete();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Close / skip */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Skip onboarding"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Step content */}
        <div className="px-6 pt-8 pb-4 min-h-[340px] flex flex-col">
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepTelegram />}
          {step === 2 && <StepLinkTypes />}
          {step === 3 && <StepCredits />}
          {step === 4 && <StepRefresh />}
        </div>

        {/* Footer: dots + buttons */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {/* Back */}
          <div className="w-16">
            {step > 0 && (
              <button
                onClick={back}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`block w-2 h-2 rounded-full transition-colors duration-200 ${
                  i <= step
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Primary action */}
          <div className="w-16 flex justify-end">
            <StepAction
              step={step}
              onNext={next}
              onComplete={onComplete}
              goAndClose={goAndClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step action buttons ─────────────────────────────────────── */

function StepAction({
  step,
  onNext,
  onComplete,
  goAndClose,
}: {
  step: number;
  onNext: () => void;
  onComplete: () => void;
  goAndClose: (path: string) => void;
}) {
  if (step === 4) {
    return (
      <button
        onClick={onComplete}
        className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors whitespace-nowrap"
      >
        Done ✓
      </button>
    );
  }
  return (
    <button
      onClick={onNext}
      className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1 whitespace-nowrap"
    >
      Next <ArrowRightIcon className="w-3.5 h-3.5" />
    </button>
  );
}

/* ─── Step 1: Welcome ─────────────────────────────────────────── */

function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center flex-1 justify-center">
      <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center mb-5">
        <SparklesIcon className="w-7 h-7 text-primary-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        Welcome to UST
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
        This quick guide will walk you through everything you need to get started — from setup to creating your first link.
      </p>
    </div>
  );
}

/* ─── Step 2: Telegram ────────────────────────────────────────── */

function StepTelegram() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <BellAlertIcon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Connect your Telegram</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Get notified instantly, unlock your bonus</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        Telegram sends you a real-time alert the moment someone interacts with your link. You also unlock a free welcome bonus when you connect.
      </p>

      <ol className="space-y-2.5 mb-5">
        {[
          <>Open <span className="font-medium text-gray-800 dark:text-gray-200">@USTools_Bot</span> on Telegram</>,
          <>Send the command <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">/telegramid</span></>,
          <>Paste the ID on the <span className="font-medium text-gray-800 dark:text-gray-200">Connect</span> page</>,
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={() => router.push('/connect-telegram')}
        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Connect Telegram
      </button>
    </div>
  );
}

/* ─── Step 3: Link Types ──────────────────────────────────────── */

function StepLinkTypes() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
          <LinkIcon className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Two types of links</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pick the one that fits your goal</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Social Media Links</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-4">
            Ready-made templates for <span className="font-medium text-gray-700 dark:text-gray-300">Facebook, Instagram & TikTok</span>. Fast to set up — choose a platform and go.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">Build from Scratch</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-4">
            Design your own <span className="font-medium text-gray-700 dark:text-gray-300">multi-page custom form</span> with your own fields, labels, and flow.
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        Create links from the <span className="font-medium">Generate</span> tab at the bottom of your screen.
      </p>
    </div>
  );
}

/* ─── Step 4: Credits ─────────────────────────────────────────── */

function StepCredits() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <CreditCardIcon className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Credits power your links</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">1 Credit = ₦1</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        Every link you create is paid for with credits. Top up whenever you need more.
      </p>

      <div className="flex gap-2 mb-4">
        {['Social links from ₦4,000', 'Custom links from ₦4,000'].map((label) => (
          <span
            key={label}
            className="flex-1 text-center text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2 py-2 font-medium leading-tight"
          >
            {label}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
        Pay via <span className="font-medium text-gray-700 dark:text-gray-300">bank transfer</span> or <span className="font-medium text-gray-700 dark:text-gray-300">USDT</span>. Credits are added manually within 30 min – 2 hrs after payment.
      </p>

      <button
        onClick={() => router.push('/buy')}
        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Buy Credits
      </button>
    </div>
  );
}

/* ─── Step 5: Refresh schedule ────────────────────────────────── */

function StepRefresh() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center shrink-0">
          <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Links refresh 4× a day</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Automatic — nothing you need to do</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        To keep your simulations active, links are automatically updated at these times each day:
      </p>

      <div className="flex gap-2 flex-wrap mb-4">
        {['12:00 AM', '12:00 PM'].map((time) => (
          <span
            key={time}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
          >
            {time}
          </span>
        ))}
      </div>

      <div className="rounded-xl bg-primary-500/5 border border-primary-500/20 p-3.5">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <span className="font-semibold text-primary-600 dark:text-primary-400">Important:</span> After each refresh, open your <span className="font-medium text-gray-800 dark:text-white">Links</span> page and copy the new link before sharing it. Old links stop working after a refresh.
        </p>
      </div>
    </div>
  );
}
