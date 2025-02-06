'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { CreditCardIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (session?.user) {
      setPoints(Number(session?.user.points) || 0);
    }
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
          
          <div className="flex items-center space-x-6">
            {session ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-full">
                  <CreditCardIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {points.toLocaleString()} C
                  </span>
                  <Link
                    href="/buy"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Buy
                  </Link>
                </div>
                <button
                  onClick={() => signOut({
                    callbackUrl: '/signin'
                  })}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:text-blue-600" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link 
                href="/signin" 
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
