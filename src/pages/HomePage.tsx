import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  Compass,
  MapPin,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import { PropertyCard } from '../components/PropertyCard';
import { TEN_STAGE_WORKFLOW } from '../types/lst';

export const HomePage: React.FC = () => {
  const {
    publishedProperties,
    showSampleListings,
    setShowSampleListings,
    submitBuyerEnquiry,
    firebaseUser,
    userProfile,
  } = useLST();

  const [enquiryName, setEnquiryName] = useState(userProfile?.fullName || '');
  const [enquiryEmail, setEnquiryEmail] = useState(userProfile?.email || '');
  const [enquiryPhone, setEnquiryPhone] = useState(userProfile?.phone || '');
  const [enquiryCity, setEnquiryCity] = useState(userProfile?.city || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryConsent, setEnquiryConsent] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const featuredProperties = publishedProperties.slice(0, 6);

  const handleQuickEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);
    setEnquirySuccess(null);

    if (!enquiryName.trim() || !enquiryEmail.trim() || !enquiryPhone.trim()) {
      setEnquiryError('Please provide your full name, email address, and mobile number.');
      return;
    }
    if (!enquiryConsent) {
      setEnquiryError('Please accept the privacy consent to submit your enquiry.');
      return;
    }
    if (!firebaseUser) {
      setEnquiryError('Please sign in first so your enquiry can be linked to your Buyer Dashboard.');
      return;
    }

    const targetProperty = publishedProperties[0];
    if (!targetProperty) {
      setEnquiryError('No active listing selected. Please browse available lands or enable sample listings.');
      return;
    }

    setEnquirySubmitting(true);
    try {
      const res = await submitBuyerEnquiry({
        property: targetProperty,
        buyerName: enquiryName,
        buyerEmail: enquiryEmail,
        buyerPhone: enquiryPhone,
        buyerCity: enquiryCity,
        enquiryType: 'Request Callback',
        message: enquiryMessage || 'General land buying & verification consultation enquiry.',
      });
      setEnquirySuccess(
        `Enquiry ${res.enquiryId} registered. An SLT Culture agent will contact you.`
      );
      setEnquiryMessage('');
    } catch (err: any) {
      setEnquiryError(err?.message || 'Failed to submit enquiry.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <div>
      {/* 1. Hero Section — Split 2-Column with Official SLT Culture Logo */}
      <section className="bg-[#124A32] text-white border-b border-[#D5AD51]/30">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2.5 sm:gap-3 bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg mb-5 sm:mb-6">
                  <img
                    src="/assets/aistudio/image_de4003f1.png"
                    alt="SLT Culture Official Logo"
                    className="h-7 sm:h-9 w-auto object-contain"
                  />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#17251D] border-l border-neutral-300 pl-2.5 sm:pl-3">
                    Land Screening & Transforming (LST)
                  </span>
                </div>

                <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-[52px] font-semibold tracking-tight leading-[1.14] text-white">
                  Transforming Land into Opportunities.
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-white/85 mt-4 sm:mt-5 max-w-2xl leading-relaxed">
                  Discover, verify, buy, and sell land with confidence through SLT Culture. Your Land. Our Responsibility. A Better Future.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#D5AD51] text-[#17251D] text-sm font-semibold hover:bg-[#e1bd67] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-h-[44px]"
                  >
                    <span>Explore Lands</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/sell"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-white/40 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center min-h-[44px]"
                  >
                    List Your Land
                  </Link>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-xs">
                <div className="bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <div className="font-mono-tabular text-lg sm:text-xl font-bold text-[#D5AD51]">10-Stage</div>
                  <div className="text-white/80 mt-0.5">Physical & Document Screening</div>
                </div>
                <div className="bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <div className="font-mono-tabular text-lg sm:text-xl font-bold text-[#82B440]">100%</div>
                  <div className="text-white/80 mt-0.5">Admin Reviewed Before Publish</div>
                </div>
                <div className="bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <div className="font-mono-tabular text-lg sm:text-xl font-bold text-white">₹ INR</div>
                  <div className="text-white/80 mt-0.5">Transparent Direct Valuation</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full rounded-xl overflow-hidden border border-white/20 bg-[#17251D] flex flex-col justify-between">
                <img
                  src="/assets/land-hero.svg"
                  alt="SLT Culture Land Screening Survey Illustration"
                  className="w-full h-52 sm:h-64 lg:h-full object-cover"
                />
                <div className="p-4 sm:p-5 bg-[#17251D] border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-[#D5AD51] font-mono-tabular">
                    <span>HUMAN-IN-THE-LOOP VERIFICATION</span>
                    <span>STAGES 01 – 10</span>
                  </div>
                  <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                    Every land parcel submitted to SLT Culture undergoes physical boundary inspection, road access verification, document review, and administrative approval before appearing on our public marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Verified Properties */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
              Verified Marketplace
            </p>
            <h2 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
              Featured Screened Land Parcels
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSampleListings(!showSampleListings)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-[#17251D] hover:bg-neutral-50 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#124A32]" />
              <span>{showSampleListings ? 'Hide Sample Test Data' : 'Show Sample Test Data'}</span>
            </button>
            <Link
              to="/browse"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors"
            >
              <span>Browse All Properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {featuredProperties.length === 0 ? (
          <div className="mt-8 p-12 rounded-xl border border-neutral-200 bg-[#F7F9F7] text-center">
            <h3 className="font-serif-display text-xl font-semibold text-[#17251D]">
              No Published Land Listings Yet
            </h3>
            <p className="text-xs text-neutral-600 mt-2 max-w-md mx-auto">
              Only administrator-approved properties appear publicly. You can submit a new property as a seller or toggle Sample Test Listings above to explore the buyer workflow.
            </p>
            <div className="flex justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowSampleListings(true)}
                className="px-4 py-2 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold"
              >
                Enable Sample Listings
              </button>
              <Link
                to="/sell"
                className="px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
              >
                Register Your Land
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Buy Land / Sell Land Feature Cards (Aligned with Uploaded Flowchart) */}
      <section className="bg-[#F7F9F7] border-y border-neutral-200 py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
              Structured Workflows
            </p>
            <h2 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
              Dedicated Journeys for Landowners & Buyers
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              Designed directly around SLT Culture's verified Seller and Buyer operational flowchart.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
            {/* Seller Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                  01. FOR LANDOWNERS (SELLER WORKFLOW)
                </div>
                <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#17251D] mt-2">
                  Screen, Verify, and List Your Land Securely
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Submit your personal and land survey details, upload private ownership records into our restricted vault, and schedule an SLT field agent visit.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-[#17251D]">
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 1: Login / Signup & Select Seller Profile</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 2: Enter Personal Details, Survey No., Area & Expected Price (₹)</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 3: Upload Protected Ownership Deeds, EC & Soil Reports</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 4: Agent On-Site Verification → Admin Approval → Public Listing</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">
                  Private documents never exposed publicly
                </span>
                <Link
                  to="/sell"
                  className="px-5 py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors text-center min-h-[40px] flex items-center justify-center"
                >
                  Register Land to Sell
                </Link>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                  02. FOR LAND BUYERS & INVESTORS (BUYER WORKFLOW)
                </div>
                <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#17251D] mt-2">
                  Acquire Screened Land with Guided Site Visits
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  Filter verified agricultural, residential, commercial, and industrial lands by district, price, and area. Compare parcels side-by-side and book an agent-accompanied visit.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-[#17251D]">
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 1: Browse Approved Lands with Screening & Soil Summaries</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 2: Select Property, Compare Metrics & Save Favourites</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 3: Register Interest or Request Site Visit with Personal Details</span>
                  </li>
                  <li className="flex items-start sm:items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#82B440] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Step 4: Dedicated SLT Agent Approaches You & Coordinates Registration</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">
                  Real-time enquiry tracking in Buyer Dashboard
                </span>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold hover:bg-[#e1bd67] transition-colors text-center min-h-[40px] flex items-center justify-center"
                >
                  Browse Verified Land
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How Our 10-Stage Land Screening Process Works */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
              Verification & Registration Assistance
            </p>
            <h2 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
              The 10-Stage SLT Culture Screening Protocol
            </h2>
          </div>
          <Link
            to="/how-it-works"
            className="text-xs font-semibold text-[#124A32] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Flowchart & Process Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {TEN_STAGE_WORKFLOW.map((item) => (
            <div
              key={item.stage}
              className="p-5 rounded-xl border border-neutral-200 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="font-mono-tabular text-xs font-bold text-[#124A32]">
                  {String(item.stage).padStart(2, '0')}. STAGE
                </div>
                <h3 className="font-serif-display text-base font-semibold text-[#17251D] mt-2">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Choose SLT Culture + Contact & Consultation Form */}
      <section className="bg-[#F7F9F7] border-t border-neutral-200 py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
                  Why Choose SLT Culture
                </p>
                <h2 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
                  Built for Land Transaction Security & Transparency
                </h2>
                <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                  Unverified plots and fragmented middlemen create risk for both landowners and buyers. SLT Culture acts as your structured screening and coordination partner.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-white border border-neutral-200 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#124A32] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#17251D]">
                      Strict Document Privacy & Role Isolation
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Sale deeds, encumbrance certificates, and revenue records are stored in a protected vault accessible only to the landowner and authorized SLT verification staff.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-neutral-200 flex items-start gap-4">
                  <Compass className="w-6 h-6 text-[#124A32] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#17251D]">
                      On-Ground Field Agent Verification
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Every listing is assigned to an authorized SLT field agent who inspects physical boundaries, approach road width, water sources, electricity access, and soil conditions.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-neutral-200 flex items-start gap-4">
                  <FileCheck2 className="w-6 h-6 text-[#124A32] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#17251D]">
                      End-to-End Sub-Registrar Coordination Support
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      From buyer site visits to document checklist readiness and registration slot coordination, track every milestone live in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation & Callback Form */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-7">
                <h3 className="font-serif-display text-2xl font-semibold text-[#17251D]">
                  Request an SLT Agent Callback
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Have questions about buying verified land or screening your property? Submit your details below.
                </p>

                {enquiryError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {enquiryError}
                  </div>
                )}
                {enquirySuccess && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    {enquirySuccess}
                  </div>
                )}

                <form onSubmit={handleQuickEnquiry} className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#17251D] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#17251D] mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#17251D] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={enquiryEmail}
                        onChange={(e) => setEnquiryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#17251D] mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        value={enquiryCity}
                        onChange={(e) => setEnquiryCity(e.target.value)}
                        placeholder="e.g. Visakhapatnam, Hyderabad"
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#17251D] mb-1">
                      Requirement Details
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Tell us whether you are looking to buy verified land or register your property for screening..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryConsent}
                      onChange={(e) => setEnquiryConsent(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-300 text-[#124A32] focus:ring-[#124A32]"
                    />
                    <span>
                      I consent to SLT Culture storing my contact details to coordinate land verification and agent callbacks in accordance with the{' '}
                      <Link to="/privacy" className="text-[#124A32] underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="w-full py-3 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
                  >
                    {enquirySubmitting ? 'Submitting Request...' : 'Request SLT Agent Callback'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
