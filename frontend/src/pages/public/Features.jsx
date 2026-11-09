import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  PenTool,
  Users,
  Lightbulb,
  CalendarDays,
  Send,
  BarChart3,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function Features() {
  const detailedFeatures = [
    {
      icon: PenTool,
      title: 'AI Content Generator',
      subtitle: 'Create high-converting copy in seconds',
      description:
        'Leverage state-of-the-art AI models to automatically draft blog posts, Instagram captions, Facebook ad copy, LinkedIn thought leadership articles, and email marketing newsletters tailored to your brand voice.',
      benefits: [
        'Multi-platform format optimization',
        'Custom brand tone & voice setting',
        'One-click regeneration & polishing',
        'Instant copy export and scheduling'
      ]
    },
    {
      icon: Users,
      title: 'Competitor Analysis',
      subtitle: 'Outsmart rivals with deep intelligence',
      description:
        'Track competitor domains, content output, social channels, and top-performing campaigns. Discover what works in your niche and identify content gaps your business can capitalize on.',
      benefits: [
        'Automated competitor tracking',
        'Performance & engagement benchmarking',
        'Content strategy reverse-engineering',
        'Real-time competitive alerts'
      ]
    },
    {
      icon: Lightbulb,
      title: 'AI Marketing Recommendations',
      subtitle: 'Data-driven insights to grow faster',
      description:
        'GrowVix AI continuously analyzes your business metrics and competitor activity to deliver personalized recommendations, content ideas, and high-impact marketing tasks.',
      benefits: [
        'Personalized growth roadmap',
        'Optimal posting time suggestions',
        'Actionable task management',
        'Continuous performance tuning'
      ]
    },
    {
      icon: CalendarDays,
      title: 'Content Calendar',
      subtitle: 'Seamless campaign orchestration',
      description:
        'Organize your entire content pipeline in a powerful visual calendar. Plan campaigns weeks in advance, review drafts, and maintain absolute consistency across all marketing channels.',
      benefits: [
        'Visual monthly & weekly views',
        'Draft review & status tracking',
        'Campaign grouping',
        'Drag-and-drop scheduling'
      ]
    },
    {
      icon: Send,
      title: 'Social Media Publishing',
      subtitle: 'Direct multi-platform scheduling',
      description:
        'Connect your Facebook, Instagram, and LinkedIn accounts securely. Publish content immediately or schedule posts ahead of time with automated background publishing.',
      benefits: [
        'Secure OAuth social integrations',
        'Automated background scheduler',
        'Cross-platform publishing',
        'Media preview & tagging'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics and Insights',
      subtitle: 'Measure impact and maximize ROI',
      description:
        'Track reach, engagement rates, follower growth, and campaign effectiveness with comprehensive visual charts and intelligent performance metrics.',
      benefits: [
        'Real-time engagement tracking',
        'Visual growth charts',
        'ROI & conversion estimation',
        'Exportable performance reports'
      ]
    },
    {
      icon: Building2,
      title: 'Business Management',
      subtitle: 'Unified brand & profile control',
      description:
        'Manage multiple business profiles, set target audiences, configure industry parameters, and keep all marketing data securely organized in one place.',
      benefits: [
        'Multi-profile support',
        'Brand guideline settings',
        'Audience demographic profiling',
        'Secure data storage'
      ]
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white via-violet-50/30 to-slate-50 py-16 lg:py-24 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Platform Features
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Maximum Marketing Impact
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Explore the powerful tools designed to automate your content creation, competitor research, and social publishing.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
          {detailedFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-1 space-y-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lift">
                    <Icon size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-600">{feat.subtitle}</span>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{feat.title}</h3>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed">{feat.description}</p>
                  <div className="space-y-3 pt-2">
                    {feat.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-violet-600 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="rounded-2xl border border-app-border bg-white p-6 sm:p-8 shadow-lift relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold uppercase text-slate-400">Module Preview</span>
                        <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 flex items-center gap-1">
                          <Sparkles size={12} /> GrowVix AI
                        </span>
                      </div>
                      <div className="h-44 rounded-xl bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50/50 flex flex-col items-center justify-center p-6 text-center border border-slate-100">
                        <Icon size={40} className="text-violet-600 mb-3" />
                        <h4 className="font-bold text-slate-900 text-base">{feat.title} in Action</h4>
                        <p className="text-xs text-slate-500 mt-1">Automated workflows ready in your dashboard.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-white text-center border-t border-app-border">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <h3 className="text-3xl font-bold text-slate-900">Ready to experience GrowVix firsthand?</h3>
          <p className="text-slate-600">Join businesses growing faster with AI marketing automation.</p>
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
