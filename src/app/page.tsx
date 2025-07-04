"use client"

import Link from 'next/link';
import { FiLock, FiBarChart, FiLayout } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  if(session?.user){
    router.push('/dashboard');
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
                Best Phishing
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-600">
                Link Generator
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Generate convincing phishing links for social media platforms with our advanced tools
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link 
                href="/signin"
                className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <Link 
                href="/signup"
                className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center space-x-2"
              >
                <span>Sign Up</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Our Features
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group p-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 border border-gray-700/50">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400">
                <FiLayout className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300 transition-colors">
                Customizable Templates
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                Ready-to-use templates for popular social platforms including Instagram, Facebook, TikTok, and more.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group p-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 border border-gray-700/50">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400">
                <FiLock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                Advanced Link Generation
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                Create sophisticated phishing links with our state-of-the-art generation engine and URL masking.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group p-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 border border-gray-700/50">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-400">
                <FiBarChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Analytics Dashboard
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                Track your campaign performance with detailed analytics and real-time statistics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
