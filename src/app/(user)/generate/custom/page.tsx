'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

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

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'otp', label: 'OTP Code' },
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
  inputs: [],
});

export default function CustomGeneratePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    linkName: '',
    pages: [createDefaultPage()],
    successTitle: 'Success!',
    successMessage: 'Your submission has been received.',
    successButtonText: 'Done',
    successButtonUrl: '',
    duration: 1,
  });

  const activePage = formData.pages[activePageIndex];

  const updatePage = (pageIndex: number, updates: Partial<CustomPage>) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.map((page, i) => 
        i === pageIndex ? { ...page, ...updates } : page
      ),
    }));
  };

  const MAX_PAGES = 5;

  const addPage = () => {
    if (formData.pages.length >= MAX_PAGES) {
      toast.error(`Maximum ${MAX_PAGES} pages allowed`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, createDefaultPage()],
    }));
    setActivePageIndex(formData.pages.length);
  };

  const removePage = (pageIndex: number) => {
    if (formData.pages.length <= 1) {
      toast.error('You need at least one page');
      return;
    }
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== pageIndex),
    }));
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
    updatePage(pageIndex, {
      inputs: [...formData.pages[pageIndex].inputs, createDefaultInput()],
    });
  };

  const removeInput = (pageIndex: number, inputIndex: number) => {
    const page = formData.pages[pageIndex];
    updatePage(pageIndex, {
      inputs: page.inputs.filter((_, i) => i !== inputIndex),
    });
  };

  const updateInput = (pageIndex: number, inputIndex: number, updates: Partial<PageInput>) => {
    const page = formData.pages[pageIndex];
    updatePage(pageIndex, {
      inputs: page.inputs.map((input, i) => 
        i === inputIndex ? { ...input, ...updates } : input
      ),
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
      0.5: 1,
      1: 1,
      2: 2,
      4: 4,
      8: 7,
      12: 10,
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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-purple-400">Build Custom Link</h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
        >
          <EyeIcon className="w-5 h-5" />
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Link Name */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Link Name
          </label>
          <input
            type="text"
            value={formData.linkName}
            onChange={(e) => setFormData({ ...formData, linkName: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 text-gray-100"
            placeholder="Give this link a name (for your reference)"
            maxLength={50}
          />
        </div>

        {/* Page Tabs */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-200">
              Pages <span className="text-sm text-gray-500">({formData.pages.length}/{MAX_PAGES})</span>
            </h2>
            <button
              type="button"
              onClick={addPage}
              disabled={formData.pages.length >= MAX_PAGES}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
              Add Page
            </button>
          </div>

          {/* Page Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.pages.map((page, index) => (
              <button
                key={page.id}
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
                  disabled={activePageIndex === formData.pages.length - 1}
                  className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicatePage(activePageIndex)}
                  className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"
                  title="Duplicate Page"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePage(activePageIndex)}
                  disabled={formData.pages.length <= 1}
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
                    rows={3}
                    placeholder="Additional text to display before the form (optional)"
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
                      value={activePage.backgroundColor}
                      onChange={(e) => updatePage(activePageIndex, { backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.backgroundColor}
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
                      value={activePage.textColor}
                      onChange={(e) => updatePage(activePageIndex, { textColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.textColor}
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
                      value={activePage.buttonColor}
                      onChange={(e) => updatePage(activePageIndex, { buttonColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.buttonColor}
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
                      value={activePage.buttonTextColor}
                      onChange={(e) => updatePage(activePageIndex, { buttonTextColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activePage.buttonTextColor}
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
                    <div key={input.id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-400">
                          Input {inputIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInput(activePageIndex, inputIndex)}
                          className="p-1 text-red-400 hover:text-red-300"
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
                value={formData.successTitle}
                onChange={(e) => setFormData({ ...formData, successTitle: e.target.value })}
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
                value={formData.successButtonText}
                onChange={(e) => setFormData({ ...formData, successButtonText: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                placeholder="Done"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Success Message
              </label>
              <textarea
                value={formData.successMessage}
                onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
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
                value={formData.successButtonUrl}
                onChange={(e) => setFormData({ ...formData, successButtonUrl: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-600 text-gray-100"
                placeholder="https://example.com (leave empty to stay on success page)"
              />
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-400 mb-4">
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 0.5, label: '3 Days' },
              { value: 1, label: '1 Week' },
              { value: 2, label: '2 Weeks' },
              { value: 4, label: '1 Month' },
              { value: 8, label: '2 Months' },
              { value: 12, label: '3 Months' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${formData.duration === option.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-gray-900/50 border border-purple-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-400">Price</span>
              <p className="text-xs text-gray-500 mt-1">
                Base + ₦1,500 per additional page
              </p>
            </div>
            <span className="text-xl font-semibold text-purple-400">
              ₦{calculatePrice().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-purple-600 
            hover:bg-purple-700 transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            'Generate Custom Link'
          )}
        </button>
      </form>

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
                  style={{ color: activePage.textColor }}
                >
                  {activePage.title || 'Page Title'}
                </h2>
                {activePage.subtitle && (
                  <p className="text-center mb-4" style={{ color: activePage.textColor, opacity: 0.7 }}>{activePage.subtitle}</p>
                )}
                {activePage.writeup && (
                  <p className="text-sm mb-6" style={{ color: activePage.textColor, opacity: 0.7 }}>{activePage.writeup}</p>
                )}
                <div className="space-y-4">
                  {activePage.inputs.map((input) => (
                    <div key={input.id}>
                      <label className="block text-sm font-medium mb-1" style={{ color: activePage.textColor }}>
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
