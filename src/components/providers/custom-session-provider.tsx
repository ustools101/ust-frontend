'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function SessionUpdater() {
  const { data: session, update } = useSession();

  const updateSession = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      
      if (data.user && session?.user) {
        // Update the session with latest user data
        await update({
          ...session,
          user: {
            ...session.user,
            ...data.user
          }
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  useEffect(() => {
    // Update immediately on mount
    updateSession();

    // Set up interval for periodic updates
    const interval = setInterval(updateSession, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  return null;
}

export default function CustomSessionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider>
      <SessionUpdater />
      {children}
    </SessionProvider>
  );
}
