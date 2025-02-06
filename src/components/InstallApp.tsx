'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import IOSInstallModal from './IOSInstallModal';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user has dismissed the prompt before
    const hasUserDismissed = localStorage.getItem('pwa-prompt-dismissed');

    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (!isAppInstalled && !hasUserDismissed) {
      if (isIOSDevice) {
        // Show banner for iOS
        setShowBanner(true);
      } else {
        // Handle non-iOS devices
        const handler = (e: any) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
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
    <>
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
                  Install USTools
                </p>
                <p className="text-sm opacity-75">
                  {isIOS 
                    ? 'Add to your home screen for the best experience'
                    : 'Add to your home screen for quick access'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center space-x-1"
              >
                {isIOS && <ShareIcon className="w-4 h-4 mr-1" />}
                {isIOS ? 'Add to Home Screen' : 'Install'}
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

      <IOSInstallModal 
        isOpen={showIOSModal} 
        onClose={() => setShowIOSModal(false)} 
      />
    </>
  );
}
