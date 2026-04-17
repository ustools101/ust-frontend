'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightIcon, SparklesIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

const OPTIONS = [
  {
    path: '/generate/social',
    icon: SparklesIcon,
    iconColor: 'text-primary-500',
    iconBg: 'bg-primary-500/10',
    title: 'Social Media Link',
    description:
      'Choose from Voting, Giveaway, or Custom. The page mimics a real social media login — Facebook, Instagram, or TikTok.',
    tag: 'Most popular',
    tagColor: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  },
  {
    path: '/generate/custom',
    icon: PuzzlePieceIcon,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    title: 'Build from Scratch',
    description:
      'Design your own multi-page form with any fields, colours, and flow you want. Full control over every screen.',
    tag: 'Advanced',
    tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

export default function GeneratePage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Generate New Link</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Pick a type below — you can always create more later.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ path, icon: Icon, iconColor, iconBg, title, description, tag, tagColor }) => (
          <button
            key={path}
            type="button"
            onClick={() => router.push(path)}
            className="w-full text-left p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all duration-150 group"
          >
            <div className="flex items-start gap-4">
              <div className={`shrink-0 p-2.5 rounded-xl ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
              <ArrowRightIcon className="shrink-0 w-4 h-4 text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
