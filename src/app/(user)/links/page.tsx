'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import ILink from '@/types/link';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { FaEdit, FaTrash, FaEye, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function LinksPage() {
  const [links, setLinks] = useState<ILink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const socialLinkHostAddress = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST;

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const session = await getSession();
      if (!session) {
        toast.error('Please sign in to view your links');
        return;
      }

      const response = await fetch('/api/auth/links');
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setLinks(data.links);
    } catch (error) {
      toast.error('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for environments where clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Failed to copy link');
    }
  };

  const filteredLinks = links.filter(link => {
    if (filter === 'all') return true;
    return link.linkType.toLowerCase() === filter.toLowerCase();
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const aValue = a[sortBy as keyof ILink] ?? '';
    const bValue = b[sortBy as keyof ILink] ?? '';
    
    if (sortOrder === 'asc') {
      return String(aValue) > String(bValue) ? 1 : -1;
    }
    return String(aValue) < String(bValue) ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-400">My Links</h1>
        <Link 
          href="/generate"
          className="bg-primary-400 text-white px-4 py-2 rounded-md hover:bg-primary-500 transition-colors"
        >
          Create New Link
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border-[1px] border-gray-600/20 rounded-md px-3 py-2 bg-secondary-500 focus:outline-none focus:border-primary-400"
        >
          <option value="all">All Types</option>
          <option value="voting">Voting</option>
          <option value="giveaway">Giveaway</option>
          <option value="custom">Custom</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border-[1px] border-gray-600/20 rounded-md px-3 py-2 bg-secondary-500 focus:outline-none focus:border-primary-400"
        >
          <option value="createdAt">Created Date</option>
          <option value="linkName">Link Name</option>
          <option value="linkType">Link Type</option>
          <option value="price">Price</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border-[1px] border-gray-600/20 rounded-md px-3 py-2 bg-secondary-500 focus:outline-none focus:border-primary-400"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {sortedLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No links found. Create your first link!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLinks.map((link) => (
            <div 
              key={link.linkId.toString()} 
              className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden"
            >
              {/* Card Header with Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={link.image}
                  alt={"Link image"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {link.linkName}
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                <div className="flex flex-col justify-between">
                  <span className="text-sm text-gray-500 my-2">
                    This link will expire on: {format(new Date(link.expiresAt!), 'MMM d, yyyy')}
                  </span>
                  <div>
                  <span className={`px-3 py-1 capitalize text-xs font-medium rounded-full
                    ${link.linkType === 'Voting' ? 'bg-blue-100 text-blue-800' : 
                    link.linkType === 'Giveaway' ? 'bg-green-100 text-green-800' : 
                    'bg-purple-100 text-purple-800'}`}
                  >
                    {link.linkType} link
                  </span>
                    {
                      link.socialMedia?.map((platform) => (
                        <span key={platform} className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {platform}
                        </span>
                      ))
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(`${socialLinkHostAddress?.trim()}/slink/${link.linkId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium 
                             text-gray-700 bg-gray-50 rounded-md
                             hover:bg-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                             transition-colors"
                    aria-label="Copy link"
                  >
                    <FaCopy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  <Link
                    href={`/links/${link._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium 
                             text-white bg-indigo-600 rounded-md
                             hover:bg-indigo-700
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                             transition-colors"
                    aria-label="View link details"
                  >
                    <FaEye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
