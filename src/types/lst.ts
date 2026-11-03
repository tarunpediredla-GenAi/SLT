export type UserType = 'buyer' | 'seller' | 'both';
export type UserRole = 'user' | 'agent' | 'admin';

export type LandCategory = 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial';
export type AreaUnit = 'Acres' | 'Cents' | 'Sq. Ft.' | 'Sq. Yards';

export type LifecycleStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Visit Scheduled'
  | 'Inspection Complete'
  | 'Documents Pending'
  | 'Approved'
  | 'Rejected'
  | 'Listed'
  | 'Negotiation'
  | 'Registration in Progress'
  | 'Closed';

export type AgentWorkflowStatus =
  | 'Assigned'
  | 'Contacted'
  | 'Visit Scheduled'
  | 'Inspection Started'
  | 'Inspection Completed'
  | 'Report Submitted';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  userType: UserType;
  role: UserRole;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  accountStatus: 'active' | 'suspended';
  privacyConsent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListing {
  id: string;
  referenceId: string;
  sellerId: string;
  sellerName?: string;
  title: string;
  category: LandCategory;
  state: string;
  district: string;
  mandal?: string;
  village: string;
  surveyNumber: string;
  plotNumber?: string;
  area: number;
  areaUnit: AreaUnit;
  priceInr: number;
  isNegotiable: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  roadAccess?: string;
  waterAvailability?: string;
  electricityAvailability?: string;
  currentLandUse?: string;
  ownershipDetails?: string;
  images?: string[];
  status: LifecycleStatus;
  screeningStage: number; // 1 to 10
  screeningStatus?: string;
  testingStatus?: string;
  agentVisitStatus?: string;
  registrationAssistanceStatus?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  rejectionReason?: string;
  publicScreeningSummary?: string;
  isFlagged?: boolean;
  isPublished: boolean;
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  sellerId: string;
  assignedAgentId?: string;
  docType: 'ownership' | 'sale_deed' | 'ec' | 'tax_record' | 'survey' | 'soil_report' | 'land_photo';
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningReport {
  id: string;
  propertyId: string;
  sellerId: string;
  agentId: string;
  agentName: string;
  boundariesVerified: boolean;
  roadAccessVerified: boolean;
  waterVerified: boolean;
  electricityVerified: boolean;
  ownershipRecordsChecked?: boolean;
  soilTestingCompleted?: boolean;
  soilQualitySummary?: string;
  inspectionNotes?: string;
  recommendation: 'Approve' | 'Reject' | 'Further Verification Required';
  createdAt: string;
  updatedAt: string;
}

export interface InspectionRequest {
  id: string;
  propertyId: string;
  referenceId: string;
  propertyTitle: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  preferredDate: string;
  preferredSlot?: string;
  notes?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: AgentWorkflowStatus | 'Pending Assignment';
  createdAt: string;
  updatedAt: string;
}

export interface BuyerEnquiry {
  id: string;
  enquiryId: string;
  propertyId: string;
  propertyTitle: string;
  propertyReferenceId?: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCity?: string;
  enquiryType: 'Register Interest' | 'Request Callback' | 'Request Site Visit';
  preferredVisitDate?: string;
  message?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentPhone?: string;
  status:
    | 'Submitted'
    | 'Assigned'
    | 'Contacted'
    | 'Visit Scheduled'
    | 'Inspection Started'
    | 'Inspection Completed'
    | 'Report Submitted'
    | 'Negotiation'
    | 'Registration in Progress'
    | 'Closed';
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface AgentAssignment {
  id: string;
  agentId: string;
  agentName: string;
  assignmentType: 'Property Inspection' | 'Buyer Enquiry';
  propertyId: string;
  propertyTitle: string;
  relatedRecordId?: string;
  contactName?: string;
  contactPhone?: string;
  status: AgentWorkflowStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  agentName: string;
  participantId: string;
  participantName: string;
  participantPhone?: string;
  participantRole: 'buyer' | 'seller';
  visitDate: string;
  visitTime: string;
  meetingPoint?: string;
  status: 'Visit Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationCase {
  id: string;
  caseNumber: string;
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  sellerName: string;
  buyerId?: string;
  buyerName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  currentStage: number; // 1 to 10
  status: LifecycleStatus;
  subRegistrarOffice?: string;
  appointmentDate?: string;
  coordinationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  title: string;
  message: string;
  category: 'submission' | 'approval' | 'enquiry' | 'assignment' | 'appointment' | 'registration';
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export const TEN_STAGE_WORKFLOW = [
  { stage: 1, title: 'Land Information Collection', desc: 'Seller submits survey details, boundaries, and location coordinates.' },
  { stage: 2, title: 'Document Review', desc: 'SLT team checks sale deeds, encumbrance certificates, and tax receipts.' },
  { stage: 3, title: 'Ownership Record Verification', desc: 'Cross-verification of revenue records and patta/khata continuity.' },
  { stage: 4, title: 'Physical Site Inspection', desc: 'Field agent verifies physical boundary stones, road width, and utilities.' },
  { stage: 5, title: 'Soil & Land Testing', desc: 'Optional agronomic soil quality and topography evaluation.' },
  { stage: 6, title: 'Screening Report Preparation', desc: 'Consolidated field and document screening summary prepared by agent.' },
  { stage: 7, title: 'Administrative Decision', desc: 'Admin reviews screening report to approve and publish or reject with reason.' },
  { stage: 8, title: 'Buyer & Seller Coordination', desc: 'Agent facilitates buyer site visits, callbacks, and transparent discussions.' },
  { stage: 9, title: 'Registration Assistance', desc: 'Sub-registrar slot coordination, document checklist, and witness readiness.' },
  { stage: 10, title: 'Case Closure', desc: 'Transaction coordination completed and archived in audit records.' },
] as const;

export const LIFECYCLE_STATUSES: LifecycleStatus[] = [
  'Submitted',
  'Under Review',
  'Visit Scheduled',
  'Inspection Complete',
  'Documents Pending',
  'Approved',
  'Rejected',
  'Listed',
  'Negotiation',
  'Registration in Progress',
  'Closed',
];

export const AGENT_STATUSES: AgentWorkflowStatus[] = [
  'Assigned',
  'Contacted',
  'Visit Scheduled',
  'Inspection Started',
  'Inspection Completed',
  'Report Submitted',
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Gujarat',
  'Kerala',
  'Madhya Pradesh',
  'Rajasthan',
  'Uttar Pradesh',
  'Odisha',
];

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  if (amount >= 10_000_000) {
    const crores = (amount / 10_000_000).toFixed(2).replace(/\.00$/, '');
    return `₹${crores} Cr`;
  }
  if (amount >= 100_000) {
    const lakhs = (amount / 100_000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakhs} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatExactInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Clearly labeled development sample properties for testing buyer & screening workflows
export const SAMPLE_PROPERTIES: PropertyListing[] = [
  {
    id: 'sample_lst_agri_01',
    referenceId: 'SLT-LST-SAMPLE-101',
    sellerId: 'sample_seller_account',
    sellerName: 'SLT Demo Landowner (Test Record)',
    title: '[SAMPLE TEST LISTING] 4.5 Acre Red-Soil Irrigated Mango & Coconut Estate',
    category: 'Agricultural',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    mandal: 'Anandapuram',
    village: 'Vellanki',
    surveyNumber: 'SY-142/2A-DEMO',
    plotNumber: 'Block-A',
    area: 4.5,
    areaUnit: 'Acres',
    priceInr: 18500000,
    isNegotiable: true,
    description:
      'DEVELOPMENT SAMPLE RECORD: Level red-loam agricultural parcel with 30ft blacktop panchayat road access, two working borewells, solar pump room, and perimeter chain-link fencing. Ideal for horticulture or farm estate.',
    latitude: 17.8934,
    longitude: 83.3721,
    locationAddress: 'Vellanki Road, Anandapuram Mandal, Visakhapatnam District, AP',
    roadAccess: '30 ft Blacktop Panchayat Road',
    waterAvailability: '2 Borewells + Drip Irrigation',
    electricityAvailability: '3-Phase Agricultural Connection',
    currentLandUse: 'Mango & Coconut Orchard',
    ownershipDetails: 'Single Patta Holder · Clear Link Documents (Sample Data)',
    images: ['/assets/land-agri.svg', '/assets/land-hero.svg'],
    status: 'Listed',
    screeningStage: 8,
    screeningStatus: 'Verified (Sample)',
    testingStatus: 'Soil pH 6.8 · Organic Carbon High',
    agentVisitStatus: 'Inspection Completed',
    registrationAssistanceStatus: 'Ready for Coordination',
    assignedAgentId: 'sample_agent_01',
    assignedAgentName: 'Ramesh Naidu (SLT Field Agent)',
    publicScreeningSummary:
      'Sample Screening Summary: Boundary stones physically verified on all 4 corners. 30ft road frontage confirmed. Soil pH tested at 6.8 (neutral, suitable for multi-crop cultivation).',
    isFlagged: false,
    isPublished: true,
    isSample: true,
    createdAt: '2026-10-15T09:00:00.000Z',
    updatedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'sample_lst_res_02',
    referenceId: 'SLT-LST-SAMPLE-102',
    sellerId: 'sample_seller_account',
    sellerName: 'SLT Demo Landowner (Test Record)',
    title: '[SAMPLE TEST LISTING] 400 Sq. Yards East-Facing Surveyed Residential Plot',
    category: 'Residential',
    state: 'Telangana',
    district: 'Rangareddy',
    mandal: 'Shankarpally',
    village: 'Mokila',
    surveyNumber: 'SY-88/B-DEMO',
    plotNumber: 'Plot No. 24',
    area: 400,
    areaUnit: 'Sq. Yards',
    priceInr: 14000000,
    isNegotiable: true,
    description:
      'DEVELOPMENT SAMPLE RECORD: East-facing residential plot in a surveyed layout with 40ft internal blacktop road, underground drainage, overhead water tank connection, and clear boundary stone demarcation.',
    latitude: 17.4368,
    longitude: 78.1984,
    locationAddress: 'Mokila Phase II, Shankarpally Mandal, Rangareddy District, TG',
    roadAccess: '40 ft Layout Blacktop Road',
    waterAvailability: 'Municipal + Borewell Grid',
    electricityAvailability: 'Underground Cabling & Streetlights',
    currentLandUse: 'Vacant Residential Plot',
    ownershipDetails: 'Registered Sale Deed · EC Checked (Sample Data)',
    images: ['/assets/land-res.svg', '/assets/land-hero.svg'],
    status: 'Approved',
    screeningStage: 7,
    screeningStatus: 'Verified (Sample)',
    testingStatus: 'Load-Bearing Strata Confirmed',
    agentVisitStatus: 'Inspection Completed',
    registrationAssistanceStatus: 'Sub-Registrar Checklist Ready',
    assignedAgentId: 'sample_agent_01',
    assignedAgentName: 'Ramesh Naidu (SLT Field Agent)',
    publicScreeningSummary:
      'Sample Screening Summary: Physical dimensions 40ft x 90ft verified on-site. Approach road and layout approval records cross-checked for demonstration.',
    isFlagged: false,
    isPublished: true,
    isSample: true,
    createdAt: '2026-10-18T11:15:00.000Z',
    updatedAt: '2026-10-22T16:00:00.000Z',
  },
  {
    id: 'sample_lst_comm_03',
    referenceId: 'SLT-LST-SAMPLE-103',
    sellerId: 'sample_seller_account',
    sellerName: 'SLT Demo Landowner (Test Record)',
    title: '[SAMPLE TEST LISTING] 1.2 Acre Highway-Facing Commercial & Logistics Parcel',
    category: 'Commercial',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    mandal: 'Devanahalli',
    village: 'Avathi',
    surveyNumber: 'SY-319/1-DEMO',
    plotNumber: 'NH-Frontage-3',
    area: 1.2,
    areaUnit: 'Acres',
    priceInr: 42000000,
    isNegotiable: false,
    description:
      'DEVELOPMENT SAMPLE RECORD: Commercial-zoned land parcel with 160ft frontage along service road, flat compacted terrain suitable for warehousing, cold storage, or commercial showroom.',
    latitude: 13.2785,
    longitude: 77.7162,
    locationAddress: 'NH-44 Service Road, Devanahalli Taluk, Bengaluru Rural, KA',
    roadAccess: '60 ft Service Road (NH-44)',
    waterAvailability: 'Borewell Available',
    electricityAvailability: 'HT Line Proximity (11kV)',
    currentLandUse: 'Converted Commercial Land',
    ownershipDetails: 'Commercial Conversion Order Verified (Sample Data)',
    images: ['/assets/land-comm.svg', '/assets/land-hero.svg'],
    status: 'Listed',
    screeningStage: 8,
    screeningStatus: 'Verified (Sample)',
    testingStatus: 'Compaction & Drainage Verified',
    agentVisitStatus: 'Inspection Completed',
    registrationAssistanceStatus: 'Available on Request',
    assignedAgentId: 'sample_agent_01',
    assignedAgentName: 'Ramesh Naidu (SLT Field Agent)',
    publicScreeningSummary:
      'Sample Screening Summary: Highway setback and service road access inspected. Non-agricultural conversion reference verified for demonstration.',
    isFlagged: false,
    isPublished: true,
    isSample: true,
    createdAt: '2026-10-21T08:45:00.000Z',
    updatedAt: '2026-10-25T10:20:00.000Z',
  },
];
