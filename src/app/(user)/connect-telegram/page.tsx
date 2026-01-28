'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function ConnectTelegramPage() {
  const { data: session } = useSession();
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId) {
      toast.error('Please enter your Telegram ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/user/change-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: parseInt(telegramId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update Telegram ID');
        return;
      }

      // Check if welcome bonus was awarded
      if (data.welcomeBonusAwarded) {
        toast.success(`🎉 Congratulations! You received ${data.bonusAmount.toLocaleString()} credits welcome bonus!`, {
          duration: 5000,
        });
        // Redirect with bonus flag
        router.push('/dashboard?bonus=claimed');
      } else {
        toast.success('Telegram ID updated successfully');
        router.push('/dashboard');
      }
      
      // Reset form
      setTelegramId('');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect to UST Telegram Bot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Follow these steps to connect your account to our Telegram bot
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </span>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Click the link below to open our Telegram bot</p>
              <Link
                href="https://t.me/USTools_Bot"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                Open UST Bot
                <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </span>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Click the START button or send /TELEGRAMID</p>
              <p className="mt-1 text-sm text-gray-500">The bot will reply with your Telegram ID</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </span>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium mb-2">Enter your Telegram ID below</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="number"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="Enter your Telegram ID"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Telegram ID'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
