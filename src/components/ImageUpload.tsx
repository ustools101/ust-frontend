'use client';

import { useRef, useState, useCallback } from 'react';
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  PhotoIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_MB   = 5;

export default function ImageUpload({ value, onChange, label, hint, required, error }: Props) {
  const inputRef                      = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver]       = useState(false);

  const upload = useCallback(async (file: File) => {
    setUploadError(null);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError('Image upload is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file.');
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setUploadError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Image must be under ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? 'Upload failed');
      }

      const data = await res.json();
      onChange(data.secure_url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFile = (file: File | null | undefined) => {
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = () => {
    onChange('');
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {/* ── Preview (image already uploaded) ── */}
      {value && !uploading ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-36 object-cover bg-gray-100 dark:bg-gray-800"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg shadow hover:bg-white dark:hover:bg-gray-900 transition-colors"
            >
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={clear}
              className="p-1.5 bg-white/90 dark:bg-gray-900/90 text-red-500 rounded-lg shadow hover:bg-white dark:hover:bg-gray-900 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-lg">
            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Uploaded</span>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-150 py-7 px-4 ${
            uploading
              ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-500/5 cursor-wait'
              : dragOver
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10 scale-[1.01] cursor-copy'
              : uploadError || error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-500/5 cursor-pointer hover:border-red-400'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-500/5'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <PhotoIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-primary-500">Click to upload</span> or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  JPG, PNG, WebP — max {MAX_MB} MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {(uploadError || error) && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <ExclamationCircleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-500 leading-relaxed">{uploadError ?? error}</p>
        </div>
      )}

      {hint && !uploadError && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}
