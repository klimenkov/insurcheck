import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rate Checker</span>
        </button>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-slate-300 space-y-8 text-sm leading-relaxed">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Privacy Policy</h1>
              <p className="text-xs text-slate-400 mt-0.5">Last updated: September 23, 2026</p>
            </div>
          </div>
          <p className="mt-4 text-slate-300">
            InsurCheck ("InsurCheck", "we", "us", or "our") respects your privacy and is committed to handling your personal information responsibly.
          </p>
          <p className="mt-2 text-slate-400">
            This Privacy Policy explains what information we collect when you use the InsurCheck website and services, why we collect it, how we use it, when we may share it, and the choices available to you. By using InsurCheck, you acknowledge the practices described in this Privacy Policy.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">1.</span> Who We Are
          </h2>
          <p>
            InsurCheck is an independent insurance information and benchmarking platform designed to help Ontario drivers understand insurance pricing.
          </p>
          <p className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-300 font-medium">
            InsurCheck is <strong className="text-white">not an insurance company, insurance broker, or financial advisor</strong>. We are not affiliated with FSRA, the Government of Ontario, or any insurance provider unless explicitly stated.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">2.</span> Information We Collect
          </h2>
          <p>Depending on how you use InsurCheck, we may collect information such as:</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300">
              Information you provide
            </h3>
            <p className="text-xs text-slate-400">
              When using our insurance calculators, submitting a benchmark, requesting information, or providing feedback, you may provide:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Postal code or Forward Sortation Area (FSA)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Driver age</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Driving experience</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>At-fault incidents or claims information</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Vehicle year, make, and model</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Number of drivers or vehicles</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Current insurance company</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Current insurance premium</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Coverage information</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Deductible information</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Estimated or actual insurance pricing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Answers to feedback questions</span>
              </li>
              <li className="flex items-center gap-2 sm:col-span-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Comments or other information you voluntarily submit</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300">
              If you contact us or request a broker referral
            </h3>
            <p className="text-xs text-slate-400">We may also collect:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Message or other information you choose to provide</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300">
              Information collected automatically
            </h3>
            <p className="text-xs text-slate-400">
              When you browse our website, we may automatically collect limited technical information such as browser type, operating system, pages visited, referral sources, and IP address for security and analytics purposes.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">3.</span> How We Use Your Information
          </h2>
          <p>We may use information collected through InsurCheck to:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2">
            <li>Provide insurance estimates and benchmarks</li>
            <li>Calculate estimated fair-market insurance prices</li>
            <li>Compare your information with relevant community or market data</li>
            <li>Improve our calculators and pricing models</li>
            <li>Improve the accuracy of our benchmarks</li>
            <li>Analyze insurance pricing trends</li>
            <li>Improve the website and user experience</li>
            <li>Respond to questions and support requests</li>
            <li>Detect fraud, abuse, or misuse</li>
            <li>Maintain the security of the Service</li>
            <li>Communicate with you when you have requested or agreed to be contacted</li>
            <li>Provide or facilitate insurance quote or broker referral services where available</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>
          <p className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
            If you voluntarily provide your phone number, it may be used to contact you regarding insurance quotes, broker referrals, services, or information you have requested. We will not use personal information for a new purpose that is incompatible with the purpose for which it was collected without appropriate consent, where consent is required.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">4.</span> Community Insurance Data
          </h2>
          <p>
            One of the purposes of InsurCheck is to build a better understanding of real-world insurance pricing. If you voluntarily choose to share your insurance information with us, we may use that information to improve our community pricing data and benchmarks.
          </p>
          <p>
            Where appropriate, we aggregate or anonymize information so that published statistics and benchmarks do not identify individual users. For example, we may use submitted information to calculate statistics such as:
          </p>
          <blockquote className="p-3 bg-slate-950/80 border-l-2 border-emerald-400 text-xs text-slate-300 italic rounded-r-xl">
            Average insurance premium for similar vehicles and drivers in a particular area.
          </blockquote>
          <p className="text-xs text-slate-400">
            We do not publicly display your name, email address, phone number, or other information that directly identifies you as part of a community pricing submission. We may use information submitted by users to improve our models, analytics, products, and services.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">5.</span> Sharing Your Information
          </h2>
          <p className="font-semibold text-white">
            We do not sell your personal information simply because you use our calculator.
          </p>
          <p>
            We may share information with service providers that help us operate InsurCheck, such as providers of website hosting, database and cloud services, analytics, security, email and communications, customer support, data processing, and other technical infrastructure. These service providers process information on our behalf and are expected to handle it appropriately.
          </p>

          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300">
              Insurance brokers and providers
            </h3>
            <p>
              If InsurCheck offers a quote or broker referral service and you choose to request contact or quotes, we may share the information necessary to provide that service with the relevant broker, insurer, or insurance service provider.
            </p>
            <p className="text-xs text-slate-400">
              This may include your name, phone number, email address, postal code, vehicle information, and other information necessary to obtain or discuss an insurance quote. You are not required to request a broker or insurance quote simply to use the InsurCheck calculator.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-300">
              Legal requirements
            </h3>
            <p className="text-xs text-slate-400">
              We may disclose information where required or permitted by law, including where necessary to comply with legal obligations, respond to lawful requests, protect our rights or property, investigate fraud or security incidents, or protect users or the public from harm.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">6.</span> Anonymous and Aggregated Information
          </h2>
          <p>
            We may create aggregated, statistical, or anonymized information from information collected through the Service (e.g. average insurance premiums, typical pricing ranges, regional pricing trends, vehicle comparisons).
          </p>
          <p className="text-xs text-slate-400">
            Where information has been properly anonymized or aggregated so that it cannot reasonably be used to identify an individual, it may be used for research, analysis, product development, and other legitimate business purposes.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">7.</span> Cookies and Analytics
          </h2>
          <p>
            InsurCheck may use cookies and similar technologies to keep the website functioning, remember preferences, understand how visitors use the website, measure performance, and detect security issues. Where required, we provide appropriate information and choices regarding non-essential cookies.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">8.</span> Third-Party Websites and Services
          </h2>
          <p>
            InsurCheck may contain links to third-party websites. Once you leave InsurCheck and visit a third-party website, that website's own privacy policy and terms apply. We are not responsible for the privacy practices of third-party websites.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">9.</span> Data Retention
          </h2>
          <p>
            We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, to operate the Service, maintain records, resolve disputes, or comply with legal obligations. When no longer required, we securely delete, destroy, or anonymize it.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">10.</span> Security
          </h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. However, no internet transmission is ever 100% secure.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">11.</span> Your Privacy Rights
          </h2>
          <p>
            Depending on applicable law, you may have the right to ask what personal information we hold about you, request access, request correction of inaccurate or incomplete information, ask how your information is used, or withdraw consent.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">12.</span> Withdrawing Consent
          </h2>
          <p>
            Where we rely on your consent to collect, use, or disclose personal information, you may withdraw that consent subject to legal or contractual restrictions and reasonable notice.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">13.</span> Accuracy of Information
          </h2>
          <p>
            We take reasonable steps to keep personal information accurate and up to date. If you believe that information we hold about you is incorrect or incomplete, you may contact us and request a correction.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">14.</span> Children's Privacy
          </h2>
          <p>
            InsurCheck is intended for adults and is not directed toward children. We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">15.</span> Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we make changes, we will update the "Last updated" date at the top of this page.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400">16.</span> Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, want to access or correct your personal information, or have a privacy concern, please contact us through the Contact Us page on our website.
          </p>
        </section>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          <p className="font-semibold text-slate-400">
            InsurCheck is an independent insurance information and benchmarking platform. We are not affiliated with FSRA, the Government of Ontario, or any insurance provider unless explicitly stated.
          </p>
        </div>
      </div>
    </div>
  );
}
