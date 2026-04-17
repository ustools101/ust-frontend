'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { validateEmail, validatePassword } from '@/lib/validation';
import Link from 'next/link';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors: FormErrors = {};

    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError.message;
    }

    if (formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError.message;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    const allFilled = Object.values(formData).every(v => v.length > 0);
    setIsValid(allFilled && Object.keys(newErrors).length === 0);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) throw new Error('Failed to sign in after registration');

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBorder = (field: keyof Omit<FormErrors, 'general'>) => {
    const hasValue = formData[field]?.length > 0;
    const hasError = !!errors[field];
    if (hasError)              return 'border-red-500/40 focus:ring-red-500/30 focus:border-red-500/60';
    if (hasValue && !hasError) return 'border-green-500/40 focus:ring-green-500/30 focus:border-green-500/60';
    return 'border-white/[0.08] focus:ring-violet-500/40 focus:border-violet-500/60';
  };

  const base = 'w-full bg-zinc-800 border rounded-lg px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3.5 py-2.5 rounded-lg">
          {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Email
        </label>
        <input
          type="email" id="email" name="email" required
          value={formData.email} onChange={handleChange} disabled={isLoading}
          className={`${base} ${inputBorder('email')}`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Password
        </label>
        <input
          type="password" id="password" name="password" required minLength={6}
          value={formData.password} onChange={handleChange} disabled={isLoading}
          className={`${base} ${inputBorder('password')}`}
          placeholder="Min. 6 characters"
        />
        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Confirm Password
        </label>
        <input
          type="password" id="confirmPassword" name="confirmPassword" required minLength={6}
          value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
          className={`${base} ${inputBorder('confirmPassword')}`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-sm text-zinc-500 text-center pt-1">
        Already have an account?{' '}
        <Link href="/signin" className="text-violet-400 hover:text-violet-300 transition-colors">
          Sign in →
        </Link>
      </p>
    </form>
  );
}
