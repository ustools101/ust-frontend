'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function GeneratePage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-primary-400 mb-6">Generate New Link</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => router.push('/generate/social')}
          className="w-full p-6 bg-gray-900/50 border border-primary-800 rounded-lg text-left hover:border-primary-600 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-primary-400">Social Media Links</h2>
              <p className="text-sm text-gray-400 mt-2">
                Generate links for popular social media platforms
              </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </button>
      </div>
    </div>
  );
}
