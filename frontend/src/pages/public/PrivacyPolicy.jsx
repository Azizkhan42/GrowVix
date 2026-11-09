export default function PrivacyPolicy() {
  return (
    <div className="py-16 lg:py-24 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-2xl border border-app-border shadow-soft space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
            <p>
              Welcome to GrowVix ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered marketing management platform and website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p>
              We collect information you provide directly when registering for an account, creating business profiles, generating AI content, or contacting support. This includes your name, email address, password hash, business details, and connected social media authentication tokens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. How We Use Your Information</h2>
            <p>
              We use collected information to operate, maintain, and provide the GrowVix platform features, process AI content generation requests, manage social media publishing, analyze performance metrics, and communicate with you regarding updates or support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Data Security</h2>
            <p>
              We implement robust security measures, including encryption in transit and at rest, secure JWT authentication, and strict access controls to safeguard your business and personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us at privacy@growvix.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
