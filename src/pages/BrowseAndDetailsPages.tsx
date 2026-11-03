import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Heart,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  PhoneCall,
  ArrowLeft,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import {
  INDIAN_STATES,
  LandCategory,
  formatInr,
  formatExactInr,
  BuyerEnquiry,
} from '../types/lst';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyMap } from '../components/PropertyMap';
import { ScreeningTimeline } from '../components/ScreeningTimeline';

export const BrowseLandPage: React.FC = () => {
  const {
    publishedProperties,
    showSampleListings,
    setShowSampleListings,
  } = useLST();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPriceLakhs, setMinPriceLakhs] = useState<string>('');
  const [maxPriceLakhs, setMaxPriceLakhs] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'area_desc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const navigate = useNavigate();

  const filteredProperties = useMemo(() => {
    return publishedProperties
      .filter((p) => {
        if (selectedState !== 'All' && p.state !== selectedState) return false;
        if (
          districtFilter.trim() &&
          !`${p.district} ${p.village} ${p.mandal || ''}`
            .toLowerCase()
            .includes(districtFilter.trim().toLowerCase())
        ) {
          return false;
        }
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (minPriceLakhs !== '' && p.priceInr < Number(minPriceLakhs) * 100_000) return false;
        if (maxPriceLakhs !== '' && p.priceInr > Number(maxPriceLakhs) * 100_000) return false;
        if (minArea !== '' && p.area < Number(minArea)) return false;
        if (maxArea !== '' && p.area > Number(maxArea)) return false;
        if (verificationFilter === 'Stage7Plus' && p.screeningStage < 7) return false;
        if (verificationFilter === 'SoilTested' && !p.testingStatus) return false;
        if (
          searchQuery.trim() &&
          !`${p.title} ${p.referenceId} ${p.village} ${p.district} ${p.surveyNumber}`
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.priceInr - b.priceInr;
        if (sortBy === 'price_desc') return b.priceInr - a.priceInr;
        if (sortBy === 'area_desc') return b.area - a.area;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
  }, [
    publishedProperties,
    selectedState,
    districtFilter,
    selectedCategory,
    minPriceLakhs,
    maxPriceLakhs,
    minArea,
    maxArea,
    verificationFilter,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('All');
    setDistrictFilter('');
    setSelectedCategory('All');
    setMinPriceLakhs('');
    setMaxPriceLakhs('');
    setMinArea('');
    setMaxArea('');
    setVerificationFilter('All');
    setSortBy('newest');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            Buyer Discovery Portal
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#17251D] mt-1">
            Browse Screened & Approved Land Parcels
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Filter verified lands by state, district, category, price in Indian Rupees (₹), and area.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSampleListings(!showSampleListings)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-[#17251D] hover:bg-neutral-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#124A32]" />
            <span>{showSampleListings ? 'Sample Listings: ON' : 'Sample Listings: OFF'}</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#17251D] shadow-sm'
                  : 'text-neutral-600 hover:text-[#17251D]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-[#17251D] shadow-sm'
                  : 'text-neutral-600 hover:text-[#17251D]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Criteria Filter Panel */}
      <div className="bg-[#F7F9F7] border border-neutral-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Keyword / Survey No.
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title, village, SY No., Ref ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
            >
              <option value="All">All States</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              District / Locality
            </label>
            <input
              type="text"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="e.g. Visakhapatnam, Rangareddy"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Land Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pt-2 border-t border-neutral-200/80">
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Min Price (₹ Lakhs)
            </label>
            <input
              type="number"
              min="0"
              value={minPriceLakhs}
              onChange={(e) => setMinPriceLakhs(e.target.value)}
              placeholder="e.g. 20"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Max Price (₹ Lakhs)
            </label>
            <input
              type="number"
              min="0"
              value={maxPriceLakhs}
              onChange={(e) => setMaxPriceLakhs(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Min Area
            </label>
            <input
              type="number"
              min="0"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Max Area
            </label>
            <input
              type="number"
              min="0"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Verification Status
            </label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
            >
              <option value="All">All Approved Lands</option>
              <option value="Stage7Plus">Stage 7+ (Admin Approved)</option>
              <option value="SoilTested">Soil / Field Tested</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High (₹)</option>
              <option value="price_desc">Price: High to Low (₹)</option>
              <option value="area_desc">Area: Largest First</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-neutral-600 font-mono-tabular">
            Showing <strong>{filteredProperties.length}</strong> verified land parcels
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#124A32] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <PropertyMap
            properties={filteredProperties}
            onSelectProperty={(p) => navigate(`/land/${p.id}`)}
            heightClass="h-[520px]"
          />
        </div>
      )}

      {/* Results Grid */}
      {filteredProperties.length === 0 ? (
        <div className="p-12 rounded-xl border border-neutral-200 bg-white text-center">
          <h3 className="font-serif-display text-xl font-semibold text-[#17251D]">
            No Matching Land Listings Found
          </h3>
          <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
            Try clearing your price or district filters, or enable Sample Test Listings to explore demonstration records.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
            {!showSampleListings && (
              <button
                type="button"
                onClick={() => setShowSampleListings(true)}
                className="px-4 py-2 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold"
              >
                Show Sample Test Listings
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LandDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    allProperties,
    savedProperties,
    toggleSaveProperty,
    compareIds,
    toggleCompareProperty,
    submitBuyerEnquiry,
    firebaseUser,
    userProfile,
  } = useLST();

  const property = allProperties.find((p) => p.id === id);

  const [enquiryType, setEnquiryType] =
    useState<BuyerEnquiry['enquiryType']>('Register Interest');
  const [buyerName, setBuyerName] = useState(userProfile?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(userProfile?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(userProfile?.phone || '');
  const [buyerCity, setBuyerCity] = useState(userProfile?.city || '');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
          Land Listing Not Found
        </h2>
        <p className="text-xs text-neutral-600 mt-2">
          This property may be awaiting administrator review or is not currently published.
        </p>
        <Link
          to="/browse"
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Land</span>
        </Link>
      </div>
    );
  }

  const isSaved = savedProperties.some((s) => s.propertyId === property.id);
  const isCompared = compareIds.includes(property.id);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firebaseUser) {
      setError('Please sign in or create a Buyer account first to register interest.');
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setError('Please enter your full name, email address, and mobile number.');
      return;
    }
    if (!privacyConsent) {
      setError('Please accept the privacy consent checkbox.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitBuyerEnquiry({
        property,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerCity,
        enquiryType,
        preferredVisitDate,
        message,
      });
      setSubmittedEnquiryId(res.enquiryId);
    } catch (err: any) {
      setError(err?.message || 'Could not submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#124A32] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verified Lands</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleCompareProperty(property.id)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
              isCompared
                ? 'border-[#D5AD51] bg-[#D5AD51] text-[#17251D] font-semibold'
                : 'border-neutral-300 text-[#17251D] hover:bg-neutral-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Added to Compare' : 'Compare Land'}</span>
          </button>

          {firebaseUser && (
            <button
              type="button"
              onClick={() => toggleSaveProperty(property.id)}
              className={`px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
                isSaved
                  ? 'border-[#124A32] bg-[#124A32] text-white'
                  : 'border-neutral-300 text-[#17251D] hover:bg-neutral-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in Favourites' : 'Save to Favourites'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Property Header & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="aspect-[16/9] bg-[#124A32] relative">
              <img
                src={
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : '/assets/land-agri.svg'
                }
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-mono-tabular font-semibold text-[#124A32]">
                  {property.referenceId}
                </span>
                <span>·</span>
                <span className="font-medium text-[#17251D]">{property.category} Land</span>
                <span>·</span>
                <span>Survey No. {property.surveyNumber}</span>
                {property.plotNumber && (
                  <>
                    <span>·</span>
                    <span>Plot {property.plotNumber}</span>
                  </>
                )}
                {property.isSample && (
                  <>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">Sample Test Record</span>
                  </>
                )}
              </div>

              <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#17251D]">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <MapPin className="w-4 h-4 text-[#124A32] shrink-0" />
                <span>
                  {property.village}, {property.mandal ? `${property.mandal}, ` : ''}
                  {property.district}, {property.state}
                </span>
              </div>

              {/* Price & Area Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F7F9F7] border border-neutral-200">
                <div>
                  <div className="text-[11px] text-neutral-500">Asking Price (₹)</div>
                  <div className="font-mono-tabular text-lg font-bold text-[#17251D] mt-0.5">
                    {formatInr(property.priceInr)}
                  </div>
                  <div className="font-mono-tabular text-[11px] text-neutral-500">
                    {formatExactInr(property.priceInr)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">Total Land Area</div>
                  <div className="font-mono-tabular text-lg font-bold text-[#124A32] mt-0.5">
                    {property.area} {property.areaUnit}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {property.isNegotiable ? 'Price Negotiable' : 'Fixed Valuation'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">Screening Status</div>
                  <div className="text-xs font-semibold text-[#17251D] mt-1">
                    {property.screeningStatus || property.status}
                  </div>
                  <div className="text-[11px] text-[#82B440] font-medium">
                    Stage {property.screeningStage} of 10
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-500">Testing Status</div>
                  <div className="text-xs font-semibold text-[#17251D] mt-1">
                    {property.testingStatus || 'Boundary & Access Verified'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                  Land Overview & Description
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 mt-2 leading-relaxed">
                  {property.description || 'Verified SLT Culture land parcel.'}
                </p>
              </div>

              {/* Public Screening & Testing Summary */}
              {property.publicScreeningSummary && (
                <div className="p-4 rounded-xl bg-[#124A32]/5 border border-[#124A32]/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#124A32]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SLT Culture Public Screening & Testing Summary</span>
                  </div>
                  <p className="text-xs text-[#17251D] mt-1.5 leading-relaxed">
                    {property.publicScreeningSummary}
                  </p>
                </div>
              )}

              {/* Facilities & Infrastructure Grid */}
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#17251D] mb-3">
                  Available Facilities & Site Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-neutral-200 flex justify-between">
                    <span className="text-neutral-500">Road Access</span>
                    <span className="font-semibold text-[#17251D]">
                      {property.roadAccess || 'Approach Road Verified'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg border border-neutral-200 flex justify-between">
                    <span className="text-neutral-500">Water Availability</span>
                    <span className="font-semibold text-[#17251D]">
                      {property.waterAvailability || 'Available'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg border border-neutral-200 flex justify-between">
                    <span className="text-neutral-500">Electricity Availability</span>
                    <span className="font-semibold text-[#17251D]">
                      {property.electricityAvailability || 'Available'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg border border-neutral-200 flex justify-between">
                    <span className="text-neutral-500">Current Land Use</span>
                    <span className="font-semibold text-[#17251D]">
                      {property.currentLandUse || property.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Privacy Notice */}
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                <strong className="text-[#17251D]">Seller Document & Contact Privacy:</strong> Private ownership deeds, encumbrance certificates, and landowner personal phone numbers are protected in the SLT Culture vault. Register your interest on the right so an assigned SLT agent can schedule your site visit and facilitate verified document inspection.
              </div>
            </div>
          </div>

          {/* Interactive Map Location */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Property Map & Survey Location Pin
            </h3>
            <PropertyMap selectedProperty={property} heightClass="h-[380px]" />
          </div>
        </div>

        {/* Right Column: Buyer Interest / Callback / Site Visit Registration (Follows Buyer Flowchart) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sticky top-24">
            <div className="pb-4 border-b border-neutral-200">
              <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                BUYER ENQUIRY & SITE VISIT
              </div>
              <h3 className="font-serif-display text-xl font-semibold text-[#17251D] mt-1">
                Connect with an SLT Culture Agent
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Select your preferred action below and enter your personal details.
              </p>
            </div>

            {submittedEnquiryId ? (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#124A32] mx-auto" />
                <div className="text-xs font-mono-tabular font-bold text-[#124A32]">
                  ENQUIRY ID: {submittedEnquiryId}
                </div>
                <h4 className="font-serif-display text-lg font-semibold text-[#17251D]">
                  An SLT Culture agent will contact you.
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your interest for <strong>{property.title}</strong> has been logged and our administration desk has been notified. Track live status updates in your Buyer Dashboard.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/buyer"
                    className="w-full py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold block"
                  >
                    Track Enquiry in Buyer Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmittedEnquiryId(null)}
                    className="text-xs text-[#124A32] hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="mt-5 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {error}
                  </div>
                )}

                {!firebaseUser && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    Please{' '}
                    <Link to="/login" className="font-semibold underline">
                      Sign In
                    </Link>{' '}
                    or{' '}
                    <Link to="/signup" className="font-semibold underline">
                      Sign Up
                    </Link>{' '}
                    to submit and track enquiries in your Buyer Dashboard.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#17251D] mb-1.5">
                    Select Buyer Action *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-lg">
                    {(
                      [
                        'Register Interest',
                        'Request Site Visit',
                        'Request Callback',
                      ] as BuyerEnquiry['enquiryType'][]
                    ).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEnquiryType(t)}
                        className={`py-2 px-2 rounded-md text-[11px] font-medium transition-colors ${
                          enquiryType === t
                            ? 'bg-[#124A32] text-white'
                            : 'text-neutral-700 hover:bg-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17251D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17251D] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#17251D] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#17251D] mb-1">
                      Your City
                    </label>
                    <input
                      type="text"
                      value={buyerCity}
                      onChange={(e) => setBuyerCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17251D] mb-1">
                    Preferred Site Visit Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={preferredVisitDate}
                    onChange={(e) => setPreferredVisitDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17251D] mb-1">
                    Notes for SLT Agent
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Questions about road access, soil report, or visit timing..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300"
                  />
                  <span>
                    I authorize an SLT Culture agent to contact me regarding {property.referenceId}.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registering Enquiry...' : `Submit: ${enquiryType}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 10-Stage Screening Timeline */}
      <ScreeningTimeline currentStage={property.screeningStage} status={property.status} />
    </div>
  );
};
