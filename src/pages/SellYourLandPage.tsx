import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Upload,
  FileText,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import {
  INDIAN_STATES,
  LandCategory,
  AreaUnit,
  PropertyDocument,
  formatInr,
} from '../types/lst';
import { PropertyMap } from '../components/PropertyMap';

interface PendingDocUpload {
  docType: PropertyDocument['docType'];
  label: string;
  file: File;
}

export const SellYourLandPage: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    updateUserProfileData,
    submitNewLand,
    uploadDocumentFile,
  } = useLST();

  // Step 1: Seller Personal Details
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [email, setEmail] = useState(userProfile?.email || firebaseUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [altPhone, setAltPhone] = useState(userProfile?.altPhone || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [sellerState, setSellerState] = useState(userProfile?.state || 'Andhra Pradesh');
  const [pinCode, setPinCode] = useState(userProfile?.pinCode || '');

  // Step 2: Land Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LandCategory>('Agricultural');
  const [landState, setLandState] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [area, setArea] = useState('2.5');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('Acres');
  const [priceInr, setPriceInr] = useState('8500000');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(17.6868);
  const [longitude, setLongitude] = useState<number>(83.2185);
  const [locationAddress, setLocationAddress] = useState('');
  const [roadAccess, setRoadAccess] = useState('30 ft Blacktop Approach Road');
  const [waterAvailability, setWaterAvailability] = useState('Borewell & Canal Access');
  const [electricityAvailability, setElectricityAvailability] = useState('3-Phase Power Connection');
  const [currentLandUse, setCurrentLandUse] = useState('Cultivated Agricultural Land');
  const [ownershipDetails, setOwnershipDetails] = useState('Single Patta / Clear Link Deed');

  // Step 3: Documents & Agent Visit Request
  const [selectedDocType, setSelectedDocType] =
    useState<PropertyDocument['docType']>('ownership');
  const [pendingFiles, setPendingFiles] = useState<PendingDocUpload[]>([]);
  const [requestVisitNow, setRequestVisitNow] = useState(true);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 1:00 PM)');
  const [visitNotes, setVisitNotes] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<{
    propertyId: string;
    referenceId: string;
  } | null>(null);

  const docTypeLabels: Record<PropertyDocument['docType'], string> = {
    ownership: 'Ownership Document / Patta',
    sale_deed: 'Registered Sale Deed',
    ec: 'Encumbrance Certificate (EC)',
    tax_record: 'Land Tax / Pahani / Adangal Record',
    survey: 'FMB / Survey Sketch Document',
    soil_report: 'Soil Testing & Screening Report (Optional)',
    land_photo: 'Site / Land Photograph',
  };

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError('Each uploaded file must be under 6 MB.');
      return;
    }
    setError(null);
    setPendingFiles((prev) => [
      ...prev,
      {
        docType: selectedDocType,
        label: docTypeLabels[selectedDocType],
        file,
      },
    ]);
    e.target.value = '';
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitLand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firebaseUser) {
      setError('Please sign in or create an account before registering your land.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pinCode.trim()) {
      setError('Please complete all required Seller Personal Details.');
      return;
    }
    if (
      !title.trim() ||
      !district.trim() ||
      !village.trim() ||
      !surveyNumber.trim() ||
      Number(area) <= 0 ||
      Number(priceInr) <= 0
    ) {
      setError('Please fill in all required Land Details (Title, District, Village, Survey No., Area, and Price).');
      return;
    }
    if (!privacyConsent) {
      setError('Please confirm the Seller Ownership & Privacy Consent checkbox.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update seller profile details in Firestore
      await updateUserProfileData({
        fullName,
        phone,
        altPhone,
        address,
        city,
        state: sellerState,
        pinCode,
        userType: userProfile?.userType === 'buyer' ? 'both' : userProfile?.userType || 'seller',
        privacyConsent: true,
      });

      // 2. Upload all attached documents to protected server endpoint
      const tempPropertyRef = `prop_${Date.now()}`;
      const uploadedDocs: Array<{
        docType: PropertyDocument['docType'];
        fileName: string;
        fileUrl: string;
        fileSize?: number;
        mimeType?: string;
      }> = [];
      const publicPhotoUrls: string[] = [];

      for (const item of pendingFiles) {
        const res = await uploadDocumentFile({
          file: item.file,
          propertyId: tempPropertyRef,
          docType: item.docType,
        });
        uploadedDocs.push({
          docType: item.docType,
          fileName: item.file.name,
          fileUrl: res.fileUrl,
          fileSize: res.fileSize,
          mimeType: res.mimeType,
        });
        if (item.docType === 'land_photo') {
          publicPhotoUrls.push(res.fileUrl);
        }
      }

      // 3. Submit land record, documents metadata, and optional agent visit request
      const result = await submitNewLand(
        {
          title,
          category,
          state: landState,
          district,
          mandal,
          village,
          surveyNumber,
          plotNumber,
          area: Number(area),
          areaUnit,
          priceInr: Number(priceInr),
          isNegotiable,
          description,
          latitude,
          longitude,
          locationAddress:
            locationAddress || `${village}, ${mandal ? `${mandal}, ` : ''}${district}, ${landState}`,
          roadAccess,
          waterAvailability,
          electricityAvailability,
          currentLandUse,
          ownershipDetails,
          images: publicPhotoUrls.length > 0 ? publicPhotoUrls : undefined,
        },
        uploadedDocs,
        requestVisitNow && preferredDate
          ? {
              preferredDate,
              preferredSlot,
              notes: visitNotes,
            }
          : undefined
      );

      setRegisteredResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to register land listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#82B440] mx-auto" />
          <div className="text-xs font-mono-tabular font-bold text-[#124A32] bg-[#124A32]/10 inline-block px-3.5 py-1.5 rounded-lg">
            REGISTRATION REFERENCE ID: {registeredResult.referenceId}
          </div>
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D]">
            Land Submitted for SLT Screening
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
            Your property listing has been saved permanently in Firestore with status{' '}
            <strong>Pending Review (Submitted)</strong>. Our administration team has been notified, and an authorized SLT Culture Field Agent will arrive to verify boundaries and documents before publication.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/seller"
              className="px-6 py-3 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors"
            >
              Open Seller Dashboard & Track Status
            </Link>
            <button
              type="button"
              onClick={() => {
                setRegisteredResult(null);
                setTitle('');
                setSurveyNumber('');
                setPendingFiles([]);
              }}
              className="px-5 py-3 rounded-lg border border-neutral-300 text-xs font-semibold text-[#17251D]"
            >
              Register Another Land Parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            Seller Land Registration Workflow
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#17251D] mt-1">
            Register Your Land for SLT Screening & Sale
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Personal Details → Land & Survey Details → Protected Document Vault → Request Agent Visit → Admin Approval
          </p>
        </div>
        <Link
          to="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#124A32] hover:underline"
        >
          <span>Go to Seller Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!firebaseUser && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-amber-950">
            <strong>Authentication Required:</strong> Please sign in or create an account so your land registration and sensitive ownership documents are securely bound to your Seller UID.
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Sign In / Sign Up
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitLand} className="space-y-8">
        {/* Section 1: Seller Personal Details */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <span className="text-xs font-mono-tabular font-semibold text-[#124A32]">
              STEP 01 OF 04
            </span>
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D] mt-0.5">
              Seller Personal & Contact Details
            </h2>
            <p className="text-xs text-neutral-500">
              Kept strictly confidential for SLT verification staff and assigned agents only.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Landowner full name"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Alternative Contact (Optional)
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="Secondary number"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Door No., Street, Area"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                City / Town *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#17251D] mb-1">
                  State *
                </label>
                <select
                  value={sellerState}
                  onChange={(e) => setSellerState(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#17251D] mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="530001"
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Land & Survey Specifications */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <span className="text-xs font-mono-tabular font-semibold text-[#124A32]">
              STEP 02 OF 04
            </span>
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D] mt-0.5">
              Land Parcel, Survey & Valuation Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3.2 Acre Red-Soil Agricultural Land near Highway"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Land Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LandCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                <option value="Agricultural">Agricultural</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">State *</label>
              <select
                value={landState}
                onChange={(e) => setLandState(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                District *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Visakhapatnam"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Mandal or Taluk
              </label>
              <input
                type="text"
                value={mandal}
                onChange={(e) => setMandal(e.target.value)}
                placeholder="e.g. Bheemunipatnam"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Village or Locality *
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Survey Number *
              </label>
              <input
                type="text"
                required
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="e.g. 142/2A"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Plot Number (if applicable)
              </label>
              <input
                type="text"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Land Area *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Area Unit *
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                <option value="Acres">Acres</option>
                <option value="Cents">Cents</option>
                <option value="Sq. Yards">Sq. Yards</option>
                <option value="Sq. Ft.">Sq. Ft.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Expected Price (₹ INR) *
              </label>
              <input
                type="number"
                min="10000"
                required
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
              />
              <span className="text-[11px] text-[#124A32] font-mono-tabular">
                {formatInr(Number(priceInr) || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Road Access
              </label>
              <input
                type="text"
                value={roadAccess}
                onChange={(e) => setRoadAccess(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Water Availability
              </label>
              <input
                type="text"
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Electricity Availability
              </label>
              <input
                type="text"
                value={electricityAvailability}
                onChange={(e) => setElectricityAvailability(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Price Negotiable?
              </label>
              <select
                value={isNegotiable ? 'yes' : 'no'}
                onChange={(e) => setIsNegotiable(e.target.value === 'yes')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                <option value="yes">Yes, Negotiable</option>
                <option value="no">No, Fixed Price</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Current Land Use
              </label>
              <input
                type="text"
                value={currentLandUse}
                onChange={(e) => setCurrentLandUse(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Ownership Details
              </label>
              <input
                type="text"
                value={ownershipDetails}
                onChange={(e) => setOwnershipDetails(e.target.value)}
                placeholder="Ancestral / Self-Acquired / Single Patta Holder"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Property Description & Highlights *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe topography, soil type, nearby highways, fencing, or plantation details..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
            />
          </div>

          {/* Interactive Location Pin Picker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#17251D]">
                Google Maps Location Pin (Click map or enter coordinates)
              </label>
              <span className="text-xs font-mono-tabular text-[#124A32]">
                {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
              </span>
            </div>
            <PropertyMap
              interactivePicker
              lat={latitude}
              lng={longitude}
              onLocationChange={(newLat, newLng) => {
                setLatitude(newLat);
                setLongitude(newLng);
              }}
              heightClass="h-[320px]"
            />
          </div>
        </section>

        {/* Section 3: Protected Document & Photo Vault Upload */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <span className="text-xs font-mono-tabular font-semibold text-[#124A32]">
              STEP 03 OF 04
            </span>
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D] mt-0.5">
              Protected Ownership Documents & Land Photos
            </h2>
            <p className="text-xs text-neutral-500">
              Ownership deeds, sale deeds, EC, tax records, and survey sketches are encrypted in transit and accessible only to you and authorized SLT verification staff.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-[#F7F9F7] p-4 rounded-xl border border-neutral-200">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Select Document Category to Attach
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as PropertyDocument['docType'])}
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                {Object.entries(docTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors">
                <Upload className="w-4 h-4" />
                <span>Choose File (PDF / JPG / PNG)</span>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleAddFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {pendingFiles.length === 0 ? (
            <div className="text-xs text-neutral-500 italic">
              No files queued yet. Attach ownership documents, survey sketches, or site photos above.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
              {pendingFiles.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#124A32]" />
                    <div>
                      <span className="font-semibold text-[#17251D]">{item.label}:</span>{' '}
                      <span className="text-neutral-700">{item.file.name}</span>
                      <span className="text-neutral-400 font-mono-tabular ml-2">
                        ({(item.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(idx)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Request Agent Visit & Final Submission */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <span className="text-xs font-mono-tabular font-semibold text-[#124A32]">
              STEP 04 OF 04
            </span>
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D] mt-0.5">
              Request SLT Field Agent Visit & Submit for Review
            </h2>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-[#17251D] cursor-pointer">
            <input
              type="checkbox"
              checked={requestVisitNow}
              onChange={(e) => setRequestVisitNow(e.target.checked)}
              className="rounded border-neutral-300 text-[#124A32]"
            />
            <span>Schedule an SLT Culture Field Agent site inspection immediately</span>
          </label>

          {requestVisitNow && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F7F9F7] border border-neutral-200">
              <div>
                <label className="block text-xs font-medium text-[#17251D] mb-1">
                  Preferred Inspection Date *
                </label>
                <input
                  type="date"
                  required={requestVisitNow}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#17251D] mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#17251D] mb-1">
                  Directions / Landmark Notes
                </label>
                <input
                  type="text"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="e.g. Meet near Panchayat Office"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
                />
              </div>
            </div>
          )}

          <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 text-[#124A32]"
            />
            <span>
              I confirm that I am the lawful owner or authorized representative of this property, and I consent to SLT Culture verifying these records and conducting a physical site inspection. I understand listings are published only after administrator approval.
            </span>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !firebaseUser}
              className="px-8 py-3.5 rounded-lg bg-[#124A32] text-white text-xs sm:text-sm font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering Land & Uploading Documents...' : 'Review & Register Land for SLT Screening'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};
