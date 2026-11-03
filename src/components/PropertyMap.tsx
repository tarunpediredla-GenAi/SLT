import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { PropertyListing, formatInr } from '../types/lst';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface PropertyMapProps {
  properties?: PropertyListing[];
  selectedProperty?: PropertyListing | null;
  onSelectProperty?: (property: PropertyListing) => void;
  interactivePicker?: boolean;
  lat?: number;
  lng?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties = [],
  selectedProperty = null,
  onSelectProperty,
  interactivePicker = false,
  lat,
  lng,
  onLocationChange,
  heightClass = 'h-[420px]',
}) => {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const defaultCenter = {
    lat: lat ?? selectedProperty?.latitude ?? properties[0]?.latitude ?? 17.6868,
    lng: lng ?? selectedProperty?.longitude ?? properties[0]?.longitude ?? 83.2185,
  };

  const validProperties = properties.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  // If API key is not configured, show a transparent, functional coordinate & external map pin view
  if (!MAPS_API_KEY) {
    return (
      <div
        className={`w-full ${heightClass} rounded-xl border border-[#124A32]/15 bg-[#F7F9F7] p-6 flex flex-col justify-between relative overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#124A32]">
              <MapPin className="w-4 h-4 text-[#D5AD51]" />
              <span>Geographic Coordinates & Survey Pin</span>
            </div>
            <h4 className="font-serif-display text-lg font-semibold text-[#17251D] mt-1">
              {selectedProperty
                ? `${selectedProperty.village}, ${selectedProperty.district}, ${selectedProperty.state}`
                : 'Regional Land Parcel Coordinates'}
            </h4>
            <p className="text-xs text-[#17251D]/70 mt-1 max-w-xl">
              Interactive map tiles require a configured Google Maps API key (`VITE_GOOGLE_MAPS_API_KEY`). Exact GPS coordinates and external satellite links remain fully operational below.
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${defaultCenter.lat},${defaultCenter.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#124A32] text-white text-xs font-medium hover:bg-[#17251D] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {interactivePicker && onLocationChange ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto bg-white p-4 rounded-lg border border-neutral-200">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Latitude (Decimal Degrees)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat ?? 17.6868}
                onChange={(e) =>
                  onLocationChange(parseFloat(e.target.value) || 17.6868, lng ?? 83.2185)
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Longitude (Decimal Degrees)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lng ?? 83.2185}
                onChange={(e) =>
                  onLocationChange(lat ?? 17.6868, parseFloat(e.target.value) || 83.2185)
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg font-mono-tabular"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto overflow-y-auto max-h-56 pr-1">
            {(selectedProperty ? [selectedProperty] : validProperties).map((prop) => (
              <div
                key={prop.id}
                onClick={() => onSelectProperty && onSelectProperty(prop)}
                className="p-3 rounded-lg bg-white border border-neutral-200 hover:border-[#124A32] transition-colors cursor-pointer"
              >
                <div className="text-xs font-medium text-[#124A32] truncate">
                  {prop.title}
                </div>
                <div className="text-xs text-[#17251D]/70 mt-0.5">
                  {prop.village} · {prop.district} · Sy No. {prop.surveyNumber}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-mono-tabular">
                  <span className="font-semibold text-[#17251D]">{formatInr(prop.priceInr)}</span>
                  <span className="text-[#17251D]/60">
                    {prop.latitude?.toFixed(4)}°N, {prop.longitude?.toFixed(4)}°E
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#17251D]/70 border-t border-neutral-200 pt-3 font-mono-tabular">
          <span>
            GPS PIN: {defaultCenter.lat.toFixed(4)}° N, {defaultCenter.lng.toFixed(4)}° E
          </span>
          <span>SLT SURVEY VERIFICATION GRID</span>
        </div>
      </div>
    );
  }

  const activeProperty =
    validProperties.find((p) => p.id === activeMarkerId) || selectedProperty;

  return (
    <div className={`w-full ${heightClass} rounded-xl overflow-hidden border border-neutral-200 relative`}>
      <APIProvider apiKey={MAPS_API_KEY} libraries={['marker']}>
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={defaultCenter}
          defaultZoom={selectedProperty || interactivePicker ? 13 : 6}
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(ev) => {
            if (interactivePicker && onLocationChange && ev.detail.latLng) {
              onLocationChange(
                Number(ev.detail.latLng.lat.toFixed(6)),
                Number(ev.detail.latLng.lng.toFixed(6))
              );
            }
          }}
        >
          {interactivePicker && typeof lat === 'number' && typeof lng === 'number' && (
            <AdvancedMarker position={{ lat, lng }} title="Selected Land Location">
              <Pin
                background="#124A32"
                borderColor="#D5AD51"
                glyphColor="#D5AD51"
                scale={1.25}
              />
            </AdvancedMarker>
          )}

          {!interactivePicker &&
            (selectedProperty ? [selectedProperty] : validProperties).map((prop) => {
              if (typeof prop.latitude !== 'number' || typeof prop.longitude !== 'number') {
                return null;
              }
              return (
                <AdvancedMarker
                  key={prop.id}
                  position={{ lat: prop.latitude, lng: prop.longitude }}
                  title={prop.title}
                  onClick={() => {
                    setActiveMarkerId(prop.id);
                    if (onSelectProperty) onSelectProperty(prop);
                  }}
                >
                  <Pin
                    background="#124A32"
                    borderColor="#D5AD51"
                    glyphColor="#FFFFFF"
                    scale={1.15}
                  />
                </AdvancedMarker>
              );
            })}

          {!interactivePicker &&
            activeProperty &&
            typeof activeProperty.latitude === 'number' &&
            typeof activeProperty.longitude === 'number' && (
              <InfoWindow
                position={{
                  lat: activeProperty.latitude,
                  lng: activeProperty.longitude,
                }}
                maxWidth={260}
                onCloseClick={() => setActiveMarkerId(null)}
              >
                <div className="p-1 text-[#17251D]">
                  <p className="text-xs font-semibold text-[#124A32] leading-snug">
                    {activeProperty.title}
                  </p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    {activeProperty.village}, {activeProperty.district} ({activeProperty.state})
                  </p>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-200 text-xs font-mono-tabular">
                    <span className="font-bold text-[#17251D]">
                      {formatInr(activeProperty.priceInr)}
                    </span>
                    <span className="text-neutral-600">
                      {activeProperty.area} {activeProperty.areaUnit}
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
        </GoogleMap>
      </APIProvider>

      <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between gap-2">
        <div className="pointer-events-auto bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm text-xs flex items-center gap-2 font-mono-tabular text-[#17251D]">
          <Navigation className="w-3.5 h-3.5 text-[#124A32]" />
          <span>
            {defaultCenter.lat.toFixed(4)}° N, {defaultCenter.lng.toFixed(4)}° E
          </span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${defaultCenter.lat},${defaultCenter.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center gap-1.5 bg-[#124A32] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#17251D] transition-colors shadow-sm"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
