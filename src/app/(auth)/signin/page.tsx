import { Metadata } from 'next';
import SigninForm from './signin-form';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Signin | Ultimate Social Tools',
  description: 'Access your ethical hacking toolkit for social media.',
};

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-secondary-900 relative overflow-hidden">
      {/* Matrix-like background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#86C23233,transparent_2px)] bg-[size:4px_100%] z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent,#86C23215)] z-0"></div>

      {/* Diagonal decorative lines */}
      <div className="absolute -top-40 -right-40 w-96 h-96 border-l-2 border-primary-500/20 rotate-45 transform"></div>
      <div className="absolute top-1/2 -left-20 w-40 h-40 border-t-2 border-primary-500/20 rotate-12 transform"></div>

      <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-secondary-800/50 backdrop-blur-sm border border-primary-500/20 p-8">
          {/* Terminal-style header */}
          <div className="flex items-center gap-2 mb-8 font-mono text-primary-400">
            <span className="w-3 h-3 rounded-full bg-primary-500"></span>
            <span className="w-3 h-3 rounded-full bg-primary-500/50"></span>
            <span className="w-3 h-3 rounded-full bg-primary-500/30"></span>
            <span className="ml-2">[root@ultimatesocial] # ./signin.sh</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-8">Access Terminal</h2>
          
          <Suspense fallback={
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <SigninForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
