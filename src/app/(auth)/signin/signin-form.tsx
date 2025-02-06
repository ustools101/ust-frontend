'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SigninFormData {
  email: string;
  password: string;
}

export default function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        console.log(result.error);
        setError('Invalid credentials');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.log(err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm rounded bg-red-500/10 border border-red-500/20 text-red-500 font-mono">
          <span className="text-red-400">!</span> {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="block font-mono text-sm text-primary-400">
          <span className="text-secondary-200">#</span> email
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-secondary-900/50 border border-secondary-700 py-2 px-4 font-mono text-white placeholder-secondary-500
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter email"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 font-mono text-secondary-500">@</div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block font-mono text-sm text-primary-400">
          <span className="text-secondary-200">*</span> password
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-secondary-900/50 border border-secondary-700 py-2 px-4 font-mono text-white placeholder-secondary-500
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter password"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 font-mono text-secondary-500">***</div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full group px-8 py-4 bg-transparent text-primary-400 font-mono text-lg 
                 transition-all duration-300 relative overflow-hidden border border-primary-500
                 hover:bg-primary-500/20 hover:shadow-[0_0_15px_#86C232] mt-8
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
      >
        <span className="relative z-10 flex items-center justify-center">
          <span className="mr-2">[</span>
          {isLoading ? (
            <>
              <span className="text-white mr-2">$</span>authenticating...
            </>
          ) : (
            <>
              <span className="text-white mr-2">$</span>login
            </>
          )}
          <span className="ml-2">]</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent 
                    transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
      </button>

      {/* Signup Link */}
      <div className="mt-6 text-center font-mono text-sm">
        <span className="text-secondary-400">Don't have an account? </span>
        <Link href="/signup" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
          ./signup.sh
        </Link>
      </div>
      {/* forgot password */}
      <div className="mt-6 text-center font-mono text-sm">
        <span className="text-secondary-400">Forgot password? </span>
        <Link href="/forgot_password" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
          ./forgot_password.sh
        </Link>
      </div>
    </form>
  );
}
