"use client"

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLayout, FiZap, FiBarChart2, FiShield, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (session?.user) router.push('/dashboard');
  }, [session, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-white/[0.06]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-violet-400 tracking-tight">UST</span>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-150 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 sm:pt-40 sm:pb-28">
        {/* Radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        </div>
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center animate-fadeUp">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <FiShield className="w-3.5 h-3.5" />
            Security Research Platform
          </div>

          <h1 className="text-[2.25rem] leading-[1.12] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-5">
            The Professional{' '}
            <span className="text-violet-400">Social Engineering</span>{' '}
            Toolkit
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed px-2">
            Create, deploy, and analyze social engineering simulations across major platforms.
            Built for security researchers and red teams.
          </p>

          {/* Primary CTA first, full-width on mobile */}
          <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-7 py-3.5 sm:py-3 rounded-lg font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20 text-base sm:text-sm"
            >
              Get Started Free <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white px-7 py-3 rounded-lg font-medium transition-all duration-150 text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stat bar */}
      <div className="border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Active researchers' },
            { value: '500K+',   label: 'Simulations run' },
            { value: '3',       label: 'Supported platforms' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Professional-grade tools for authorized security assessments and red team operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: FiLayout,
                title: 'Platform Templates',
                desc: 'Pre-built, high-fidelity templates for Instagram, Facebook, TikTok and more. Fully customizable to your assessment needs.',
              },
              {
                icon: FiZap,
                title: 'Instant Deployment',
                desc: 'Generate and deploy simulation links in seconds. Real-time Telegram notifications on every target interaction.',
              },
              {
                icon: FiBarChart2,
                title: 'Analytics & Reporting',
                desc: 'Track click rates, credential submissions, and geographic data. Export detailed reports for your security assessments.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-zinc-900 border border-white/[0.06] hover:border-violet-500/30 hover:bg-zinc-800/80 rounded-xl p-6 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-zinc-500">Up and running in minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Create an account',
                desc: 'Sign up and connect your Telegram for instant real-time notifications on every interaction.',
              },
              {
                step: '02',
                title: 'Build your simulation',
                desc: 'Choose a platform template or build a custom multi-step form from scratch using our page builder.',
              },
              {
                step: '03',
                title: 'Analyze results',
                desc: 'Share your link and monitor interactions live from your dashboard with full geolocation data.',
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="text-violet-500 font-bold text-xs tracking-widest mb-3">{s.step}</div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-zinc-900 border border-white/[0.06] rounded-2xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-zinc-500 mb-8">
              Join thousands of security researchers using UST for authorized assessments.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20"
            >
              Create a free account <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-violet-400 font-bold text-sm">UST</span>
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} Ultimate Social Tools. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
