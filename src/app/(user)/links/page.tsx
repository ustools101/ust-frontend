'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import ILink from '@/types/link';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ClipboardDocumentIcon,
  EyeIcon,
  PlusIcon,
  ArrowsUpDownIcon,
  LinkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/* ─── helpers ────────────────────────────────────────────────── */

const FILTER_TABS = [
  { value: 'all',      label: 'All' },
  { value: 'voting',   label: 'Voting' },
  { value: 'giveaway', label: 'Giveaway' },
  { value: 'custom',   label: 'Custom' },
  { value: 'scratch',  label: 'Scratch' },
];

const TYPE_COLORS: Record<string, string> = {
  voting:   'bg-blue-500',
  giveaway: 'bg-green-500',
  custom:   'bg-purple-500',
  scratch:  'bg-pink-500',
};

const TYPE_TEXT: Record<string, string> = {
  voting:   'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10',
  giveaway: 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-500/10',
  custom:   'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/10',
  scratch:  'text-pink-700 bg-pink-50 dark:text-pink-300 dark:bg-pink-500/10',
};

/* ─── component ───────────────────────────────────────────────── */

export default function LinksPage() {
  const [links, setLinks]       = useState<ILink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [copied, setCopied]     = useState<string | null>(null);

  const host = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST?.trim() ?? '';

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const session = await getSession();
      if (!session) { toast.error('Please sign in'); return; }
      const res  = await fetch('/api/auth/links');
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      setLinks(data.links);
    } catch {
      toast.error('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (linkId: string) => {
    const url = `${host}/slink/${linkId}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(linkId);
      toast.success('Link copied!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const displayed = [...links]
    .filter(l => filter === 'all' || l.linkType?.toLowerCase() === filter)
    .sort((a, b) => {
      const av = new Date(a.createdAt ?? 0).getTime();
      const bv = new Date(b.createdAt ?? 0).getTime();
      return sortDesc ? bv - av : av - bv;
    });

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Links</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{links.length} link{links.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Link
        </Link>
      </div>

      {/* Filter tabs + sort */}
      <div className="flex items-center gap-2">
        {/* Scrollable pill tabs */}
        <div className="flex gap-1.5 overflow-x-auto flex-1 pb-0.5 no-scrollbar">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === tab.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortDesc(s => !s)}
          title={sortDesc ? 'Newest first' : 'Oldest first'}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowsUpDownIcon className="w-3.5 h-3.5" />
          {sortDesc ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <LinkIcon className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            {filter === 'all' ? 'No links yet' : `No ${filter} links`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {filter === 'all'
              ? 'Create your first link to get started.'
              : 'Try a different filter or create a new link.'}
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create a link
          </Link>
        </div>
      )}

      {/* Link cards */}
      <div className="space-y-3">
        {displayed.map((link) => {
          const typeKey  = link.linkType?.toLowerCase() ?? 'custom';
          const isCopied = copied === link.linkId?.toString();
          const linkUrl  = `${host}/slink/${link.linkId}`;
          const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;

          return (
            <div
              key={link.linkId?.toString()}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Coloured top strip */}
              <div className={`h-1 w-full ${TYPE_COLORS[typeKey] ?? 'bg-gray-400'}`} />

              <div className="p-4 space-y-3">
                {/* Row 1: name + type badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
                    {link.linkName || 'Untitled link'}
                  </h3>
                  <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_TEXT[typeKey] ?? 'text-gray-600 bg-gray-100'}`}>
                    {link.linkType}
                  </span>
                </div>

                {/* Row 2: link URL preview */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                    {linkUrl}
                  </span>
                </div>

                {/* Row 3: expiry + platforms */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isExpired
                      ? <><ExclamationCircleIcon className="w-3.5 h-3.5" /> Expired</>
                      : <>Expires {format(new Date(link.expiresAt!), 'MMM d, yyyy')}</>
                    }
                  </span>
                  {link.socialMedia?.map(p => (
                    <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Row 4: actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(link.linkId!.toString())}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    {isCopied
                      ? <><CheckCircleIcon className="w-4 h-4" /> Copied!</>
                      : <><ClipboardDocumentIcon className="w-4 h-4" /> Copy Link</>
                    }
                  </button>
                  <Link
                    href={typeKey === 'scratch' ? `/links/${link._id}/scratch` : `/links/${link._id}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
