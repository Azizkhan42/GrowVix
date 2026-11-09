import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Lightbulb,
  PenTool,
  CalendarDays,
  Send,
  BarChart3,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Star,
  Building2
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: PenTool,
      title: 'AI Content Generation',
      description: 'Generate high-converting blog posts, social media captions, ad copy, and email campaigns in seconds using advanced AI.',
    },
    {
      icon: Users,
      title: 'Competitor Analysis',
      description: 'Track competitor marketing strategies, social channels, and top performing posts to discover gaps and opportunities.',
    },
    {
      icon: Lightbulb,
      title: 'AI Marketing Recommendations',
      description: 'Receive personalized, data-driven recommendations and actionable insights to optimize your marketing campaigns.',
    },
    {
      icon: CalendarDays,
      title: 'Content Calendar',
      description: 'Plan, organize, and visualize your entire publishing schedule across multiple platforms in one centralized calendar.',
    },
    {
      icon: Send,
      title: 'Social Media Publishing',
      description: 'Connect Facebook, Instagram, and LinkedIn accounts to publish content instantly or schedule posts for peak engagement times.',
    },
    {
      icon: BarChart3,
      title: 'Marketing Performance Analytics',
      description: 'Measure reach, engagement, follower growth, and ROI with intuitive visual charts and comprehensive performance metrics.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create Your Business Profile',
      desc: 'Set up your brand guidelines, target audience, industry, and marketing goals in under 2 minutes.',
    },
    {
      num: '02',
      title: 'Analyze Your Competitors',
      desc: 'Input competitor domains and social profiles to benchmark performance and uncover winning strategies.',
    },
    {
      num: '03',
      title: 'Generate AI Recommendations',
      desc: 'Let GrowVix AI analyze your data and deliver tailored content ideas, strategies, and optimization tasks.',
    },
    {
      num: '04',
      title: 'Publish, Schedule & Track',
      desc: 'Create AI posts, schedule campaigns across social channels, and monitor real-time performance analytics.',
    },
  ];

  const faqs = [
    {
      q: 'What is GrowVix?',
      a: 'GrowVix is an all-in-one, AI-powered marketing management platform designed to help businesses, agencies, and marketers automate content creation, analyze competitors, schedule social posts, and track performance.',
    },
    {
      q: 'How does AI content generation work?',
      a: 'GrowVix utilizes advanced AI models trained on marketing best practices. By providing your topic, tone, and platform, the AI instantly generates professional copy, captions, and articles tailored to your brand.',
    },
    {
      q: 'Can I analyze competitors?',
      a: 'Yes! You can track competitor websites, social metrics, and content strategies to understand what is working in your niche and find untapped opportunities.',
    },
    {
      q: 'Can I connect Facebook, Instagram, and LinkedIn?',
      a: 'Yes, GrowVix integrates directly with supported social media platforms so you can schedule and publish content directly from your dashboard.',
    },
    {
      q: 'Can I schedule social media posts?',
      a: 'Absolutely. You can schedule posts ahead of time with our visual content calendar and automated background scheduler.',
    },
    {
      q: 'Is GrowVix free to get started?',
      a: 'Yes, we offer a Free plan with core business profile setup and limited AI features so you can explore the platform before upgrading to Professional or Business plans.',
    },
    {
      q: 'How can I manage my business marketing?',
      a: 'GrowVix centralizes your strategy, competitor insights, content creation, and publishing into a single intuitive dashboard, eliminating the need for dozens of disjointed tools.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-white via-violet-50/30 to-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-gradient-to-tr from-violet-200/40 to-indigo-200/30 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold tracking-wide uppercase animate-rise">
              <Sparkles size={14} />
              AI-Powered Marketing Management Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your Entire Marketing Strategy,{' '}
              <span className="gradient-brand-text">Powered by AI.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Discover competitors, generate engaging content, plan campaigns, publish across social platforms, and measure your marketing performance — all from one intelligent platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="gradient-brand w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lift transition hover:opacity-95"
              >
                <span>Start Free</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-soft transition hover:bg-slate-50 hover:text-slate-900"
              >
                Explore Features
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-violet-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-violet-600" /> Setup in 2 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-violet-600" /> Full AI Suite
              </span>
            </div>
          </div>

          {/* Dashboard Preview mockup */}
          <div className="mt-12 lg:mt-16 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs font-medium text-slate-400">app.growvix.com/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                    <Sparkles size={12} /> AI Active
                  </span>
                </div>
              </div>

              {/* Simulated dashboard UI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Marketing Health Score</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-slate-900">88/100</span>
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">+12% this week</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Generated AI Posts</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-slate-900">42</span>
                    <span className="text-xs font-semibold text-violet-600">8 Platforms</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Ready for automated scheduling</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Competitors Tracked</p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold text-slate-900">6 Rivals</span>
                    <span className="text-xs font-semibold text-blue-600">Live Monitoring</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Analysis updated 2h ago</p>
                </div>
              </div>

              {/* Simulated chart / recommendations area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-700">Engagement & Reach Performance</p>
                    <span className="text-[11px] text-slate-500">Last 30 Days</span>
                  </div>
                  <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
                    {[35, 45, 60, 50, 75, 85, 70, 90, 80, 95, 85, 100].map((val, idx) => (
                      <div key={idx} className="w-full bg-violet-100 hover:bg-violet-200 rounded-t-md transition-all relative group" style={{ height: `${val}%` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                          Val: {val}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-violet-600" /> AI Recommendations
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="rounded-lg bg-white p-2.5 border border-slate-100 text-[11px] text-slate-600">
                      💡 Publish LinkedIn post on Tuesday at 10 AM for 34% higher engagement.
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-slate-100 text-[11px] text-slate-600">
                      🚀 Competitor X launched a new video campaign. Analyze script structure.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Integrations */}
      <section className="border-y border-app-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Integrated with your favorite marketing channels & platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-75 font-semibold text-slate-700 text-sm sm:text-base">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-600" /> Facebook Marketing</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-pink-500" /> Instagram Graph API</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-700" /> LinkedIn Professional</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600" /> AI Content Engine</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-600" /> MongoDB Atlas</span>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600">Powerful Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything You Need to Dominate Your Marketing
            </h3>
            <p className="text-slate-600 text-base sm:text-lg">
              Designed for modern businesses and marketing teams to scale growth effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-app-border bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift group"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                    <Icon size={28} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-600 mb-4">{feature.description}</p>
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition group-hover:underline"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How GrowVix Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600">Simple 4-Step Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">How GrowVix Works</h3>
            <p className="text-slate-600">Get up and running in minutes with our streamlined onboarding process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative rounded-2xl border border-slate-100 bg-slate-50/70 p-6 shadow-soft">
                <span className="text-3xl font-black text-violet-600/30 block mb-4">{step.num}</span>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Why Choose GrowVix</span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Built to Save You Time and Multiply Your Marketing ROI.
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Stop juggling 10 different tools for content creation, scheduling, analytics, and competitor research. GrowVix brings everything into one unified, AI-accelerated workspace.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  'Save 15+ hours every week on content creation & campaign management',
                  'Gain deep competitive intelligence to outrank competitors',
                  'Publish consistently across Facebook, Instagram, and LinkedIn',
                  'Make data-backed decisions with automated marketing analytics',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="gradient-brand inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  <span>Get Started Now</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">AI Marketing Engine</h5>
                    <p className="text-xs text-slate-400">Real-time optimization active</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Content Generation Speed</span>
                    <span className="text-violet-400 font-semibold">10x Faster</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Competitor Insight Accuracy</span>
                    <span className="text-indigo-400 font-semibold">98.4%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                “GrowVix transformed how our agency handles client campaigns. We produce double the content in half the time.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600">Transparent Pricing</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Plans for Every Stage of Growth</h3>
            <p className="text-slate-600">Choose the perfect plan to elevate your marketing strategy.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="rounded-2xl border border-app-border bg-white p-8 shadow-soft flex flex-col justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Free</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-sm text-slate-500">/ forever</span>
                </div>
                <p className="text-sm text-slate-600 mb-6">Essential tools to get started with AI marketing and business profiles.</p>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Basic business profile</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Limited AI content generation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Basic competitor analysis</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Basic marketing calendar</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="rounded-2xl border-2 border-violet-600 bg-white p-8 shadow-lift flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full gradient-brand px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">Professional</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">$49</span>
                  <span className="text-sm text-slate-500">/ month</span>
                </div>
                <p className="text-sm text-slate-600 mb-6">Advanced AI capabilities and social publishing for growing businesses.</p>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Increased AI content generation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Advanced competitor analysis</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> AI marketing recommendations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Social media scheduling & publishing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Marketing analytics & insights</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="gradient-brand w-full rounded-xl py-3 text-center text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
              >
                Start Professional Trial
              </Link>
            </div>

            {/* Business Plan */}
            <div className="rounded-2xl border border-app-border bg-white p-8 shadow-soft flex flex-col justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Business</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">$129</span>
                  <span className="text-sm text-slate-500">/ month</span>
                </div>
                <p className="text-sm text-slate-600 mb-6">Multi-business profiles and team collaboration for agencies and enterprises.</p>
                <ul className="space-y-3 text-sm text-slate-600 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Multiple business profiles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Advanced marketing insights</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Team collaboration tools</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Higher usage limits & priority API</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-violet-600" /> Advanced reporting</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Choose Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600">Got Questions?</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden transition">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-6 text-left font-semibold text-slate-900 focus:outline-none"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <span className="rounded-full bg-white p-1 text-slate-500 shadow-sm border border-slate-200 shrink-0 ml-4">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-rise">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Make Marketing Smarter?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Start managing your business marketing with GrowVix today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-violet-700 shadow-xl transition hover:bg-violet-50"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
