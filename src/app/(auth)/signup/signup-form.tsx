'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { validateUsername, validateEmail, validatePassword } from '@/lib/validation';
import Link from 'next/link';

interface SignupFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate form in real-time
  useEffect(() => {
    const validateForm = () => {
      const newErrors: FormErrors = {};

      // Only validate if fields have values
      if (formData.email) {
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError.message;
      }

      if (formData.username) {
        const usernameError = validateUsername(formData.username);
        if (usernameError) newErrors.username = usernameError.message;
      }

      if (formData.password) {
        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError.message;
      }

      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      setErrors(newErrors);

      // Form is valid if all fields are filled and there are no errors
      const allFieldsFilled = Object.values(formData).every(value => value.length > 0);
      setIsValid(allFieldsFilled && Object.keys(newErrors).length === 0);
    };

    validateForm();
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Failed to sign in after registration');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Something went wrong'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-3 text-sm rounded bg-red-500/10 border border-red-500/20 text-red-500 font-mono">
          <span className="text-red-400">!</span> {errors.general}
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
        {errors.email && (
          <p className="text-xs text-red-500 font-mono mt-1">
            <span className="text-red-400">!</span> {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="block font-mono text-sm text-primary-400">
          <span className="text-secondary-200">$</span> username
        </label>
        <div className="relative">
          <input
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className={`w-full bg-secondary-900/50 border py-2 px-4 font-mono text-white placeholder-secondary-500
                     focus:outline-none focus:ring-1
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     ${errors.username 
                       ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                       : formData.username && !errors.username
                         ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                         : 'border-secondary-700 focus:border-primary-500 focus:ring-primary-500'
                     }`}
            placeholder="Enter username"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 font-mono text-secondary-500">_</div>
        </div>
        {errors.username && (
          <p className="text-xs text-red-500 font-mono mt-1">
            <span className="text-red-400">!</span> {errors.username}
          </p>
        )}
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
            minLength={8}
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
        {errors.password && (
          <p className="text-xs text-red-500 font-mono mt-1">
            <span className="text-red-400">!</span> {errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block font-mono text-sm text-primary-400">
          <span className="text-secondary-200">*</span> confirm
        </label>
        <div className="relative">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-secondary-900/50 border border-secondary-700 py-2 px-4 font-mono text-white placeholder-secondary-500
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Confirm password"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 font-mono text-secondary-500">***</div>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 font-mono mt-1">
            <span className="text-red-400">!</span> {errors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full group px-8 py-4 bg-transparent text-primary-400 font-mono text-lg 
                 transition-all duration-300 relative overflow-hidden border border-primary-500
                 hover:bg-primary-500/20 hover:shadow-[0_0_15px_#86C232] mt-8
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
      >
        <span className="relative z-10 flex items-center justify-center">
          <span className="mr-2">[</span>
          {isLoading ? (
            <>
              <span className="text-white mr-2">$</span>initializing...
            </>
          ) : (
            <>
              <span className="text-white mr-2">$</span>create-account
            </>
          )}
          <span className="ml-2">]</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent 
                    transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
      </button>

      {/* Login Link */}
      <div className="mt-6 text-center font-mono text-sm">
        <span className="text-secondary-400">Already have root access? </span>
        <Link href="/signin" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
          ./signin.sh
        </Link>
      </div>
    </form>
  );
}
