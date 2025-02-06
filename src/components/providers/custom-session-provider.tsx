'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function SessionUpdater() {
  const { data: session, update } = useSession();
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const MIN_UPDATE_INTERVAL = 5000; // Minimum 5 seconds between updates

  const updateSession = async () => {
    const now = Date.now();
    if (!session?.user || now - lastUpdate < MIN_UPDATE_INTERVAL) {
      return;
    }

    try {
      setLastUpdate(now);
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      
      if (data.user && session?.user) {
        // Only update if there are actual changes
        const hasChanges = Object.keys(data.user).some(
          key => data.user[key] !== session.user[key]
        );
        
        if (hasChanges) {
          await update({
            ...session,
            user: {
              ...session.user,
              ...data.user
            }
          });
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  useEffect(() => {
    // Initial update after a short delay
    const initialTimer = setTimeout(updateSession, 1000);
    
    // Periodic updates
    const updateTimer = setInterval(updateSession, 30000); // Update every 30 seconds
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(updateTimer);
    };
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
