import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, Shield, Zap, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white via-violet-50/30 to-slate-50 py-16 lg:py-24 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> About GrowVix
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Empowering Every Business with Intelligent Marketing
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are building the future of AI-powered marketing management, helping brands scale their online presence effortlessly.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Our Mission</span>
              <h3 className="text-3xl font-bold text-slate-900">Democratizing Advanced Marketing Technology</h3>
              <p className="text-slate-600 leading-relaxed">
                Small business owners, freelancers, and growing agencies shouldn't have to spend dozens of hours a week wrestling with disjointed tools or guessing what content works. GrowVix combines cutting-edge AI content generation, competitor intelligence, and automated scheduling into a single seamless platform.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-2xl border border-app-border bg-white p-6 shadow-soft">
                  <p className="text-3xl font-extrabold text-violet-600">10x</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Content Speed</p>
                </div>
                <div className="rounded-2xl border border-app-border bg-white p-6 shadow-soft">
                  <p className="text-3xl font-extrabold text-violet-600">99.9%</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Platform Uptime</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-app-border bg-white p-8 shadow-lift space-y-6">
              <h4 className="text-xl font-bold text-slate-900">Core Principles</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600 shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Relentless Innovation</h5>
                    <p className="text-xs text-slate-600 mt-0.5">Integrating state-of-the-art AI models to keep your marketing ahead of the curve.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600 shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Enterprise Security</h5>
                    <p className="text-xs text-slate-600 mt-0.5">Your brand assets, business data, and social tokens are protected with top-grade encryption.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600 shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">User-Centric Design</h5>
                    <p className="text-xs text-slate-600 mt-0.5">Clean, intuitive interfaces designed for speed and absolute ease of use.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center border-t border-app-border">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <h3 className="text-3xl font-bold text-slate-900">Join us on our journey</h3>
          <p className="text-slate-600">Start transforming your business marketing with GrowVix today.</p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="gradient-brand inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lift transition hover:opacity-95"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
