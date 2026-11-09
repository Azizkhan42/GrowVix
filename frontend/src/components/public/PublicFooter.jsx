import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { Sparkles, Twitter, Linkedin, Facebook, Instagram, Github } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-app-border bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block focus:outline-none rounded-lg">
              <Logo size={36} />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              GrowVix is your AI-powered marketing management platform. Discover competitors, generate high-converting content, schedule social campaigns, and track performance effortlessly.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-900">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-violet-600 transition">
                  AI Content Generation
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-violet-600 transition">
                  Competitor Analysis
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-violet-600 transition">
                  Marketing Calendar
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-violet-600 transition">
                  Social Publishing
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-violet-600 transition">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-900">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-violet-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-violet-600 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-violet-600 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-violet-600 transition">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-900">Legal & Privacy</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-violet-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-violet-600 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} GrowVix Inc. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-6 text-xs text-slate-500 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-violet-600 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-violet-600 transition">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-violet-600 transition">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
