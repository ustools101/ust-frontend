'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCopy } from 'react-icons/fa';
import { platform } from 'process';

interface Link {
  _id: string;
  title: string;
  url: string;
  expiresAt: string;
  userId: string;
  linkId?: string;
  type?: string;
}

export default function LinkDetails() {
  const params = useParams();
  const router = useRouter();
  const [link, setLink] = useState<Link | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(1);
  const [pricePerWeek, setPricePerWeek] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    expiresAt: '',
    linkType: '',
    linkName: '',
    contestantName: '',
    writeup: '',
    image: '',
    bannerImage: '',
    linkUrl: '',
    linkId: '',
    socialMedia: [],
    retry: 1,
    askForOtp: true,
  });

  const socialLinkHostAddress = process.env.NEXT_PUBLIC_SOCIAL_LINK_HOST;



  useEffect(() => {
    fetchLinkDetails();
  }, [params.id]);

  const fetchLinkDetails = async () => {
    try {
      const response = await fetch(`/api/auth/links/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch link details');
      const data = await response.json();

      const newFormData: any = {
        title: data.title || '',
        url: data.url || '',
      };

      if (data.type) newFormData.type = data.type;
      if (data.expiresAt) newFormData.expiresAt = format(new Date(data.expiresAt), 'yyyy-MM-dd');
      if (data.linkType) newFormData.linkType = data.linkType;
      if (data.linkId) newFormData.linkId = data.linkId;
      if (data.linkName) newFormData.linkName = data.linkName;
      if (data.writeup) newFormData.writeup = data.writeup;
      if (data.image) newFormData.image = data.image;
      if (data.bannerImage) newFormData.bannerImage = data.bannerImage;
      if (data.contestantName) newFormData.contestantName = data.contestantName;
      if (data.linkUrl) newFormData.linkUrl = data.linkUrl;
      if(data.socialMedia) newFormData.socialMedia = data.socialMedia;
      if(data.retry) newFormData.retry = data.retry;
      if(data.otpEnabled !== undefined) newFormData.askForOtp = data.otpEnabled;

      if(data.socialMedia.length === 1) setPricePerWeek(4000);
      if(data.socialMedia.length === 2) setPricePerWeek(6500);
      if(data.socialMedia.length === 3) setPricePerWeek(9000);

      setLink(data);
      setFormData(newFormData);
    } catch (error) {
      toast.error('Error fetching link details');
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/links/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok){
        toast.error(data.error || 'Error updating link')
        return;
      };

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration
        }),
      });
      const data = await response.json();
      if (!response.ok){
        toast.error(data.error || 'Error Extending link')
        return;
      };

      toast.success('Link Extended successfully');
      fetchLinkDetails();
      // scroll to bottom
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      toast.error('Error Extending link');
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

  if (!link) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg  p-6">

        <form onSubmit={handleExtend} className="space-y-6 max-w-2xl mx-auto border border-gray-800 rounded-xl py-4 px-2 mb-10">
          <div className="bg-transparent ring-gray-900/5 rounded-xl py-4 px-2 space-y-6">
              <h1 className="text-xl font-bold text-white my-2">
                Extend Expiration Date
              </h1>
              <div>
                <label className="block text-sm font-medium text-white mb-4">
                  Extend Link expiration by:
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                        ${duration === option.value
                          ? 'bg-primary-400 text-black'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
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
                  ₦{(duration * pricePerWeek).toLocaleString()}
                </span>
              </div>
            </div>
        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-end gap-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm 
                      hover:bg-indigo-500 
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Extending...</span>
              </div>
            ) : (
              'Extend'
            )}
          </button>
        </div>
          </div>
        </form>


        <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl mx-auto border border-gray-800 rounded-xl py-4 px-2">
          <div className="bg-transparent ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
            <h1 className="text-xl font-bold text-white my-4">
              Edit Link Details
            </h1>
            {/* URL Input */}
            <div>
              <label 
                htmlFor="url" 
                className="text-sm font-medium leading-6 text-white flex items-center gap-2"
                aria-required="true"
              >
                Phishing Linking
                <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
              </label>
              <div className="mt-2">
                <div className="relative">
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={`${socialLinkHostAddress?.trim()}/slink/${formData.linkId}`}
                    disabled
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-200
                             bg-gray-50
                             cursor-not-allowed
                             sm:text-sm sm:leading-6"
                    placeholder="https://example.com"
                    aria-describedby="url-description"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${socialLinkHostAddress?.trim()}/slink/${formData.linkId}`);
                      toast.success('URL copied to clipboard');
                    }}
                    className="absolute inset-y-0 right-0 flex items-center px-3
                             text-white hover:text-gray-600 transition-colors"
                    aria-label="Copy URL to clipboard"
                  >
                    <FaCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500" id="url-description">
                Copy the link and use a URL shortener to shorten it.
              </p>
            </div>

            <div>
                <label 
                  htmlFor="linkName" 
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Link Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="linkName"
                    name="linkName"
                    value={formData.linkName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {
                (formData.linkType === 'custom' || formData.linkType === 'giveaway')
                &&
                <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-medium leading-6 text-white"
                  aria-required="true"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             sm:text-sm sm:leading-6"
                    required
                    placeholder="Enter title"
                    aria-describedby="title-description"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500" id="title-description">
                  A clear and descriptive title for your link
                </p>
              </div>
              }

              <div>
                <label 
                  htmlFor="image" 
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Image URL
                </label>
                <div className="mt-2">
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             sm:text-sm sm:leading-6"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {
                (formData.linkType === 'voting' || formData.linkType === 'giveaway')
                &&<div>
                <label 
                  htmlFor="bannerImage" 
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Banner Image URL
                </label>
                <div className="mt-2">
                  <input
                    type="url"
                    id="bannerImage"
                    name="bannerImage"
                    value={formData.bannerImage}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             sm:text-sm sm:leading-6"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              }

              {
                (formData.linkType === 'voting')
                &&               <div>
                <label 
                  htmlFor="contestantName" 
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Contestant Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="contestantName"
                    name="contestantName"
                    value={formData.contestantName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              }

              <div>
                <label 
                  htmlFor="linkType" 
                  className="block text-sm font-medium leading-6 text-white flex items-center gap-2"
                >
                  Link Type
                  <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                </label>
                <div className="mt-2 relative">
                  <input
                    type="text"
                    id="linkType"
                    name="linkType"
                    value={formData.linkType}
                    disabled
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-200
                             bg-gray-50
                             cursor-not-allowed
                             sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="writeup" 
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Write-up
                </label>
                <div className="mt-2">
                  <textarea
                    id="writeup"
                    name="writeup"
                    value={formData.writeup}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-300 
                             placeholder:text-white
                             focus:ring-2 focus:ring-inset focus:ring-indigo-600
                             hover:ring-gray-400
                             transition-colors
                             resize-y min-h-[100px]
                             sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="expiresAt" 
                  className="block text-sm font-medium leading-6 text-white flex items-center gap-2"
                >
                  Expires At
                  <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                </label>
                <div className="mt-2 relative">
                  <input
                    type="date"
                    id="expiresAt"
                    name="expiresAt"
                    value={formData.expiresAt}
                    disabled
                    className="block w-full rounded-md border-0 px-3 py-3 text-gray-900 shadow-sm 
                             ring-1 ring-inset ring-gray-200
                             bg-gray-50
                             cursor-not-allowed
                             sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Ask for OTP */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
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
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Password Retries */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
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
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-end gap-x-4">
              <button
                type="button"
                onClick={() => router.push('/links')}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm 
                         hover:bg-indigo-500 
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>


      


        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-lg font-medium text-gray-300 mb-4">Danger Zone</h2>
          <div className="bg-gray-800 rounded-lg p-4 border border-red-800">
            <div className="flex flex-col items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-4">Delete this link</h3>
                <p className="text-sm text-white mt-1">
                  Once you delete a link, there is no going back. Please be certain.
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="block w-full  my-4 px-4 py-2 bg-red-600 text-white rounded-md
                        hover:bg-red-700 
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                        text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
