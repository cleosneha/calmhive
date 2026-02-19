import { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { pageMetadata } from "@/seo";

export const metadata: Metadata = pageMetadata.termsOfService;

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: January 19, 2026
        </p>

        <div className="space-y-10">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              1. Acceptance of Terms
            </h2>
            <div className="space-y-3 pl-4 border-l-4 border-[var(--ch-sage-light)]">
              <p className="text-gray-700">
                By accessing and using CalmHive (the &quot;Service&quot;), you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  Your acceptance is automatic upon first use.
                </span>{" "}
                If you do not agree to these terms, you may not use CalmHive. We
                reserve the right to modify these Terms at any time, and your
                continued use constitutes acceptance of updates.
              </p>
            </div>
          </section>

          {/* 2. Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              2. Eligibility
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive is available only to individuals who are{" "}
                <span className="font-semibold text-gray-900">
                  at least 13 years old
                </span>{" "}
                (or 16 in some jurisdictions).
              </p>
              <p className="text-gray-700">
                By creating an account, you represent and warrant that:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    You meet the minimum age requirement
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    You have the legal right to enter into this agreement
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    All information provided is accurate and truthful
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Account Responsibility */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              3. Account Responsibility
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality and
                security of your account credentials.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Keep Your Password Safe:
                    </span>{" "}
                    Never share your password or allow others access to your
                    account
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Provide Accurate Information:
                    </span>{" "}
                    Ensure your profile details are truthful and current
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Notify Us of Unauthorized Access:
                    </span>{" "}
                    Contact support immediately if you suspect account misuse
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Accept Full Responsibility:
                    </span>{" "}
                    You are liable for all activities under your account
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Permitted Use */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              4. Permitted Use
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                CalmHive is intended solely for{" "}
                <span className="font-semibold text-gray-900">
                  personal wellness, mindfulness, and productivity tracking
                  purposes.
                </span>
              </p>
              <p className="text-gray-700">You may:</p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Create and manage your own tasks, plans, and journal entries
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    View your personal insights and productivity trends
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Receive AI-generated suggestions and weekly insights
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Export or delete your personal data upon request
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Prohibited Use */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              5. Prohibited Use
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                You agree NOT to use CalmHive for any of the following:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Illegal Activities:
                    </span>{" "}
                    Violating laws or engaging in criminal behavior
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Hacking & Unauthorized Access:
                    </span>{" "}
                    Attempting to breach security or access systems
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Spamming & Harassment:
                    </span>{" "}
                    Sending unsolicited messages or abusive content
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Web Scraping & Bots:
                    </span>{" "}
                    Automated data extraction or bot activity
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Misuse of AI Features:
                    </span>{" "}
                    Using generated content for illegal or harmful purposes
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Abuse & Harassment:
                    </span>{" "}
                    Threatening, harassing, or attacking other users or staff
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Impersonation:
                    </span>{" "}
                    Posing as another person or entity
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 pt-3 text-sm">
                Violation of these prohibitions may result in account suspension
                or termination.
              </p>
            </div>
          </section>

          {/* 6. User Content */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              6. User Content & Ownership
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  You retain full ownership
                </span>{" "}
                of all journal entries, tasks, notes, and personal data you
                create on CalmHive.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Your Ownership:
                    </span>{" "}
                    All content remains your intellectual property
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Our Limited Rights:
                    </span>{" "}
                    We have the right to host, process, and analyze your content
                    only to provide and improve the Service
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      No Sharing:
                    </span>{" "}
                    We will never share, sell, or publicly display your personal
                    content
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">
                      Aggregated Data:
                    </span>{" "}
                    We may use anonymized, aggregated insights for product
                    improvement
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 7. Wellness Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              7. Wellness Disclaimer
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className=" font-semibold text-lg mb-3 text-red-700">
                Important: CalmHive is NOT a medical or mental health treatment
                service.
              </p>
              <p className="text-gray-700">
                CalmHive provides{" "}
                <span className="font-semibold text-gray-900">
                  wellness tracking and productivity insights only.
                </span>{" "}
                The Service does NOT:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Provide medical, psychological, or therapeutic advice
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Diagnose or treat mental health conditions
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Replace professional medical consultation
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 pt-3">
                <span className="font-semibold text-gray-900">
                  In case of emergency or crisis,
                </span>{" "}
                please contact your local emergency services or a qualified
                mental health professional immediately. Resources like crisis
                hotlines are available 24/7.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              8. Termination & Account Deletion
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  User-Initiated Termination:
                </span>{" "}
                You may delete your account anytime through your account
                settings. Upon deletion, your personal data will be removed
                within 30 days.
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">
                  CalmHive-Initiated Termination:
                </span>{" "}
                We may suspend or terminate your account if you:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Violate these Terms of Service
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Engage in prohibited activities (hacking, spamming, abuse)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">
                    Violate applicable laws or regulations
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 pt-3">
                <span className="font-semibold text-gray-900">
                  Immediate Action:
                </span>{" "}
                We reserve the right to suspend access without notice in cases
                of serious violations.
              </p>
            </div>
          </section>

          {/* 9. Limitation of Liability & Changes */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              9. Limitation of Liability & Service Changes
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  As-Is Service
                </h3>
                <p className="text-gray-700">
                  CalmHive is provided{" "}
                  <span className="font-semibold text-gray-900">
                    &quot;AS IS&quot;
                  </span>{" "}
                  without warranties of any kind. We do not guarantee:
                </p>
                <ul className="space-y-2 mt-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Uninterrupted service availability
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Specific results or outcomes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Absence of errors or bugs
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Limitation of Liability
                </h3>
                <p className="text-gray-700">
                  To the fullest extent permitted by law, CalmHive is not liable
                  for:
                </p>
                <ul className="space-y-2 mt-2">
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Indirect, incidental, or consequential damages
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Data loss or service interruptions
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--ch-sage-light)] opacity-60 mt-1">
                      •
                    </span>
                    <span className="text-gray-700">
                      Third-party actions or external factors
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Changes to Terms & Service
                </h3>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms and the Service at
                  any time.{" "}
                  <span className="font-semibold text-gray-900">
                    Significant changes
                  </span>{" "}
                  will be communicated via email or posted here. Your continued
                  use after changes constitutes acceptance.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--ch-sage-dark)] mb-4">
              10. Contact Us
            </h2>
            <div className="pl-4 border-l-4 border-[var(--ch-sage-light)] space-y-4">
              <p className="text-gray-700">
                If you have questions about these Terms of Service or need to
                report violations, please contact us:
              </p>
              <div className="bg-[var(--ch-sage-light)]/10 p-4 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  <a
                    href="mailto:celersneha@gmail.com"
                    className="text-[var(--ch-sage-dark)] hover:underline"
                  >
                    celersneha@gmail.com
                  </a>
                </p>
              </div>
              <p className="text-sm text-gray-600">
                We will respond to inquiries within 7–10 business days.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section className="mt-12 pt-8 border-t border-gray-300">
            <p className="text-gray-700 text-center text-sm">
              Thank you for using CalmHive. By using our service, you help
              create a supportive wellness community.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
