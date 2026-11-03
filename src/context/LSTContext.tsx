import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  makeSafeId,
} from '../lib/firebase';
import {
  UserProfile,
  UserType,
  UserRole,
  PropertyListing,
  PropertyDocument,
  ScreeningReport,
  InspectionRequest,
  BuyerEnquiry,
  SavedProperty,
  AgentAssignment,
  Appointment,
  RegistrationCase,
  AppNotification,
  AuditLog,
  SAMPLE_PROPERTIES,
  LifecycleStatus,
  AgentWorkflowStatus,
} from '../types/lst';

const BOOTSTRAP_ADMIN_EMAIL = 'tarunpediredla9966@gmail.com';

interface LSTContextValue {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  needsOnboarding: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  showSampleListings: boolean;
  setShowSampleListings: (show: boolean) => void;
  compareIds: string[];
  toggleCompareProperty: (propertyId: string) => void;
  clearCompare: () => void;

  // Data stores
  publishedProperties: PropertyListing[];
  allProperties: PropertyListing[];
  mySellerProperties: PropertyListing[];
  propertyDocuments: PropertyDocument[];
  screeningReports: ScreeningReport[];
  inspectionRequests: InspectionRequest[];
  buyerEnquiries: BuyerEnquiry[];
  savedProperties: SavedProperty[];
  agentAssignments: AgentAssignment[];
  appointments: Appointment[];
  registrationCases: RegistrationCase[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  allUsers: UserProfile[];

  // Auth Actions
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logoutUser: () => Promise<void>;
  completeOnboarding: (data: {
    fullName: string;
    phone: string;
    altPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    userType: UserType;
    privacyConsent: boolean;
  }) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;

  // Seller Actions
  submitNewLand: (
    landData: Omit<
      PropertyListing,
      'id' | 'referenceId' | 'sellerId' | 'status' | 'screeningStage' | 'isPublished' | 'createdAt' | 'updatedAt'
    >,
    uploadedDocs: Array<{
      docType: PropertyDocument['docType'];
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    }>,
    requestImmediateVisit?: { preferredDate: string; preferredSlot: string; notes: string }
  ) => Promise<{ propertyId: string; referenceId: string }>;
  updateSellerPropertyFields: (
    propertyId: string,
    updates: Pick<
      PropertyListing,
      'title' | 'priceInr' | 'isNegotiable' | 'description' | 'roadAccess' | 'waterAvailability' | 'electricityAvailability' | 'currentLandUse'
    >
  ) => Promise<void>;
  requestAgentInspectionVisit: (data: {
    propertyId: string;
    referenceId: string;
    propertyTitle: string;
    preferredDate: string;
    preferredSlot: string;
    notes: string;
  }) => Promise<void>;
  uploadDocumentFile: (params: {
    file: File;
    propertyId: string;
    docType: PropertyDocument['docType'];
  }) => Promise<{ fileId: string; fileUrl: string; fileSize: number; mimeType: string }>;

  // Buyer Actions
  toggleSaveProperty: (propertyId: string) => Promise<void>;
  submitBuyerEnquiry: (data: {
    property: PropertyListing;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerCity: string;
    enquiryType: BuyerEnquiry['enquiryType'];
    preferredVisitDate?: string;
    message?: string;
  }) => Promise<{ enquiryId: string }>;

  // Agent Actions
  updateAgentWorkStatus: (params: {
    propertyId: string;
    newAgentStatus: AgentWorkflowStatus;
    notes?: string;
    assignmentId?: string;
    inspectionRequestId?: string;
    enquiryId?: string;
  }) => Promise<void>;
  submitAgentScreeningReport: (
    reportData: Omit<ScreeningReport, 'id' | 'agentId' | 'agentName' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  schedulePropertyAppointment: (
    data: Omit<Appointment, 'id' | 'agentId' | 'agentName' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateAppointmentStatus: (
    appointmentId: string,
    status: Appointment['status'],
    notes?: string
  ) => Promise<void>;

  // Admin Actions
  adminReviewProperty: (params: {
    property: PropertyListing;
    decision: 'approve_publish' | 'approve_only' | 'reject' | 'flag' | 'unflag' | 'update_stage';
    screeningStage?: number;
    lifecycleStatus?: LifecycleStatus;
    rejectionReason?: string;
    publicScreeningSummary?: string;
    testingStatus?: string;
    registrationAssistanceStatus?: string;
  }) => Promise<void>;
  adminAssignAgent: (params: {
    agent: UserProfile;
    targetType: 'Property Inspection' | 'Buyer Enquiry';
    property: PropertyListing;
    relatedRecordId?: string;
    contactName?: string;
    contactPhone?: string;
    notes?: string;
  }) => Promise<void>;
  adminUpdateDocumentVerification: (
    docItem: PropertyDocument,
    status: 'verified' | 'rejected',
    reviewerNotes: string
  ) => Promise<void>;
  adminChangeUserRole: (
    targetUser: UserProfile,
    newRole: UserRole,
    accountStatus?: 'active' | 'suspended'
  ) => Promise<void>;
  adminUpsertRegistrationCase: (
    caseData: Partial<RegistrationCase> & { propertyId: string; propertyTitle: string; sellerId: string; sellerName: string }
  ) => Promise<void>;

  // Notifications
  markNotificationRead: (notificationId: string) => Promise<void>;
}

const LSTContext = createContext<LSTContextValue | undefined>(undefined);

function mergeById<T extends { id: string }>(...lists: T[][]): T[] {
  const map: Record<string, T> = {};
  for (const list of lists) {
    for (const item of list) {
      map[item.id] = item;
    }
  }
  return Object.values(map).sort((a: any, b: any) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  );
}

export const LSTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showSampleListings, setShowSampleListings] = useState<boolean>(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Firestore Slices
  const [pubPropsSlice, setPubPropsSlice] = useState<PropertyListing[]>([]);
  const [sellerPropsSlice, setSellerPropsSlice] = useState<PropertyListing[]>([]);
  const [agentPropsSlice, setAgentPropsSlice] = useState<PropertyListing[]>([]);
  const [adminPropsSlice, setAdminPropsSlice] = useState<PropertyListing[]>([]);

  const [docsSellerSlice, setDocsSellerSlice] = useState<PropertyDocument[]>([]);
  const [docsAgentSlice, setDocsAgentSlice] = useState<PropertyDocument[]>([]);
  const [docsAdminSlice, setDocsAdminSlice] = useState<PropertyDocument[]>([]);

  const [reportsSellerSlice, setReportsSellerSlice] = useState<ScreeningReport[]>([]);
  const [reportsAgentSlice, setReportsAgentSlice] = useState<ScreeningReport[]>([]);
  const [reportsAdminSlice, setReportsAdminSlice] = useState<ScreeningReport[]>([]);

  const [inspSellerSlice, setInspSellerSlice] = useState<InspectionRequest[]>([]);
  const [inspAgentSlice, setInspAgentSlice] = useState<InspectionRequest[]>([]);
  const [inspAdminSlice, setInspAdminSlice] = useState<InspectionRequest[]>([]);

  const [enqBuyerSlice, setEnqBuyerSlice] = useState<BuyerEnquiry[]>([]);
  const [enqSellerSlice, setEnqSellerSlice] = useState<BuyerEnquiry[]>([]);
  const [enqAgentSlice, setEnqAgentSlice] = useState<BuyerEnquiry[]>([]);
  const [enqAdminSlice, setEnqAdminSlice] = useState<BuyerEnquiry[]>([]);

  const [savedPropsSlice, setSavedPropsSlice] = useState<SavedProperty[]>([]);

  const [assignAgentSlice, setAssignAgentSlice] = useState<AgentAssignment[]>([]);
  const [assignAdminSlice, setAssignAdminSlice] = useState<AgentAssignment[]>([]);

  const [apptParticipantSlice, setApptParticipantSlice] = useState<Appointment[]>([]);
  const [apptAgentSlice, setApptAgentSlice] = useState<Appointment[]>([]);
  const [apptAdminSlice, setApptAdminSlice] = useState<Appointment[]>([]);

  const [regSellerSlice, setRegSellerSlice] = useState<RegistrationCase[]>([]);
  const [regBuyerSlice, setRegBuyerSlice] = useState<RegistrationCase[]>([]);
  const [regAgentSlice, setRegAgentSlice] = useState<RegistrationCase[]>([]);
  const [regAdminSlice, setRegAdminSlice] = useState<RegistrationCase[]>([]);

  const [notifUserSlice, setNotifUserSlice] = useState<AppNotification[]>([]);
  const [notifAdminSlice, setNotifAdminSlice] = useState<AppNotification[]>([]);

  const [auditLogsSlice, setAuditLogsSlice] = useState<AuditLog[]>([]);
  const [allUsersSlice, setAllUsersSlice] = useState<UserProfile[]>([]);

  const isBootstrapAdmin =
    Boolean(firebaseUser?.email === BOOTSTRAP_ADMIN_EMAIL && firebaseUser?.emailVerified);
  const isAdmin = isBootstrapAdmin || userProfile?.role === 'admin';
  const isAgent = isAdmin || userProfile?.role === 'agent';

  // 1. Auth State & Current User Profile Listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!user) {
        setUserProfile(null);
        setAuthLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      unsubscribeProfile = onSnapshot(
        userDocRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // If bootstrap admin logged in and profile isn't marked admin yet, upgrade safely
            if (
              user.email === BOOTSTRAP_ADMIN_EMAIL &&
              user.emailVerified &&
              data.role !== 'admin'
            ) {
              try {
                await updateDoc(userDocRef, {
                  role: 'admin',
                  verificationStatus: 'verified',
                  updatedAt: new Date().toISOString(),
                });
              } catch (e) {
                console.warn('Bootstrap admin role sync warning:', e);
              }
            }
            setUserProfile(data);
          } else {
            setUserProfile(null);
          }
          setAuthLoading(false);
        },
        (err) => {
          setAuthLoading(false);
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 2. Public Published Properties Listener (Always Active)
  useEffect(() => {
    const qPub = query(collection(db, 'properties'), where('isPublished', '==', true));
    const unsub = onSnapshot(
      qPub,
      (snap) => {
        setPubPropsSlice(snap.docs.map((d) => d.data() as PropertyListing));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'properties (published)')
    );
    return () => unsub();
  }, []);

  // 3. Authenticated User Scoped Listeners
  useEffect(() => {
    if (!firebaseUser) {
      setSellerPropsSlice([]);
      setAgentPropsSlice([]);
      setAdminPropsSlice([]);
      setDocsSellerSlice([]);
      setDocsAgentSlice([]);
      setDocsAdminSlice([]);
      setReportsSellerSlice([]);
      setReportsAgentSlice([]);
      setReportsAdminSlice([]);
      setInspSellerSlice([]);
      setInspAgentSlice([]);
      setInspAdminSlice([]);
      setEnqBuyerSlice([]);
      setEnqSellerSlice([]);
      setEnqAgentSlice([]);
      setEnqAdminSlice([]);
      setSavedPropsSlice([]);
      setAssignAgentSlice([]);
      setAssignAdminSlice([]);
      setApptParticipantSlice([]);
      setApptAgentSlice([]);
      setApptAdminSlice([]);
      setRegSellerSlice([]);
      setRegBuyerSlice([]);
      setRegAgentSlice([]);
      setRegAdminSlice([]);
      setNotifUserSlice([]);
      setNotifAdminSlice([]);
      setAuditLogsSlice([]);
      setAllUsersSlice([]);
      return;
    }

    const uid = firebaseUser.uid;
    const unsubs: Array<() => void> = [];

    // User's own Seller Properties
    unsubs.push(
      onSnapshot(
        query(collection(db, 'properties'), where('sellerId', '==', uid)),
        (s) => setSellerPropsSlice(s.docs.map((d) => d.data() as PropertyListing)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'properties (seller)')
      )
    );

    // User's own Property Documents
    unsubs.push(
      onSnapshot(
        query(collection(db, 'propertyDocuments'), where('sellerId', '==', uid)),
        (s) => setDocsSellerSlice(s.docs.map((d) => d.data() as PropertyDocument)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'propertyDocuments (seller)')
      )
    );

    // Seller's Screening Reports
    unsubs.push(
      onSnapshot(
        query(collection(db, 'screeningReports'), where('sellerId', '==', uid)),
        (s) => setReportsSellerSlice(s.docs.map((d) => d.data() as ScreeningReport)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'screeningReports (seller)')
      )
    );

    // Seller's Inspection Requests
    unsubs.push(
      onSnapshot(
        query(collection(db, 'inspectionRequests'), where('sellerId', '==', uid)),
        (s) => setInspSellerSlice(s.docs.map((d) => d.data() as InspectionRequest)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'inspectionRequests (seller)')
      )
    );

    // Buyer Enquiries (as buyer and as seller)
    unsubs.push(
      onSnapshot(
        query(collection(db, 'buyerEnquiries'), where('buyerId', '==', uid)),
        (s) => setEnqBuyerSlice(s.docs.map((d) => d.data() as BuyerEnquiry)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'buyerEnquiries (buyer)')
      )
    );
    unsubs.push(
      onSnapshot(
        query(collection(db, 'buyerEnquiries'), where('sellerId', '==', uid)),
        (s) => setEnqSellerSlice(s.docs.map((d) => d.data() as BuyerEnquiry)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'buyerEnquiries (seller)')
      )
    );

    // Saved Properties
    unsubs.push(
      onSnapshot(
        query(collection(db, 'savedProperties'), where('userId', '==', uid)),
        (s) => setSavedPropsSlice(s.docs.map((d) => d.data() as SavedProperty)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'savedProperties')
      )
    );

    // Appointments as Participant
    unsubs.push(
      onSnapshot(
        query(collection(db, 'appointments'), where('participantId', '==', uid)),
        (s) => setApptParticipantSlice(s.docs.map((d) => d.data() as Appointment)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'appointments (participant)')
      )
    );

    // Registration Cases as Seller & Buyer
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrationCases'), where('sellerId', '==', uid)),
        (s) => setRegSellerSlice(s.docs.map((d) => d.data() as RegistrationCase)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'registrationCases (seller)')
      )
    );
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrationCases'), where('buyerId', '==', uid)),
        (s) => setRegBuyerSlice(s.docs.map((d) => d.data() as RegistrationCase)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'registrationCases (buyer)')
      )
    );

    // User's Personal Notifications
    unsubs.push(
      onSnapshot(
        query(collection(db, 'notifications'), where('recipientId', '==', uid)),
        (s) => setNotifUserSlice(s.docs.map((d) => d.data() as AppNotification)),
        (e) => handleFirestoreError(e, OperationType.LIST, 'notifications (user)')
      )
    );

    // Agent-specific listeners
    if (isAgent) {
      unsubs.push(
        onSnapshot(
          query(collection(db, 'properties'), where('assignedAgentId', '==', uid)),
          (s) => setAgentPropsSlice(s.docs.map((d) => d.data() as PropertyListing)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'properties (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'propertyDocuments'), where('assignedAgentId', '==', uid)),
          (s) => setDocsAgentSlice(s.docs.map((d) => d.data() as PropertyDocument)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'propertyDocuments (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'screeningReports'), where('agentId', '==', uid)),
          (s) => setReportsAgentSlice(s.docs.map((d) => d.data() as ScreeningReport)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'screeningReports (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'inspectionRequests'), where('assignedAgentId', '==', uid)),
          (s) => setInspAgentSlice(s.docs.map((d) => d.data() as InspectionRequest)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'inspectionRequests (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'buyerEnquiries'), where('assignedAgentId', '==', uid)),
          (s) => setEnqAgentSlice(s.docs.map((d) => d.data() as BuyerEnquiry)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'buyerEnquiries (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'agentAssignments'), where('agentId', '==', uid)),
          (s) => setAssignAgentSlice(s.docs.map((d) => d.data() as AgentAssignment)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'agentAssignments (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'appointments'), where('agentId', '==', uid)),
          (s) => setApptAgentSlice(s.docs.map((d) => d.data() as Appointment)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'appointments (agent)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'registrationCases'), where('assignedAgentId', '==', uid)),
          (s) => setRegAgentSlice(s.docs.map((d) => d.data() as RegistrationCase)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'registrationCases (agent)')
        )
      );
    }

    // Bootstrap Admin Global Listeners
    if (isBootstrapAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (s) =>
            setAllUsersSlice(
              s.docs.map((d) => ({ ...(d.data() as UserProfile), id: d.id } as any))
            ),
          (e) => handleFirestoreError(e, OperationType.LIST, 'users (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'properties'),
          (s) => setAdminPropsSlice(s.docs.map((d) => d.data() as PropertyListing)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'properties (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'propertyDocuments'),
          (s) => setDocsAdminSlice(s.docs.map((d) => d.data() as PropertyDocument)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'propertyDocuments (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'screeningReports'),
          (s) => setReportsAdminSlice(s.docs.map((d) => d.data() as ScreeningReport)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'screeningReports (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'inspectionRequests'),
          (s) => setInspAdminSlice(s.docs.map((d) => d.data() as InspectionRequest)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'inspectionRequests (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'buyerEnquiries'),
          (s) => setEnqAdminSlice(s.docs.map((d) => d.data() as BuyerEnquiry)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'buyerEnquiries (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'agentAssignments'),
          (s) => setAssignAdminSlice(s.docs.map((d) => d.data() as AgentAssignment)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'agentAssignments (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'appointments'),
          (s) => setApptAdminSlice(s.docs.map((d) => d.data() as Appointment)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'appointments (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'registrationCases'),
          (s) => setRegAdminSlice(s.docs.map((d) => d.data() as RegistrationCase)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'registrationCases (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'notifications'), where('recipientId', '==', 'admin_broadcast')),
          (s) => setNotifAdminSlice(s.docs.map((d) => d.data() as AppNotification)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'notifications (admin)')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'auditLogs'),
          (s) => setAuditLogsSlice(s.docs.map((d) => d.data() as AuditLog)),
          (e) => handleFirestoreError(e, OperationType.LIST, 'auditLogs (admin)')
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [firebaseUser, isAgent, isBootstrapAdmin]);

  // Combined derived data
  const publishedProperties = useMemo(() => {
    const live = mergeById(pubPropsSlice);
    return showSampleListings ? [...live, ...SAMPLE_PROPERTIES] : live;
  }, [pubPropsSlice, showSampleListings]);

  const allProperties = useMemo(() => {
    const live = mergeById(pubPropsSlice, sellerPropsSlice, agentPropsSlice, adminPropsSlice);
    return showSampleListings ? [...live, ...SAMPLE_PROPERTIES] : live;
  }, [pubPropsSlice, sellerPropsSlice, agentPropsSlice, adminPropsSlice, showSampleListings]);

  const mySellerProperties = useMemo(
    () => mergeById(sellerPropsSlice),
    [sellerPropsSlice]
  );

  const propertyDocuments = useMemo(
    () => mergeById(docsSellerSlice, docsAgentSlice, docsAdminSlice),
    [docsSellerSlice, docsAgentSlice, docsAdminSlice]
  );

  const screeningReports = useMemo(
    () => mergeById(reportsSellerSlice, reportsAgentSlice, reportsAdminSlice),
    [reportsSellerSlice, reportsAgentSlice, reportsAdminSlice]
  );

  const inspectionRequests = useMemo(
    () => mergeById(inspSellerSlice, inspAgentSlice, inspAdminSlice),
    [inspSellerSlice, inspAgentSlice, inspAdminSlice]
  );

  const buyerEnquiries = useMemo(
    () => mergeById(enqBuyerSlice, enqSellerSlice, enqAgentSlice, enqAdminSlice),
    [enqBuyerSlice, enqSellerSlice, enqAgentSlice, enqAdminSlice]
  );

  const savedProperties = useMemo(() => mergeById(savedPropsSlice), [savedPropsSlice]);

  const agentAssignments = useMemo(
    () => mergeById(assignAgentSlice, assignAdminSlice),
    [assignAgentSlice, assignAdminSlice]
  );

  const appointments = useMemo(
    () => mergeById(apptParticipantSlice, apptAgentSlice, apptAdminSlice),
    [apptParticipantSlice, apptAgentSlice, apptAdminSlice]
  );

  const registrationCases = useMemo(
    () => mergeById(regSellerSlice, regBuyerSlice, regAgentSlice, regAdminSlice),
    [regSellerSlice, regBuyerSlice, regAgentSlice, regAdminSlice]
  );

  const notifications = useMemo(
    () => mergeById(notifUserSlice, notifAdminSlice),
    [notifUserSlice, notifAdminSlice]
  );

  const auditLogs = useMemo(() => mergeById(auditLogsSlice), [auditLogsSlice]);

  const allUsers = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    for (const u of allUsersSlice) {
      map[u.uid] = u;
    }
    if (userProfile) {
      map[userProfile.uid] = userProfile;
    }
    return Object.values(map);
  }, [allUsersSlice, userProfile]);

  const needsOnboarding = Boolean(firebaseUser && !authLoading && !userProfile);

  // Helper: Create Notification
  async function createNotification(params: {
    recipientId: string;
    title: string;
    message: string;
    category: AppNotification['category'];
    link?: string;
  }) {
    if (!auth.currentUser) return;
    const id = makeSafeId('notif');
    const now = new Date().toISOString();
    const payload: AppNotification = {
      id,
      recipientId: params.recipientId.slice(0, 128),
      senderId: auth.currentUser.uid,
      title: params.title.slice(0, 160),
      message: params.message.slice(0, 500),
      category: params.category,
      link: (params.link || '/').slice(0, 200),
      isRead: false,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'notifications', id), payload);
    } catch (err) {
      console.warn('Notification error:', err);
    }
  }

  // Helper: Record Audit Log
  async function recordAuditLog(params: {
    action: string;
    targetCollection: string;
    targetId: string;
    details: string;
  }) {
    if (!auth.currentUser) return;
    const id = makeSafeId('audit');
    const now = new Date().toISOString();
    const payload: AuditLog = {
      id,
      actorId: auth.currentUser.uid,
      actorEmail: (auth.currentUser.email || 'unknown@sltculture.in').slice(0, 160),
      actorRole: (isAdmin ? 'admin' : isAgent ? 'agent' : userProfile?.userType || 'user').slice(0, 40),
      action: params.action.slice(0, 160),
      targetCollection: params.targetCollection.slice(0, 80),
      targetId: params.targetId.slice(0, 128),
      details: params.details.slice(0, 1000),
      createdAt: now,
    };
    try {
      await setDoc(doc(db, 'auditLogs', id), payload);
    } catch (err) {
      console.warn('Audit log write warning:', err);
    }
  }

  // Compare helpers
  const toggleCompareProperty = (propertyId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
      if (prev.length >= 3) return [...prev.slice(1), propertyId];
      return [...prev, propertyId];
    });
  };
  const clearCompare = () => setCompareIds([]);

  // Auth Handlers
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signupWithEmail = async (email: string, pass: string, fullName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (fullName.trim()) {
      await updateProfile(cred.user, { displayName: fullName.trim() });
    }
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Verification email send notice:', e);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const completeOnboarding = async (data: {
    fullName: string;
    phone: string;
    altPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    userType: UserType;
    privacyConsent: boolean;
  }) => {
    if (!auth.currentUser) throw new Error('Not authenticated.');
    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email || 'user@sltculture.in';
    const isOwnerAdmin =
      email === BOOTSTRAP_ADMIN_EMAIL && auth.currentUser.emailVerified;
    const now = new Date().toISOString();

    const profile: UserProfile = {
      uid,
      fullName: data.fullName.trim().slice(0, 120),
      email: email.slice(0, 160),
      phone: data.phone.trim().slice(0, 24),
      altPhone: (data.altPhone || '').trim().slice(0, 24),
      address: (data.address || '').trim().slice(0, 300),
      city: (data.city || '').trim().slice(0, 80),
      state: (data.state || '').trim().slice(0, 80),
      pinCode: (data.pinCode || '').trim().slice(0, 12),
      userType: data.userType,
      role: isOwnerAdmin ? 'admin' : 'user',
      verificationStatus: auth.currentUser.emailVerified ? 'verified' : 'pending',
      accountStatus: 'active',
      privacyConsent: Boolean(data.privacyConsent),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', uid), profile);
      await recordAuditLog({
        action: 'User Profile Completed',
        targetCollection: 'users',
        targetId: uid,
        details: `Completed onboarding as ${data.userType} (${profile.fullName})`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
  };

  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser || !userProfile) return;
    const uid = auth.currentUser.uid;
    const now = new Date().toISOString();
    const payload = {
      fullName: (updates.fullName ?? userProfile.fullName).slice(0, 120),
      phone: (updates.phone ?? userProfile.phone).slice(0, 24),
      altPhone: (updates.altPhone ?? userProfile.altPhone ?? '').slice(0, 24),
      address: (updates.address ?? userProfile.address ?? '').slice(0, 300),
      city: (updates.city ?? userProfile.city ?? '').slice(0, 80),
      state: (updates.state ?? userProfile.state ?? '').slice(0, 80),
      pinCode: (updates.pinCode ?? userProfile.pinCode ?? '').slice(0, 12),
      userType: updates.userType ?? userProfile.userType,
      verificationStatus: updates.verificationStatus ?? userProfile.verificationStatus,
      privacyConsent: updates.privacyConsent ?? userProfile.privacyConsent ?? true,
      updatedAt: now,
    };
    try {
      await updateDoc(doc(db, 'users', uid), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // Document File Upload via Backend Server
  const uploadDocumentFile = async (params: {
    file: File;
    propertyId: string;
    docType: PropertyDocument['docType'];
  }) => {
    if (!auth.currentUser) throw new Error('You must be signed in to upload documents.');
    const fileId = makeSafeId('docfile');

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(params.file);
    });

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        fileName: params.file.name,
        mimeType: params.file.type || 'application/pdf',
        base64Data,
        sellerId: auth.currentUser.uid,
        propertyId: params.propertyId,
        docType: params.docType,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to upload document.');
    }

    return response.json();
  };

  // Seller: Submit New Land
  const submitNewLand: LSTContextValue['submitNewLand'] = async (
    landData,
    uploadedDocs,
    requestImmediateVisit
  ) => {
    if (!auth.currentUser || !userProfile) {
      throw new Error('Please log in and complete your profile first.');
    }

    const propertyId = makeSafeId('prop');
    const shortCode = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `SLT-LST-${shortCode}`;
    const now = new Date().toISOString();

    const defaultCategoryImage =
      landData.category === 'Agricultural'
        ? '/assets/land-agri.svg'
        : landData.category === 'Residential'
        ? '/assets/land-res.svg'
        : '/assets/land-comm.svg';

    const images =
      landData.images && landData.images.length > 0
        ? landData.images.slice(0, 10)
        : [defaultCategoryImage];

    const newProperty: PropertyListing = {
      id: propertyId,
      referenceId,
      sellerId: auth.currentUser.uid,
      sellerName: userProfile.fullName.slice(0, 120),
      title: landData.title.trim().slice(0, 160),
      category: landData.category,
      state: landData.state.trim().slice(0, 80),
      district: landData.district.trim().slice(0, 80),
      mandal: (landData.mandal || '').trim().slice(0, 80),
      village: landData.village.trim().slice(0, 100),
      surveyNumber: landData.surveyNumber.trim().slice(0, 60),
      plotNumber: (landData.plotNumber || '').trim().slice(0, 60),
      area: Number(landData.area) || 1,
      areaUnit: landData.areaUnit,
      priceInr: Number(landData.priceInr) || 100000,
      isNegotiable: Boolean(landData.isNegotiable),
      description: (landData.description || '').trim().slice(0, 2000),
      latitude: Number(landData.latitude) || 17.6868,
      longitude: Number(landData.longitude) || 83.2185,
      locationAddress: (landData.locationAddress || '').trim().slice(0, 300),
      roadAccess: (landData.roadAccess || 'Approach Road Available').trim().slice(0, 120),
      waterAvailability: (landData.waterAvailability || 'Available').trim().slice(0, 120),
      electricityAvailability: (landData.electricityAvailability || 'Available').trim().slice(0, 120),
      currentLandUse: (landData.currentLandUse || landData.category).trim().slice(0, 120),
      ownershipDetails: (landData.ownershipDetails || 'Single Owner').trim().slice(0, 500),
      images,
      status: 'Submitted',
      screeningStage: 1,
      screeningStatus: 'Pending Review',
      testingStatus: 'Pending Soil & Boundary Check',
      agentVisitStatus: requestImmediateVisit ? 'Visit Requested' : 'Not Requested',
      registrationAssistanceStatus: 'Awaiting Screening Completion',
      assignedAgentId: '',
      assignedAgentName: '',
      rejectionReason: '',
      publicScreeningSummary: '',
      isFlagged: false,
      isPublished: false,
      isSample: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'properties', propertyId), newProperty);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `properties/${propertyId}`);
    }

    // Save uploaded document metadata records
    for (const d of uploadedDocs) {
      const docId = makeSafeId('pdoc');
      const docRecord: PropertyDocument = {
        id: docId,
        propertyId,
        sellerId: auth.currentUser.uid,
        assignedAgentId: '',
        docType: d.docType,
        fileName: d.fileName.slice(0, 200),
        fileUrl: d.fileUrl.slice(0, 500),
        fileSize: d.fileSize || 0,
        mimeType: (d.mimeType || 'application/pdf').slice(0, 100),
        verificationStatus: 'pending',
        reviewerNotes: '',
        createdAt: now,
        updatedAt: now,
      };
      try {
        await setDoc(doc(db, 'propertyDocuments', docId), docRecord);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `propertyDocuments/${docId}`);
      }
    }

    // Create initial 10-stage Registration Case record
    const caseId = makeSafeId('rcase');
    const regCase: RegistrationCase = {
      id: caseId,
      caseNumber: `SLT-CASE-${shortCode}`,
      propertyId,
      propertyTitle: newProperty.title,
      sellerId: auth.currentUser.uid,
      sellerName: userProfile.fullName.slice(0, 120),
      buyerId: '',
      buyerName: '',
      assignedAgentId: '',
      assignedAgentName: '',
      currentStage: 1,
      status: 'Submitted',
      subRegistrarOffice: `${newProperty.district} Sub-Registrar Office`,
      appointmentDate: '',
      coordinationNotes: 'Stage 1: Land information and initial documents submitted by seller.',
      createdAt: now,
      updatedAt: now,
    };
    try {
      await setDoc(doc(db, 'registrationCases', caseId), regCase);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `registrationCases/${caseId}`);
    }

    // Optional immediate agent visit request
    if (requestImmediateVisit && requestImmediateVisit.preferredDate) {
      await requestAgentInspectionVisit({
        propertyId,
        referenceId,
        propertyTitle: newProperty.title,
        preferredDate: requestImmediateVisit.preferredDate,
        preferredSlot: requestImmediateVisit.preferredSlot || 'Morning (10:00 AM - 1:00 PM)',
        notes: requestImmediateVisit.notes || 'Requested during initial land registration.',
      });
    }

    // Notify Admin & Seller
    await createNotification({
      recipientId: 'admin_broadcast',
      title: `New Land Registered (${referenceId})`,
      message: `${userProfile.fullName} submitted "${newProperty.title}" in ${newProperty.village}, ${newProperty.district} for SLT screening.`,
      category: 'submission',
      link: '/admin',
    });
    await createNotification({
      recipientId: auth.currentUser.uid,
      title: `Land Registered: ${referenceId}`,
      message: `Your property "${newProperty.title}" is now Pending Review. Reference ID: ${referenceId}.`,
      category: 'submission',
      link: '/seller',
    });

    await recordAuditLog({
      action: 'Seller Submitted Land Listing',
      targetCollection: 'properties',
      targetId: propertyId,
      details: `Reference ${referenceId}: ${newProperty.title} (${newProperty.area} ${newProperty.areaUnit})`,
    });

    return { propertyId, referenceId };
  };

  // Seller: Update Allowed Listing Fields
  const updateSellerPropertyFields: LSTContextValue['updateSellerPropertyFields'] = async (
    propertyId,
    updates
  ) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'properties', propertyId), {
        title: updates.title.trim().slice(0, 160),
        priceInr: Number(updates.priceInr) || 100000,
        isNegotiable: Boolean(updates.isNegotiable),
        description: (updates.description || '').trim().slice(0, 2000),
        roadAccess: (updates.roadAccess || '').trim().slice(0, 120),
        waterAvailability: (updates.waterAvailability || '').trim().slice(0, 120),
        electricityAvailability: (updates.electricityAvailability || '').trim().slice(0, 120),
        currentLandUse: (updates.currentLandUse || '').trim().slice(0, 120),
        updatedAt: now,
      });
      await recordAuditLog({
        action: 'Seller Updated Allowed Property Fields',
        targetCollection: 'properties',
        targetId: propertyId,
        details: `Updated title/price/facilities for ${updates.title}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${propertyId}`);
    }
  };

  // Seller: Request Agent Visit
  const requestAgentInspectionVisit: LSTContextValue['requestAgentInspectionVisit'] = async (
    data
  ) => {
    if (!auth.currentUser || !userProfile) throw new Error('Not signed in.');
    const reqId = makeSafeId('insp');
    const now = new Date().toISOString();

    const record: InspectionRequest = {
      id: reqId,
      propertyId: data.propertyId,
      referenceId: data.referenceId.slice(0, 40),
      propertyTitle: data.propertyTitle.slice(0, 160),
      sellerId: auth.currentUser.uid,
      sellerName: userProfile.fullName.slice(0, 120),
      sellerPhone: userProfile.phone.slice(0, 24),
      preferredDate: data.preferredDate.slice(0, 40),
      preferredSlot: (data.preferredSlot || 'Morning').slice(0, 60),
      notes: (data.notes || '').slice(0, 500),
      assignedAgentId: '',
      assignedAgentName: '',
      status: 'Pending Assignment',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'inspectionRequests', reqId), record);
      await updateDoc(doc(db, 'properties', data.propertyId), {
        agentVisitStatus: `Visit Requested (${data.preferredDate})`,
        updatedAt: now,
      });
      await createNotification({
        recipientId: 'admin_broadcast',
        title: `Agent Visit Requested (${data.referenceId})`,
        message: `${userProfile.fullName} requested an on-site agent inspection on ${data.preferredDate}.`,
        category: 'appointment',
        link: '/admin',
      });
      await recordAuditLog({
        action: 'Seller Requested Agent Visit',
        targetCollection: 'inspectionRequests',
        targetId: reqId,
        details: `Property ${data.referenceId} preferred date ${data.preferredDate}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inspectionRequests/${reqId}`);
    }
  };

  // Buyer: Toggle Save Property
  const toggleSaveProperty = async (propertyId: string) => {
    if (!auth.currentUser) throw new Error('Please sign in to save properties.');
    const existingSaved = savedProperties.find(
      (s) => s.propertyId === propertyId && s.userId === auth.currentUser?.uid
    );
    if (existingSaved) {
      try {
        await deleteDoc(doc(db, 'savedProperties', existingSaved.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `savedProperties/${existingSaved.id}`);
      }
    } else {
      const savedId = makeSafeId('saved');
      const record: SavedProperty = {
        id: savedId,
        userId: auth.currentUser.uid,
        propertyId,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'savedProperties', savedId), record);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `savedProperties/${savedId}`);
      }
    }
  };

  // Buyer: Submit Interest / Callback / Site Visit Enquiry
  const submitBuyerEnquiry: LSTContextValue['submitBuyerEnquiry'] = async (data) => {
    if (!auth.currentUser) throw new Error('Please log in to register interest.');
    const id = makeSafeId('enq');
    const code = Math.floor(100000 + Math.random() * 900000);
    const enquiryId = `SLT-ENQ-${code}`;
    const now = new Date().toISOString();

    const record: BuyerEnquiry = {
      id,
      enquiryId,
      propertyId: data.property.id,
      propertyTitle: data.property.title.slice(0, 160),
      propertyReferenceId: (data.property.referenceId || '').slice(0, 40),
      sellerId: data.property.sellerId,
      buyerId: auth.currentUser.uid,
      buyerName: data.buyerName.trim().slice(0, 120),
      buyerEmail: data.buyerEmail.trim().slice(0, 160),
      buyerPhone: data.buyerPhone.trim().slice(0, 24),
      buyerCity: (data.buyerCity || '').trim().slice(0, 80),
      enquiryType: data.enquiryType,
      preferredVisitDate: (data.preferredVisitDate || '').slice(0, 40),
      message: (data.message || '').trim().slice(0, 1000),
      assignedAgentId: data.property.assignedAgentId || '',
      assignedAgentName: data.property.assignedAgentName || '',
      assignedAgentPhone: '',
      status: 'Submitted',
      followUpNotes: 'An SLT Culture agent will contact you shortly.',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'buyerEnquiries', id), record);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `buyerEnquiries/${id}`);
    }

    await createNotification({
      recipientId: 'admin_broadcast',
      title: `New Buyer Enquiry (${enquiryId})`,
      message: `${record.buyerName} submitted "${record.enquiryType}" for ${record.propertyTitle}.`,
      category: 'enquiry',
      link: '/admin',
    });

    if (data.property.sellerId && !data.property.isSample) {
      await createNotification({
        recipientId: data.property.sellerId,
        title: `New Buyer Interest on ${data.property.referenceId}`,
        message: `A verified buyer registered interest (${record.enquiryType}) on "${data.property.title}". SLT Culture is coordinating.`,
        category: 'enquiry',
        link: '/seller',
      });
    }

    await recordAuditLog({
      action: `Buyer Submitted ${data.enquiryType}`,
      targetCollection: 'buyerEnquiries',
      targetId: id,
      details: `Enquiry ${enquiryId} for ${data.property.title}`,
    });

    return { enquiryId };
  };

  // Agent: Update Workflow Status
  const updateAgentWorkStatus: LSTContextValue['updateAgentWorkStatus'] = async (params) => {
    const now = new Date().toISOString();
    const stageMap: Record<AgentWorkflowStatus, { stage: number; propStatus: LifecycleStatus }> = {
      Assigned: { stage: 3, propStatus: 'Under Review' },
      Contacted: { stage: 3, propStatus: 'Under Review' },
      'Visit Scheduled': { stage: 4, propStatus: 'Visit Scheduled' },
      'Inspection Started': { stage: 4, propStatus: 'Visit Scheduled' },
      'Inspection Completed': { stage: 5, propStatus: 'Inspection Complete' },
      'Report Submitted': { stage: 6, propStatus: 'Inspection Complete' },
    };

    const mapped = stageMap[params.newAgentStatus];

    try {
      if (params.assignmentId) {
        await updateDoc(doc(db, 'agentAssignments', params.assignmentId), {
          status: params.newAgentStatus,
          notes: (params.notes || '').slice(0, 1000),
          updatedAt: now,
        });
      }
      if (params.inspectionRequestId) {
        await updateDoc(doc(db, 'inspectionRequests', params.inspectionRequestId), {
          status: params.newAgentStatus,
          notes: (params.notes || '').slice(0, 500),
          updatedAt: now,
        });
      }
      if (params.enquiryId) {
        await updateDoc(doc(db, 'buyerEnquiries', params.enquiryId), {
          status: params.newAgentStatus,
          followUpNotes: (params.notes || `Agent updated status to ${params.newAgentStatus}`).slice(0, 1000),
          updatedAt: now,
        });
        const enq = buyerEnquiries.find((e) => e.id === params.enquiryId);
        if (enq) {
          await createNotification({
            recipientId: enq.buyerId,
            title: `Enquiry ${enq.enquiryId}: ${params.newAgentStatus}`,
            message: `SLT Agent updated your enquiry for "${enq.propertyTitle}" to ${params.newAgentStatus}.`,
            category: 'enquiry',
            link: '/buyer',
          });
        }
      }
      if (params.propertyId && !params.propertyId.startsWith('sample_')) {
        await updateDoc(doc(db, 'properties', params.propertyId), {
          agentVisitStatus: params.newAgentStatus,
          screeningStage: mapped.stage,
          status: mapped.propStatus,
          updatedAt: now,
        });
      }
      await recordAuditLog({
        action: `Agent Status Updated to ${params.newAgentStatus}`,
        targetCollection: 'properties',
        targetId: params.propertyId,
        details: params.notes || `Updated status to ${params.newAgentStatus}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `agentStatus/${params.propertyId}`);
    }
  };

  // Agent: Submit Screening Report
  const submitAgentScreeningReport: LSTContextValue['submitAgentScreeningReport'] = async (
    reportData
  ) => {
    if (!auth.currentUser || !userProfile) throw new Error('Not authorized.');
    const reportId = makeSafeId('srep');
    const now = new Date().toISOString();

    const record: ScreeningReport = {
      id: reportId,
      propertyId: reportData.propertyId,
      sellerId: reportData.sellerId,
      agentId: auth.currentUser.uid,
      agentName: userProfile.fullName.slice(0, 120),
      boundariesVerified: Boolean(reportData.boundariesVerified),
      roadAccessVerified: Boolean(reportData.roadAccessVerified),
      waterVerified: Boolean(reportData.waterVerified),
      electricityVerified: Boolean(reportData.electricityVerified),
      ownershipRecordsChecked: Boolean(reportData.ownershipRecordsChecked),
      soilTestingCompleted: Boolean(reportData.soilTestingCompleted),
      soilQualitySummary: (reportData.soilQualitySummary || '').slice(0, 1000),
      inspectionNotes: (reportData.inspectionNotes || '').slice(0, 2000),
      recommendation: reportData.recommendation,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'screeningReports', reportId), record);
      if (!reportData.propertyId.startsWith('sample_')) {
        await updateDoc(doc(db, 'properties', reportData.propertyId), {
          status: 'Inspection Complete',
          screeningStage: 6,
          screeningStatus: `Report Submitted (${reportData.recommendation})`,
          testingStatus: reportData.soilTestingCompleted
            ? 'Soil & Field Testing Completed'
            : 'Physical Inspection Completed',
          agentVisitStatus: 'Report Submitted',
          publicScreeningSummary: (reportData.soilQualitySummary || reportData.inspectionNotes || '').slice(0, 1000),
          updatedAt: now,
        });
      }
      await createNotification({
        recipientId: 'admin_broadcast',
        title: `Screening Report Submitted`,
        message: `Agent ${userProfile.fullName} submitted a screening report (${reportData.recommendation}).`,
        category: 'submission',
        link: '/admin',
      });
      await createNotification({
        recipientId: reportData.sellerId,
        title: `Site Inspection Report Submitted`,
        message: `Our SLT field agent has submitted the physical verification report for your land. Admin review is underway.`,
        category: 'approval',
        link: '/seller',
      });
      await recordAuditLog({
        action: 'Agent Submitted Land Screening Report',
        targetCollection: 'screeningReports',
        targetId: reportId,
        details: `Property ${reportData.propertyId} recommendation: ${reportData.recommendation}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `screeningReports/${reportId}`);
    }
  };

  // Schedule Appointment
  const schedulePropertyAppointment: LSTContextValue['schedulePropertyAppointment'] = async (
    data
  ) => {
    if (!auth.currentUser || !userProfile) throw new Error('Not signed in.');
    const apptId = makeSafeId('appt');
    const now = new Date().toISOString();

    const record: Appointment = {
      id: apptId,
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle.slice(0, 160),
      agentId: auth.currentUser.uid,
      agentName: userProfile.fullName.slice(0, 120),
      participantId: data.participantId,
      participantName: data.participantName.slice(0, 120),
      participantPhone: (data.participantPhone || '').slice(0, 24),
      participantRole: data.participantRole,
      visitDate: data.visitDate.slice(0, 40),
      visitTime: data.visitTime.slice(0, 40),
      meetingPoint: (data.meetingPoint || 'Property Site Entrance').slice(0, 200),
      status: 'Visit Scheduled',
      notes: (data.notes || '').slice(0, 500),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'appointments', apptId), record);
      await createNotification({
        recipientId: data.participantId,
        title: `Site Visit Scheduled: ${data.visitDate}`,
        message: `SLT Agent ${userProfile.fullName} scheduled a visit for "${data.propertyTitle}" on ${data.visitDate} at ${data.visitTime}.`,
        category: 'appointment',
        link: data.participantRole === 'buyer' ? '/buyer' : '/seller',
      });
      await recordAuditLog({
        action: 'Site Visit Appointment Scheduled',
        targetCollection: 'appointments',
        targetId: apptId,
        details: `${data.propertyTitle} with ${data.participantName} on ${data.visitDate}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `appointments/${apptId}`);
    }
  };

  const updateAppointmentStatus: LSTContextValue['updateAppointmentStatus'] = async (
    appointmentId,
    status,
    notes
  ) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        notes: (notes || '').slice(0, 500),
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
    }
  };

  // Admin: Review Property, Approve & Publish, Reject, Flag, or Update Stage
  const adminReviewProperty: LSTContextValue['adminReviewProperty'] = async (params) => {
    if (!isAdmin) throw new Error('Admin privileges required.');
    const now = new Date().toISOString();
    const { property, decision } = params;

    if (property.isSample) {
      throw new Error('Sample listings are read-only demonstration records. Submit or select a live Firestore listing to modify.');
    }

    const updates: Record<string, any> = { updatedAt: now };

    if (decision === 'approve_publish') {
      updates.status = 'Listed';
      updates.isPublished = true;
      updates.screeningStage = 8;
      updates.screeningStatus = 'Approved & Verified by SLT Admin';
      updates.rejectionReason = '';
      if (params.publicScreeningSummary !== undefined) {
        updates.publicScreeningSummary = params.publicScreeningSummary.slice(0, 1000);
      }
    } else if (decision === 'approve_only') {
      updates.status = 'Approved';
      updates.isPublished = false;
      updates.screeningStage = 7;
      updates.screeningStatus = 'Approved (Ready to Publish)';
    } else if (decision === 'reject') {
      updates.status = 'Rejected';
      updates.isPublished = false;
      updates.screeningStage = 7;
      updates.screeningStatus = 'Rejected';
      updates.rejectionReason = (params.rejectionReason || 'Verification criteria not met.').slice(0, 500);
    } else if (decision === 'flag') {
      updates.isFlagged = true;
      updates.isPublished = false;
    } else if (decision === 'unflag') {
      updates.isFlagged = false;
    } else if (decision === 'update_stage') {
      if (params.lifecycleStatus) updates.status = params.lifecycleStatus;
      if (params.screeningStage) updates.screeningStage = params.screeningStage;
      if (params.testingStatus !== undefined) updates.testingStatus = params.testingStatus.slice(0, 80);
      if (params.registrationAssistanceStatus !== undefined) {
        updates.registrationAssistanceStatus = params.registrationAssistanceStatus.slice(0, 80);
      }
      if (params.publicScreeningSummary !== undefined) {
        updates.publicScreeningSummary = params.publicScreeningSummary.slice(0, 1000);
      }
      if (params.lifecycleStatus === 'Listed') {
        updates.isPublished = true;
      }
    }

    try {
      await updateDoc(doc(db, 'properties', property.id), updates);

      // Sync Registration Case stage
      const matchingCase = registrationCases.find((c) => c.propertyId === property.id);
      if (matchingCase) {
        await updateDoc(doc(db, 'registrationCases', matchingCase.id), {
          currentStage: updates.screeningStage ?? matchingCase.currentStage,
          status: updates.status ?? matchingCase.status,
          updatedAt: now,
        });
      }

      await createNotification({
        recipientId: property.sellerId,
        title: `Property Update (${property.referenceId}): ${updates.status || decision}`,
        message:
          decision === 'approve_publish'
            ? `Congratulations! Your property "${property.title}" has been approved and published on the SLT Culture marketplace.`
            : decision === 'reject'
            ? `Your property "${property.title}" was not approved. Reason: ${updates.rejectionReason}`
            : `Admin updated screening status for "${property.title}" to ${updates.status || decision}.`,
        category: 'approval',
        link: '/seller',
      });

      await recordAuditLog({
        action: `Admin Property Decision: ${decision}`,
        targetCollection: 'properties',
        targetId: property.id,
        details: `${property.referenceId} (${property.title}) -> ${JSON.stringify(updates)}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${property.id}`);
    }
  };

  // Admin: Assign Agent to Property Inspection or Buyer Enquiry
  const adminAssignAgent: LSTContextValue['adminAssignAgent'] = async (params) => {
    if (!isAdmin) throw new Error('Admin privileges required.');
    const assignId = makeSafeId('assign');
    const now = new Date().toISOString();

    const assignment: AgentAssignment = {
      id: assignId,
      agentId: params.agent.uid,
      agentName: params.agent.fullName.slice(0, 120),
      assignmentType: params.targetType,
      propertyId: params.property.id,
      propertyTitle: params.property.title.slice(0, 160),
      relatedRecordId: (params.relatedRecordId || '').slice(0, 128),
      contactName: (params.contactName || params.property.sellerName || '').slice(0, 120),
      contactPhone: (params.contactPhone || '').slice(0, 24),
      status: 'Assigned',
      notes: (params.notes || 'Assigned by SLT Administrator.').slice(0, 1000),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'agentAssignments', assignId), assignment);

      if (!params.property.isSample) {
        await updateDoc(doc(db, 'properties', params.property.id), {
          assignedAgentId: params.agent.uid,
          assignedAgentName: params.agent.fullName.slice(0, 120),
          agentVisitStatus: 'Agent Assigned',
          status: params.property.status === 'Submitted' ? 'Under Review' : params.property.status,
          screeningStage: Math.max(params.property.screeningStage || 1, 3),
          updatedAt: now,
        });

        // Grant agent access to property documents
        const propDocs = propertyDocuments.filter((d) => d.propertyId === params.property.id);
        for (const pdoc of propDocs) {
          await updateDoc(doc(db, 'propertyDocuments', pdoc.id), {
            assignedAgentId: params.agent.uid,
            updatedAt: now,
          });
        }
      }

      if (params.targetType === 'Property Inspection' && params.relatedRecordId) {
        await updateDoc(doc(db, 'inspectionRequests', params.relatedRecordId), {
          assignedAgentId: params.agent.uid,
          assignedAgentName: params.agent.fullName.slice(0, 120),
          status: 'Assigned',
          updatedAt: now,
        });
      }

      if (params.targetType === 'Buyer Enquiry' && params.relatedRecordId) {
        await updateDoc(doc(db, 'buyerEnquiries', params.relatedRecordId), {
          assignedAgentId: params.agent.uid,
          assignedAgentName: params.agent.fullName.slice(0, 120),
          assignedAgentPhone: (params.agent.phone || '').slice(0, 24),
          status: 'Assigned',
          updatedAt: now,
        });
        const enq = buyerEnquiries.find((e) => e.id === params.relatedRecordId);
        if (enq) {
          await createNotification({
            recipientId: enq.buyerId,
            title: `SLT Agent Assigned to ${enq.enquiryId}`,
            message: `Agent ${params.agent.fullName} has been assigned to assist you with "${params.property.title}".`,
            category: 'assignment',
            link: '/buyer',
          });
        }
      }

      await createNotification({
        recipientId: params.agent.uid,
        title: `New ${params.targetType} Assignment`,
        message: `You have been assigned to "${params.property.title}" (${params.targetType}).`,
        category: 'assignment',
        link: '/agent',
      });

      if (params.property.sellerId && !params.property.isSample) {
        await createNotification({
          recipientId: params.property.sellerId,
          title: `Agent Assigned: ${params.agent.fullName}`,
          message: `SLT Field Agent ${params.agent.fullName} has been assigned to coordinate verification for "${params.property.title}".`,
          category: 'assignment',
          link: '/seller',
        });
      }

      await recordAuditLog({
        action: `Admin Assigned Agent (${params.targetType})`,
        targetCollection: 'agentAssignments',
        targetId: assignId,
        details: `Assigned ${params.agent.fullName} to ${params.property.title}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `agentAssignments/${assignId}`);
    }
  };

  // Admin: Verify or Reject Uploaded Property Document
  const adminUpdateDocumentVerification: LSTContextValue['adminUpdateDocumentVerification'] = async (
    docItem,
    status,
    reviewerNotes
  ) => {
    if (!isAgent) throw new Error('Staff privileges required.');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'propertyDocuments', docItem.id), {
        verificationStatus: status,
        reviewerNotes: reviewerNotes.trim().slice(0, 500),
        updatedAt: now,
      });
      await recordAuditLog({
        action: `Document Marked ${status}`,
        targetCollection: 'propertyDocuments',
        targetId: docItem.id,
        details: `${docItem.docType} (${docItem.fileName}) -> ${status}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `propertyDocuments/${docItem.id}`);
    }
  };

  // Admin: Change User Role (Authorize Agent / Admin)
  const adminChangeUserRole: LSTContextValue['adminChangeUserRole'] = async (
    targetUser,
    newRole,
    accountStatus
  ) => {
    if (!isAdmin) throw new Error('Only administrators can assign privileged roles.');
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        role: newRole,
        accountStatus: accountStatus || targetUser.accountStatus || 'active',
        verificationStatus: 'verified',
        updatedAt: now,
      });
      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', targetUser.uid), {
          uid: targetUser.uid,
          email: targetUser.email,
          assignedAt: now,
        });
      }
      await createNotification({
        recipientId: targetUser.uid,
        title: `Account Role Updated: ${newRole.toUpperCase()}`,
        message: `An SLT Culture Administrator updated your platform access role to ${newRole}.`,
        category: 'approval',
        link: newRole === 'agent' ? '/agent' : newRole === 'admin' ? '/admin' : '/',
      });
      await recordAuditLog({
        action: `Changed User Role to ${newRole}`,
        targetCollection: 'users',
        targetId: targetUser.uid,
        details: `${targetUser.fullName} (${targetUser.email}) -> role: ${newRole}`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  // Admin: Upsert Registration Case
  const adminUpsertRegistrationCase: LSTContextValue['adminUpsertRegistrationCase'] = async (
    caseData
  ) => {
    if (!isAgent) throw new Error('Authorized staff required.');
    const now = new Date().toISOString();
    const existingCase = registrationCases.find(
      (c) => c.id === caseData.id || c.propertyId === caseData.propertyId
    );

    if (existingCase) {
      try {
        await updateDoc(doc(db, 'registrationCases', existingCase.id), {
          buyerId: (caseData.buyerId ?? existingCase.buyerId ?? '').slice(0, 128),
          buyerName: (caseData.buyerName ?? existingCase.buyerName ?? '').slice(0, 120),
          assignedAgentId: (caseData.assignedAgentId ?? existingCase.assignedAgentId ?? '').slice(0, 128),
          assignedAgentName: (caseData.assignedAgentName ?? existingCase.assignedAgentName ?? '').slice(0, 120),
          currentStage: Number(caseData.currentStage ?? existingCase.currentStage) || 1,
          status: caseData.status ?? existingCase.status,
          subRegistrarOffice: (caseData.subRegistrarOffice ?? existingCase.subRegistrarOffice ?? '').slice(0, 160),
          appointmentDate: (caseData.appointmentDate ?? existingCase.appointmentDate ?? '').slice(0, 40),
          coordinationNotes: (caseData.coordinationNotes ?? existingCase.coordinationNotes ?? '').slice(0, 1000),
          updatedAt: now,
        });
        await recordAuditLog({
          action: 'Updated Registration Assistance Case',
          targetCollection: 'registrationCases',
          targetId: existingCase.id,
          details: `Stage ${caseData.currentStage} (${caseData.status}) for ${existingCase.propertyTitle}`,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `registrationCases/${existingCase.id}`);
      }
    } else {
      const id = makeSafeId('rcase');
      const code = Math.floor(100000 + Math.random() * 900000);
      const newCase: RegistrationCase = {
        id,
        caseNumber: `SLT-CASE-${code}`,
        propertyId: caseData.propertyId,
        propertyTitle: caseData.propertyTitle.slice(0, 160),
        sellerId: caseData.sellerId,
        sellerName: caseData.sellerName.slice(0, 120),
        buyerId: (caseData.buyerId || '').slice(0, 128),
        buyerName: (caseData.buyerName || '').slice(0, 120),
        assignedAgentId: (caseData.assignedAgentId || '').slice(0, 128),
        assignedAgentName: (caseData.assignedAgentName || '').slice(0, 120),
        currentStage: Number(caseData.currentStage) || 9,
        status: caseData.status || 'Registration in Progress',
        subRegistrarOffice: (caseData.subRegistrarOffice || '').slice(0, 160),
        appointmentDate: (caseData.appointmentDate || '').slice(0, 40),
        coordinationNotes: (caseData.coordinationNotes || '').slice(0, 1000),
        createdAt: now,
        updatedAt: now,
      };
      try {
        await setDoc(doc(db, 'registrationCases', id), newCase);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `registrationCases/${id}`);
      }
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  return (
    <LSTContext.Provider
      value={{
        firebaseUser,
        userProfile,
        authLoading,
        needsOnboarding,
        isAdmin,
        isAgent,
        showSampleListings,
        setShowSampleListings,
        compareIds,
        toggleCompareProperty,
        clearCompare,
        publishedProperties,
        allProperties,
        mySellerProperties,
        propertyDocuments,
        screeningReports,
        inspectionRequests,
        buyerEnquiries,
        savedProperties,
        agentAssignments,
        appointments,
        registrationCases,
        notifications,
        auditLogs,
        allUsers,
        loginWithGoogle,
        signupWithEmail,
        loginWithEmail,
        resetPassword,
        resendVerification,
        logoutUser,
        completeOnboarding,
        updateUserProfileData,
        submitNewLand,
        updateSellerPropertyFields,
        requestAgentInspectionVisit,
        uploadDocumentFile,
        toggleSaveProperty,
        submitBuyerEnquiry,
        updateAgentWorkStatus,
        submitAgentScreeningReport,
        schedulePropertyAppointment,
        updateAppointmentStatus,
        adminReviewProperty,
        adminAssignAgent,
        adminUpdateDocumentVerification,
        adminChangeUserRole,
        adminUpsertRegistrationCase,
        markNotificationRead,
      }}
    >
      {children}
    </LSTContext.Provider>
  );
};

export function useLST() {
  const ctx = useContext(LSTContext);
  if (!ctx) throw new Error('useLST must be used within LSTProvider');
  return ctx;
}
