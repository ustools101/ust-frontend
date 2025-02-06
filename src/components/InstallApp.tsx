'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user has dismissed the prompt before
    const hasUserDismissed = localStorage.getItem('pwa-prompt-dismissed');

    if (!isAppInstalled && !hasUserDismissed) {
      const handler = (e: any) => {
        // Prevent the default prompt
        e.preventDefault();
        // Store the event for later use
        setDeferredPrompt(e);
        // Show our custom prompt
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Hide the banner
      setShowBanner(false);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
    }
  };

  const handleDismiss = () => {
    // Store user's preference
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    // Hide the banner
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary-400 text-black">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/icons/icon-192x192.png" 
                alt="App Icon" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
            <div>
              <p className="font-medium">
                Install Ultimate Social Tools
              </p>
              <p className="text-sm opacity-75">
                Add to your home screen for quick access
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors duration-200"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-black/10 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
