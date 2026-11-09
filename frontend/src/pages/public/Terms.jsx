export default function Terms() {
  return (
    <div className="py-16 lg:py-24 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-2xl border border-app-border shadow-soft space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Terms and Conditions</h1>
          <p className="text-xs text-slate-500">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Agreement to Terms</h2>
            <p>
              By accessing or using GrowVix, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. User Accounts & Registration</h2>
            <p>
              To access platform features, you must register for an account. You agree to provide accurate information and keep your account credentials secure. You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. AI Content & Usage</h2>
            <p>
              GrowVix provides AI-generated content tools. You acknowledge that AI output may require human review and editing. You retain ownership of your generated content subject to platform usage limits and policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Subscription & Billing</h2>
            <p>
              Paid plans are billed in advance on a monthly or annual basis. Subscriptions automatically renew unless cancelled prior to the renewal date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Contact Information</h2>
            <p>
              For inquiries regarding these Terms, please contact us at legal@growvix.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
