'use client';

import { useEffect, useState } from 'react';
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const {data: session} = useSession();
  const [settings, setSettings] = useState({
    enableTelegramNotification: session?.user.enableTelegramNotification || false,
    telegramId: session?.user.telegramId || 0
  });
  const router = useRouter()

  const toggleSetting = (setting: keyof typeof settings) => {
    handleEnableTelegram(!settings.enableTelegramNotification)
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const getUser = async () => {
    if(session?.user){
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      if(data.user){
        setSettings({
          enableTelegramNotification: data.user.enableTelegramNotification,
          telegramId: data.user.telegramId
        })
      }
    }
  }


  useEffect(()=> {
    getUser();
  },[])

  const handleEnableTelegram = async (enableTelegramNotification: boolean) => {
    try{
      const req = await fetch('/api/auth/user/enable-telegram-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enableTelegramNotification })
      });
      if(!req.ok){
        toast.error('Failed to enable Telegram notification');
        return
      }
      if(enableTelegramNotification){
        toast.success('Telegram notification enabled');
      }else{
        toast.success('Telegram notification disabled');
      }
    }catch(error:any){
      toast.error(error.message);
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Notification Settings */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-gray-500" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Enable Telegram Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive telegram notifications</p>
                </div>
                <Switch
                  checked={settings.enableTelegramNotification}
                  onChange={() => toggleSetting('enableTelegramNotification')}
                  className={`${
                    settings.enableTelegramNotification ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Enable telegram notifications</span>
                  <span
                    className={`${
                      settings.enableTelegramNotification ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>

             {/* disabled input field for telegram id with chnage button below it */}
             <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Telegram ID</h3>
                  <input
                    disabled
                    type="text"
                    value={settings.telegramId}
                    placeholder="Enter your Telegram ID"
                    className="px-4 bg-secondary-400 text-white py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => router.push('/connect-telegram')}
                type="button"
                className="px-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Change Telegram ID
              </button>
            </div>
           

          </section>
        </div>
      </div>
    </div>
  );
}
