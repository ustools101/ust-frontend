import { Metadata } from 'next';
import SignupForm from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up | Ultimate Social Tools',
  description: 'Create your UST account and get started for free.',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fadeUp">
        <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl p-8">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <span className="text-2xl font-bold text-violet-400 tracking-tight">UST</span>
            <h1 className="text-xl font-semibold text-white mt-3">Create your account</h1>
            <p className="text-zinc-500 text-sm mt-1">Start for free, no credit card required</p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
