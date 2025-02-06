'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SigninFormData {
  email: string;
  password: string;
}

function SigninFormContent({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState<SigninFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md bg-secondary-700/50 border border-primary-500/20 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md bg-secondary-700/50 border border-primary-500/20 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Sign in'
        )}
      </button>

      <div className="text-sm text-gray-400">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary-500 hover:text-primary-400">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default function SigninForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  return <SigninFormContent callbackUrl={callbackUrl} />;
}
