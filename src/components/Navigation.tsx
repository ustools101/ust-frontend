'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { CreditCardIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const [points, setPoints] = useState<number | undefined>(undefined);
  const [polling, setPolling] = useState(false);

  const getUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      if (data.user?.points !== undefined) {
        setPoints(data.user.points);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    if (!session?.user || polling) return;

    setPolling(true);
    getUser();

    const interval = setInterval(getUser, 10000);

    return () => {
      setPolling(false);
      clearInterval(interval);
    };
  }, [session]);

  return (
    <nav className="border-b dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UST
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-full">
                  <CreditCardIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {points?.toLocaleString() || '...'} C
                  </span>
                  <Link
                    href="/buy"
                    className="text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
                  >
                    Buy
                  </Link>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
