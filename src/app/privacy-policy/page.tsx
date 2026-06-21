import { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { pageMetadata } from "@/seo";

export const metadata: Metadata = pageMetadata.privacyPolicy;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[var(--ch-sage-light)]/10 py-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Link */}
        <div className="mb-8 flex justify-end">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--ch-sage-dark)] hover:text-[var(--ch-sage-dark)]/80 transition-colors text-sm"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[var(--ch-sage-dark)] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: January 19, 2026
        </p>

        <div className="space-y-10">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              1. Introduction & Overview
            </h2>
            <div className="space-y-3 pl-4 border-l-4 border-[var(--ch-sage-light)]">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">CalmHive</span> is
                a mental clarity and mindful productivity platform designed to
                help you manage your daily tasks, reflect through journaling,
                and gain gentle insights into your productivity patterns.
              </p>
              <p className="text-gray-700">
                This Privacy Policy explains how we collect, use, store, and
                protect your personal and wellness information when you use
                CalmHive (the &quot;Service&quot;).
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  Effective Date:
                </span>{" "}
                January 19, 2026. Changes to this policy will be notified via
                email or displayed on this page.
              </p>
            </div>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              2. Information We Collect
            </h2>

            <div className="space-y-6">
              {/* 2a. Personal Information */}
              <div className="pl-4 border-l-4 border-[var(--ch-sage-light)]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  a) Personal Information (You Provide)
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Full Name:
                      </span>{" "}
                      For account identification and personalization
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Email Address:
                      </span>{" "}
                      For account login, password reset, and communication
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Password:
                      </span>{" "}
                      Securely hashed and never stored in plain text
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Phone Number (Optional):
                      </span>{" "}
                      For optional two-factor authentication
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        OAuth Data (Google Login):
                      </span>{" "}
                      Email, name, and profile picture from Google account
                    </span>
                  </li>
                </ul>
              </div>

              {/* 2b. Usage & Analytics Data */}
              <div className="pl-4 border-l-4 border-[var(--ch-sage-light)]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  b) Usage & Analytics Data (Automatic)
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Pages & Features:
                      </span>{" "}
                      Which sections you visit (dashboard, plans, insights,
                      journal)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Device Information:
                      </span>{" "}
                      Device type, browser, operating system
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        IP Address:
                      </span>{" "}
                      General location data (city/region level, not precise)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Session Activity:
                      </span>{" "}
                      Time spent, clicks, interactions for improving UX
                    </span>
                  </li>
                </ul>
              </div>

              {/* 2c. Wellness & Reflection Data */}
              <div className="pl-4 border-l-4 border-[var(--ch-sage-light)]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  c) Wellness & Reflection Data (Core to CalmHive)
                </h3>
                <p className="text-gray-700 mb-3 text-sm italic">
                  This data is sensitive and treated with highest care:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Onboarding Responses:
                      </span>{" "}
                      Your answers about work style, goals, and preferences
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Weekly Plans & Tasks:
                      </span>{" "}
                      Tasks created, completed, skipped, and partial completions
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Journal Entries & Reflections:
                      </span>{" "}
                      Your written thoughts and reflections
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Personal Notes:
                      </span>{" "}
                      Custom annotations on tasks and plans
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium text-gray-900">
                        Aggregated Signals (Not Raw Text):
                      </span>{" "}
                      Only emotional tone and recurring themes are extracted
                      from journals, never raw quotes
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              3. How We Use Your Information
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)]">
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Account Management:
                    </span>{" "}
                    Create, manage, and authenticate your account
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      AI Personalization:
                    </span>{" "}
                    Generate personalized weekly plans, insights, and
                    recommendations
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Support & Communication:
                    </span>{" "}
                    Respond to support requests and send service updates
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Analytics & Improvements:
                    </span>{" "}
                    Analyze usage patterns to improve features and UX
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Security & Fraud Prevention:
                    </span>{" "}
                    Detect and prevent unauthorized access
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Security & Fraud Prevention:
                    </span>{" "}
                    Detect and prevent unauthorized access
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Cookies & Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              4. Cookies & Tracking Technologies
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive uses{" "}
                <span className="font-semibold text-gray-900">
                  cookies and similar tracking technologies
                </span>{" "}
                to:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Keep you logged in (session cookies)
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 pt-2">
                <span className="font-semibold text-gray-900">
                  You can control cookies
                </span>{" "}
                via your browser settings. Disabling cookies may affect
                functionality.
              </p>
            </div>
          </section>

          {/* 5. How We Share Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              5. How We Share Your Information
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-4">
              <div>
                <p className="text-gray-700 font-semibold text-lg mb-3">
                  {" "}
                  <span className="text-[var(--ch-sage-dark)]">
                    We do NOT sell your personal data
                  </span>
                </p>
              </div>

              <div>
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold text-gray-900">
                    We share information only with trusted partners
                  </span>{" "}
                  to provide the Service:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Authentication (Better Auth / Google):
                      </span>{" "}
                      Email verified through OAuth providers
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Email Services (Nodemailer):
                      </span>{" "}
                      Weekly insights, notifications, and account communications
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Database (NeonDB):
                      </span>{" "}
                      PostgreSQL-based cloud database for secure data storage
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Vector Embeddings (Pinecone):
                      </span>{" "}
                      AI-powered semantic search and recommendations
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Hosting (Vercel):
                      </span>{" "}
                      Application servers and infrastructure
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-700 text-sm pt-2">
                All third-party partners are bound by confidentiality agreements
                and only access data as needed.
              </p>
            </div>
          </section>

          {/* 6. Data Storage & Security */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              6. Data Storage & Security
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                We implement robust security measures to protect your
                information:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      HTTPS Encryption:
                    </span>{" "}
                    All data in transit is encrypted using TLS/SSL
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Database Security (NeonDB):
                    </span>{" "}
                    PostgreSQL with encryption at rest and secure backups
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Password Hashing:
                    </span>{" "}
                    Passwords are never stored in plain text
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Pinecone Vector Storage:
                    </span>{" "}
                    Embeddings are stored securely and isolated per user
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 text-sm  italic border-t border-gray-200 pt-4">
                {" "}
                <span className="font-semibold text-gray-900">
                  No method is 100% secure.
                </span>{" "}
                While we strive to protect your data, we cannot guarantee
                absolute security. Use strong passwords and keep your account
                credentials private.
              </p>
            </div>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              7. Data Retention
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Active Account:
                    </span>{" "}
                    Data retained while your account is active
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Account Deletion:
                    </span>{" "}
                    Your data is deleted upon request (some metadata retained
                    for compliance)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Backups:
                    </span>{" "}
                    We maintain backups for 30 days; after deletion requests,
                    old backups are purged
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Aggregated Analytics:
                    </span>{" "}
                    Anonymized usage data may be retained longer for product
                    improvement
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 8. Your Rights & Choices */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              8. Your Rights & Choices
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                You have full control over your data:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Access Your Data:
                    </span>{" "}
                    Request a copy of your personal information
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Update Information:
                    </span>{" "}
                    Edit your profile and preferences anytime
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Delete Account:
                    </span>{" "}
                    Request permanent account and data deletion (processed
                    within 30 days)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Email Preferences:
                    </span>{" "}
                    Opt-out of weekly insights emails anytime
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Withdraw Consent:
                    </span>{" "}
                    If applicable under GDPR or local laws
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 text-sm pt-3">
                To exercise these rights, contact{" "}
                <span className="font-semibold text-gray-900">
                  cleosneha@gmail.com
                </span>
              </p>
            </div>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              9. Children&#39;s Privacy
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive is{" "}
                <span className="font-semibold text-gray-900">
                  not intended for children under 13
                </span>{" "}
                (or 16 in some regions). We do not knowingly collect data from
                children under these ages.
              </p>
              <p className="text-gray-700">
                If we discover that a child under 13 has registered, we will
                promptly delete their account and data. Parents concerned about
                their child&#39;s data should contact{" "}
                <span className="font-semibold text-gray-900">
                  cleosneha@gmail.com
                </span>
                .
              </p>
            </div>
          </section>

          {/* 10. International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              10. International Users
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive is operated from India. If you access the Service from
                outside India, your data may be processed and stored
                internationally.
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  All data remains protected
                </span>{" "}
                under this Privacy Policy regardless of location. International
                users agree to this policy and data transfer practices.
              </p>
            </div>
          </section>

          {/* 11. Third-Party Links & Services */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              11. Third-Party Links & Services
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive may link to external websites, resources, or services
                (e.g., payment gateways, external articles, documentation).
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  Third-party services have their own privacy policies
                </span>{" "}
                and are not governed by this policy. We encourage you to review
                their policies before sharing information.
              </p>
            </div>
          </section>

          {/* 12. Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              12. Changes to This Privacy Policy
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                We may update this Privacy Policy periodically to reflect
                changes in our practices or legal requirements.
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  Significant changes
                </span>{" "}
                will be communicated via email or a prominent notice on this
                page. Your continued use of CalmHive after changes constitutes
                acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* 13. Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              13. Contact Us
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-4">
              <p className="text-gray-700">
                If you have questions about this Privacy Policy or your data,
                please reach out:
              </p>
              <div className="bg-[var(--ch-sage-light)]/10 p-4 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900"> Email:</span>{" "}
                  <a
                    href="mailto:cleosneha@gmail.com"
                    className="text-[var(--ch-sage-dark)] hover:underline"
                  >
                    cleosneha@gmail.com
                  </a>
                </p>
              </div>
              <p className="text-sm text-gray-600">
                We will respond to privacy inquiries within 7–10 business days.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section className="mt-12 pt-8 border-t border-gray-300">
            <p className="text-gray-700 text-center text-sm">
              Thank you for trusting CalmHive with your wellness journey. Your
              privacy is our priority.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
