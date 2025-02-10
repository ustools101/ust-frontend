'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  LinkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UserStats {
  totalUsers: number;
  totalLinks: number;
  activeUsers: number;
  userGrowth: number;
}

interface AdminDashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<any>;
  description: string;
  trend?: {
    value: number;
    label: string;
  };
}

const AdminDashboardCard = ({ title, value, icon: Icon, description, trend }: AdminDashboardCardProps) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend.value >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
    <p className="mt-4 text-sm text-gray-400">{description}</p>
    {trend && (
      <p className="mt-1 text-xs text-gray-500">{trend.label}</p>
    )}
  </div>
);

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalLinks: 0,
    activeUsers: 0,
    userGrowth: 0,
  });
  const [isCrediting, setIsCrediting] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (!response.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        router.push('/dashboard');
      }
    };

    checkAdminAccess();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-400">Monitor and manage your platform</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Live Data
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Total Users</h3>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {stats.userGrowth > 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                )}
                <span className={`ml-1 ${stats.userGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.userGrowth)}% last 30 days
                </span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Total Links</h3>
                <LinkIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">{stats.totalLinks.toLocaleString()}</p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Active Users</h3>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-white mt-4">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-2">In the last 30 days</p>
            </div>
          </div>

          {/* Credit User Section */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full">
            <h2 className="text-lg font-semibold text-white mb-4">Credit User</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (isCrediting) return;

              const formData = new FormData(e.currentTarget);
              const email = formData.get('email') as string;
              const amount = parseInt(formData.get('amount') as string);

              setIsCrediting(true);
              try {
                const response = await fetch('/api/admin/credit-user', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, amount }),
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to credit user');
                }

                toast.success(`Successfully credited ${amount} points to ${email}`);
                
              } catch (error) {
                toast.error(error.message || 'Failed to credit user');
              } finally {
                setIsCrediting(false);
              }
            }} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  User Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  disabled={isCrediting}
                  placeholder="user@example.com"
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                  Amount to Credit
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="1"
                  disabled={isCrediting}
                  placeholder="Enter amount"
                  className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={isCrediting}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCrediting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Credit User'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
