'use client';

import { usePathname, redirect } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon,
  LinkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';
import InstallApp from '@/components/InstallApp';

interface NavItem {
  path: string;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Home', icon: HomeIcon },
  { path: '/links', label: 'Links', icon: LinkIcon },
  { path: '/credits', label: 'Credits', icon: CurrencyDollarIcon },
  { path: '/profile', label: 'Profile', icon: UserIcon },
  { path: '/settings', label: 'Settings', icon: CogIcon },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin?callbackUrl=' + encodeURIComponent(pathname));
    },
  });

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-primary-400">Loading...</div>
    </div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Access Denied</div>
    </div>;
  }

  return (
    <>
      <Navigation />
      <InstallApp />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 pb-20 pt-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/98 backdrop-blur-lg border-t border-primary-800 px-4 py-2">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex justify-between items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex flex-col items-center p-2 transition-colors duration-200
                      ${isActive 
                        ? 'text-primary-400' 
                        : 'text-gray-400 hover:text-primary-400'
                      }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}