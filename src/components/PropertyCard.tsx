import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';
import { PropertyListing, formatInr } from '../types/lst';
import { useLST } from '../context/LSTContext';

interface PropertyCardProps {
  property: PropertyListing;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { savedProperties, toggleSaveProperty, compareIds, toggleCompareProperty, firebaseUser } =
    useLST();
  const [imgError, setImgError] = useState(false);

  const isSaved = savedProperties.some((s) => s.propertyId === property.id);
  const isCompared = compareIds.includes(property.id);
  const coverImage =
    !imgError && property.images && property.images.length > 0
      ? property.images[0]
      : '/assets/land-agri.svg';

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firebaseUser) return;
    await toggleSaveProperty(property.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompareProperty(property.id);
  };

  return (
    <article className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#124A32]/40">
      <div>
        <div className="relative aspect-[4/3] bg-[#124A32] overflow-hidden">
          <img
            src={coverImage}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Top Action Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompare}
              title={isCompared ? 'Remove from comparison' : 'Compare property'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                isCompared
                  ? 'bg-[#D5AD51] text-[#17251D] font-semibold'
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>
            {firebaseUser && (
              <button
                type="button"
                onClick={handleSave}
                title={isSaved ? 'Remove from saved' : 'Save to favourites'}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'bg-[#D5AD51] text-[#17251D]'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Bottom Scrim Price & Verification */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
            <div>
              <div className="text-xs text-white/80 font-mono-tabular">
                {property.referenceId}
              </div>
              <div className="text-xl font-bold font-mono-tabular tracking-tight">
                {formatInr(property.priceInr)}
                {property.isNegotiable && (
                  <span className="text-xs font-normal text-[#D5AD51] ml-1.5">
                    · Negotiable
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#D5AD51] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Stage {property.screeningStage}/10</span>
            </div>
          </div>
        </div>

        {/* Content Body — Zero-Pill Inline Metadata */}
        <div className="p-5">
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500">
            <span className="font-medium text-[#124A32]">{property.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular font-medium text-[#17251D]">
              {property.area} {property.areaUnit}
            </span>
            <span aria-hidden="true">·</span>
            <span>Sy No. {property.surveyNumber}</span>
            {property.isSample && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium">Sample Test Record</span>
              </>
            )}
          </div>

          <h3 className="font-serif-display text-lg font-semibold text-[#17251D] mt-2 line-clamp-2 group-hover:text-[#124A32] transition-colors">
            <Link to={`/land/${property.id}`}>{property.title}</Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-2">
            <MapPin className="w-3.5 h-3.5 text-[#124A32] shrink-0" />
            <span className="truncate">
              {property.village}, {property.mandal ? `${property.mandal}, ` : ''}
              {property.district}, {property.state}
            </span>
          </div>

          <p className="text-xs text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
            {property.publicScreeningSummary || property.description || 'Verified SLT Culture land listing.'}
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-neutral-100 bg-[#F7F9F7] flex items-center justify-between text-xs">
        <span className="text-neutral-600 truncate">
          Status: <strong className="text-[#17251D] font-medium">{property.status}</strong>
        </span>
        <Link
          to={`/land/${property.id}`}
          className="inline-flex items-center gap-1 font-semibold text-[#124A32] hover:text-[#17251D] transition-colors whitespace-nowrap shrink-0"
        >
          <span>View Land Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
