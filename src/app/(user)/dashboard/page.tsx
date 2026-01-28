'use client';

import { useSession } from 'next-auth/react';
import { 
  CreditCardIcon,
  LinkIcon,
  Cog6ToothIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GiftIcon,
  XMarkIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const LINK_ROTATION_MODAL_KEY = 'ust_hide_link_rotation_modal';

interface UserData {
  username: string;
  points: number;
  telegramId?: string;
}

const WELCOME_BONUS_AMOUNT = 2000;

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showBonusCelebration, setShowBonusCelebration] = useState(false);
  const [showBonusBanner, setShowBonusBanner] = useState(true);
  const [showLinkRotationModal, setShowLinkRotationModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has dismissed the link rotation modal
  useEffect(() => {
    const hideModal = localStorage.getItem(LINK_ROTATION_MODAL_KEY);
    if (!hideModal) {
      setShowLinkRotationModal(true);
    }
  }, []);

  const handleCloseLinkRotationModal = () => {
    if (dontShowAgain) {
      localStorage.setItem(LINK_ROTATION_MODAL_KEY, 'true');
    }
    setShowLinkRotationModal(false);
  };

  const getUser = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/auth/user', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      
      if (data.user) {
        setUserData({
          username: data.user.username,
          points: data.user.points,
          telegramId: data.user.telegramId,
        });
        setTimeout(() => setIsLoaded(true), 100);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    getUser();

    const pollData = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        getUser();
        pollData();
      }, 10000);
    };

    pollData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [session, getUser]);

  // Check for bonus claimed query param
  useEffect(() => {
    if (searchParams.get('bonus') === 'claimed') {
      setShowBonusCelebration(true);
      // Clear the query param from URL without reload
      window.history.replaceState({}, '', '/dashboard');
      // Auto-hide celebration after 8 seconds
      const timer = setTimeout(() => setShowBonusCelebration(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('en-US').format(credits);
  };

  if (!userData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      name: 'Generate Link',
      description: 'Create a new link',
      icon: PlusIcon,
      href: '/generate',
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      name: 'My Links',
      description: 'View & manage links',
      icon: LinkIcon,
      href: '/links',
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      name: 'Analytics',
      description: 'View performance',
      icon: ChartBarIcon,
      href: '/credits',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      name: 'Settings',
      description: 'Manage preferences',
      icon: Cog6ToothIcon,
      href: '/settings',
      gradient: 'from-gray-500 to-slate-600',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-500',
    },
  ];

  const setupItems = [
    {
      title: 'Connect Telegram',
      description: 'Get real-time notifications',
      href: '/connect-telegram',
      isComplete: !!userData.telegramId,
      icon: ShieldCheckIcon,
    },
    {
      title: 'Tutorials Channel',
      description: 'Learn how to use USTools',
      href: 'https://t.me/+VoV4GcwY4KtjZmI8',
      isExternal: true,
      icon: SparklesIcon,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Link Rotation Reminder Modal */}
      {showLinkRotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl mx-4">
            <button
              onClick={handleCloseLinkRotationModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <BellAlertIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              ⚠️ Important Notice
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm sm:text-base">
              Phishing links rotate automatically for security purposes.
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm sm:text-base">Rotation Schedule</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {['12:00 AM', '6:00 AM', '12:00 PM', '6:00 PM'].map((time) => (
                  <div key={time} className="bg-white dark:bg-gray-800 rounded-lg py-2 px-3 border border-amber-200 dark:border-amber-700">
                    <p className="font-bold text-amber-700 dark:text-amber-400 text-sm sm:text-base">{time}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 sm:mb-6">
              <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
                <span className="font-semibold">💡 Tip:</span> Always copy the updated link from your dashboard at these times to ensure your links are working properly.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="dontShowAgain" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Don&apos;t show this message again
              </label>
            </div>
            
            <button
              onClick={handleCloseLinkRotationModal}
              className="w-full py-2.5 sm:py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Welcome Bonus Celebration Modal */}
      {showBonusCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-scaleIn">
            <button
              onClick={() => setShowBonusCelebration(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-bounce">
              <GiftIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 Congratulations!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You&apos;ve successfully connected your Telegram and claimed your welcome bonus!
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-6">
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Bonus Credited</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                +{WELCOME_BONUS_AMOUNT.toLocaleString()} Credits
              </p>
            </div>
            <button
              onClick={() => setShowBonusCelebration(false)}
              className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}

      {/* Welcome Bonus Banner - Show only if Telegram not connected */}
      {!userData.telegramId && showBonusBanner && (
        <div 
          className={`transform transition-all duration-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4 sm:p-5 shadow-lg">
            <button
              onClick={() => setShowBonusBanner(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GiftIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base sm:text-lg">
                  🎁 Claim Your {WELCOME_BONUS_AMOUNT.toLocaleString()} Credits Welcome Bonus!
                </h3>
                <p className="text-white/90 text-sm mt-0.5">
                  Connect your Telegram to receive your free credits instantly.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/connect-telegram"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Connect Telegram Now
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div 
        className={`transform transition-all duration-500 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back,</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white capitalize">
          {userData.username || 'User'}
        </h1>
      </div>

      {/* Credit Balance Card */}
      <div 
        className={`transform transition-all duration-500 delay-100 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 sm:p-8 shadow-xl shadow-primary-500/20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20 blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-3xl"></div>
            <svg className="absolute right-0 top-0 h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Card Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-primary-100 text-sm font-medium mb-1 flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4" />
                  Available Credits
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {formatCredits(userData.points)}
                  </span>
                  <span className="text-primary-200 text-lg font-medium">credits</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/buy"
                className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Buy Credits
                <ArrowRightIcon className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </Link>
              <Link
                href="/credits"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ChartBarIcon className="w-5 h-5" />
                View History
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/60"></div>
            <div className="w-2 h-2 rounded-full bg-white/80"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className={`transform transition-all duration-500 delay-200 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative overflow-hidden p-4 sm:p-5 bg-white dark:bg-gray-800/50 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.iconBg} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-0.5">
                {action.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Setup & Resources */}
      <div 
        className={`transform transition-all duration-500 delay-300 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Setup & Resources
          </h2>
        </div>
        <div className="space-y-3">
          {setupItems.map((item, index) => {
            const ItemWrapper = item.isExternal ? 'a' : Link;
            const externalProps = item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            
            return (
              <ItemWrapper
                key={item.title}
                href={item.href}
                {...externalProps}
                className={`group flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  item.isComplete === false
                    ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                    : item.isComplete === true
                    ? 'border-green-200 dark:border-green-500/30'
                    : 'border-gray-100 dark:border-gray-700/50'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  item.isComplete === false
                    ? 'bg-amber-100 dark:bg-amber-500/20'
                    : item.isComplete === true
                    ? 'bg-green-100 dark:bg-green-500/20'
                    : 'bg-gray-100 dark:bg-gray-700/50'
                }`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    item.isComplete === false
                      ? 'text-amber-600 dark:text-amber-400'
                      : item.isComplete === true
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {item.isComplete === true ? (
                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  ) : item.isComplete === false ? (
                    <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  ) : (
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>

      {/* Pro Tip Card */}
      <div 
        className={`transform transition-all duration-500 delay-[400ms] ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Pro Tip</h3>
              <p className="text-sm text-gray-400">
                Connect your Telegram account to receive instant notifications when someone interacts with your links. Never miss an opportunity!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}