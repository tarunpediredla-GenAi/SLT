import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { TEN_STAGE_WORKFLOW } from '../types/lst';
import { useLST } from '../context/LSTContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-3 bg-[#F7F9F7] border border-neutral-200 px-3.5 py-2 rounded-lg mb-5">
            <img
              src="/assets/aistudio/image_de4003f1.png"
              alt="SLT Culture Official Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs font-semibold text-[#124A32]">
              SLT Culture – Land Screening and Transforming (LST)
            </span>
          </div>
          <h1 className="font-serif-display text-4xl font-semibold text-[#17251D]">
            Your Land. Our Responsibility. A Better Future.
          </h1>
          <p className="text-sm text-neutral-700 mt-4 leading-relaxed">
            SLT Culture operates the Land Screening and Transforming (LST) platform to solve the biggest challenge in Indian land transactions: trust and verifiable ground reality. We bridge landowners who want a dignified, transparent sale with buyers seeking screened, dispute-free agricultural, residential, commercial, and industrial properties.
          </p>
          <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
            Unlike open classified portals where anyone can post unverified claims, SLT Culture interposes a structured 10-stage human verification workflow—combining document review, physical boundary inspection by assigned field agents, optional soil testing, and Sub-Registrar coordination assistance.
          </p>
        </div>

        <div className="lg:col-span-5 bg-[#124A32] text-white rounded-xl p-8 space-y-5">
          <h3 className="font-serif-display text-2xl font-semibold text-[#D5AD51]">
            Our Three Core Business Pillars
          </h3>
          <div className="space-y-4 text-xs">
            <div className="pb-4 border-b border-white/15">
              <div className="font-semibold text-sm text-white">
                01. Land Buying & Selling Marketplace
              </div>
              <p className="text-white/80 mt-1 leading-relaxed">
                Curated, administrator-approved land listings with transparent pricing in Indian Rupees (₹), survey locality details, and side-by-side comparison tools.
              </p>
            </div>
            <div className="pb-4 border-b border-white/15">
              <div className="font-semibold text-sm text-white">
                02. Land Verification, Testing & Registration Assistance
              </div>
              <p className="text-white/80 mt-1 leading-relaxed">
                Document screening (Sale Deed, EC, Patta/Tax records), physical boundary verification, soil quality testing, and sub-registrar preparation tracking.
              </p>
            </div>
            <div>
              <div className="font-semibold text-sm text-white">
                03. Field Agent Coordination & Land Management
              </div>
              <p className="text-white/80 mt-1 leading-relaxed">
                Dedicated SLT field agents assigned to inspect properties on-site and accompany prospective buyers during scheduled visits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14 space-y-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
          Operational Architecture
        </p>
        <h1 className="font-serif-display text-4xl font-semibold text-[#17251D] mt-1">
          How SLT Culture – Land Screening & Transforming Works
        </h1>
        <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
          Below is our official Buyer and Seller workflow flowchart alongside our 10-stage screening and registration coordination lifecycle.
        </p>
      </div>

      {/* Embedded Official Uploaded Flowchart Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#F7F9F7] border border-neutral-200 rounded-xl p-6 sm:p-8">
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl p-4">
          <img
            src="/assets/aistudio/image_fdd9555b.png"
            alt="SLT Culture Official Buyer and Seller Workflow Flowchart"
            className="w-full h-auto rounded-lg object-contain"
          />
          <p className="text-[11px] text-center text-neutral-500 mt-2 font-mono-tabular">
            Official SLT Culture Buyer & Seller Workflow Reference
          </p>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-serif-display text-xl font-semibold text-[#124A32]">
              Seller Journey (Left Branch of Flowchart)
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Start → Login / Signup → Select Seller → Enter Personal Details → Enter Land Details → Review & Register Land → Request Agent Visit → Admin Screening → Agent Assignment → Land Verification → Approval → Publish Listing.
            </p>
            <div className="mt-4">
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
              >
                <span>Start Seller Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-serif-display text-xl font-semibold text-[#124A32]">
              Buyer Journey (Right Branch of Flowchart)
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Start → Login / Signup → Select Buyer → Browse Available Land → View Land Details & Prices → Select Property → Enter Personal Details → Register Interest → Agent Contact ("An SLT Culture agent will contact you") → Schedule Site Visit → Track Enquiry.
            </p>
            <div className="mt-4">
              <Link
                to="/browse"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold"
              >
                <span>Start Browsing Verified Land</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Stage Detailed Breakdown */}
      <div>
        <h2 className="font-serif-display text-2xl font-semibold text-[#17251D] mb-6">
          10-Stage Land Screening & Registration Management Lifecycle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {TEN_STAGE_WORKFLOW.map((step) => (
            <div
              key={step.stage}
              className="p-5 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="font-mono-tabular text-xs font-bold text-[#124A32]">
                  STAGE {String(step.stage).padStart(2, '0')}
                </div>
                <h4 className="font-serif-display text-base font-semibold text-[#17251D] mt-1.5">
                  {step.title}
                </h4>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactUsPage: React.FC = () => {
  const { publishedProperties, submitBuyerEnquiry, firebaseUser, userProfile } = useLST();
  const [name, setName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!consent) {
      setFeedback({ type: 'err', text: 'Please check the privacy consent box.' });
      return;
    }
    if (!firebaseUser) {
      setFeedback({
        type: 'err',
        text: 'Please sign in first so we can log your enquiry and assign an SLT agent to your dashboard.',
      });
      return;
    }
    const targetProp = publishedProperties[0];
    if (!targetProp) {
      setFeedback({ type: 'err', text: 'Please enable sample listings or select a property.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitBuyerEnquiry({
        property: targetProp,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        buyerCity: city,
        enquiryType: 'Request Callback',
        message: message || 'Contact Us page consultation request.',
      });
      setFeedback({
        type: 'ok',
        text: `Thank you! Reference ${res.enquiryId} created. An SLT Culture agent will contact you.`,
      });
      setMessage('');
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <img
            src="/assets/aistudio/image_de4003f1.png"
            alt="SLT Culture Logo"
            className="h-12 w-auto object-contain"
          />
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D]">
            Contact SLT Culture Support & Coordination Desk
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Whether you are a landowner preparing documents for screening or a buyer scheduling a site inspection, our coordination team is here to assist.
          </p>

          <div className="space-y-4 text-xs text-[#17251D]">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F9F7] border border-neutral-200">
              <MapPin className="w-4 h-4 text-[#124A32] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">SLT Culture – LST Operations</div>
                <div className="text-neutral-600 mt-0.5">
                  Andhra Pradesh · Telangana · Karnataka Regional Screening Hubs
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F9F7] border border-neutral-200">
              <Mail className="w-4 h-4 text-[#124A32] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Verification & Support Desk</div>
                <div className="text-neutral-600 mt-0.5">support@sltculture.in</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
              Send an Enquiry
            </h2>
            {feedback && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs border ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {feedback.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">How can we help you? *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300"
                />
              </div>
              <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300"
                />
                <span>
                  I consent to SLT Culture storing my details to respond to my land enquiry.
                </span>
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-6 text-xs leading-relaxed text-[#17251D]">
    <h1 className="font-serif-display text-3xl font-semibold">Privacy Policy</h1>
    <p className="text-neutral-500">Effective Date: November 2026 · SLT Culture – Land Screening and Transforming (LST)</p>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        1. Personal Data & Property Document Protection
      </h2>
      <p>
        SLT Culture collects user profile information (name, email, phone number, address) and property verification records (survey numbers, ownership deeds, sale deeds, encumbrance certificates, and land tax records) strictly for land screening, agent site inspections, and buyer-seller coordination.
      </p>
    </section>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        2. Restricted Document Vault & Access Control
      </h2>
      <p>
        Uploaded ownership documents and seller private contact details are isolated by strict database and server access controls. Buyers cannot view sellers' private contact information or title deeds unless an administrator explicitly authorizes appropriate sharing during verified transaction coordination.
      </p>
    </section>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        3. Google Maps Platform & Location Services
      </h2>
      <p>
        This platform integrates Google Maps features to display land parcel pins. Use of Google Maps features is subject to the Google Maps End User Additional Terms of Service (https://maps.google.com/help/terms_maps/) and the Google Privacy Policy (https://policies.google.com/privacy).
      </p>
    </section>
  </div>
);

export const TermsConditionsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-6 text-xs leading-relaxed text-[#17251D]">
    <h1 className="font-serif-display text-3xl font-semibold">Terms and Conditions</h1>
    <p className="text-neutral-500">Effective Date: November 2026 · SLT Culture – Land Screening and Transforming (LST)</p>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        1. Scope of Screening & Registration Assistance
      </h2>
      <p>
        SLT Culture conducts physical land inspections, soil/screening report preparation, and registration coordination assistance. Registration assistance is a tracking and coordination service and does not constitute automatic government land registration or a sovereign legal title guarantee. Human legal and revenue professionals must verify final title, encumbrances, and statutory registrations before the Sub-Registrar.
      </p>
    </section>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        2. Seller Representations & Admin Approval
      </h2>
      <p>
        Sellers warrant that submitted survey numbers, boundary descriptions, and ownership documents are accurate. Unverified land is never automatically published; SLT Culture administrators reserve the right to approve, reject, or flag any listing.
      </p>
    </section>
    <section className="space-y-2">
      <h2 className="font-serif-display text-lg font-semibold text-[#124A32]">
        3. No Automated Online Land Purchase Payments
      </h2>
      <p>
        SLT Culture manages enquiries, site visits, and registration coordination without collecting automated online property purchase payments on the website.
      </p>
    </section>
  </div>
);
