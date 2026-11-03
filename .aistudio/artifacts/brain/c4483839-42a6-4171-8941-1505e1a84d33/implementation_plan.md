# SLT Culture – Land Screening and Transforming (LST)

A production-grade, real-time land screening, verification, and transaction management platform that connects landowners with buyers through human-verified site inspections, soil and document screening, agent coordination, and registration assistance across India.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices have been confirmed from your responses and incorporated into the specification:

- **Confirmed Decision 1 — Property Locations & Maps**: Interactive map integration using Google Maps Platform (`@vis.gl/react-google-maps` with `AdvancedMarkerElement` and Demo Key provisioning) paired with structured regional metadata (State, District, Mandal/Taluk, Village, Survey Number) and a clean coordinate/external map pin fallback whenever map tiles are unconfigured.
- **Confirmed Decision 2 — Sample Listings & Test Data**: Clearly labeled `[SAMPLE TEST LISTING]` properties will be available with an instant Admin & Browse visibility toggle so you can immediately test the buyer, comparison, enquiry, and screening workflows alongside live user-submitted properties.
- **Confirmed Decision 3 — Document Storage & Privacy**: Property ownership deeds, encumbrance certificates, survey maps, and soil testing reports will be handled via secure server/local file storage and Firestore `propertyDocuments` metadata records, strictly isolated so only the property owner, assigned field agent, and authorized administrators can view or download them.

---

## 1. Overview & Core Concept

- **What It Does**: SLT Culture (Land Screening and Transforming) digitizes the end-to-end land lifecycle—from landowner submission and document intake to physical agent site inspections, soil/screening reports, administrative verification, buyer discovery, site visit scheduling, and registration coordination.
- **Target Audience / Persona**:
  - **Land Sellers (Landowners)**: Property owners seeking a trusted, transparent channel to verify and list agricultural, residential, commercial, or industrial land without exposing private title documents to the general public.
  - **Land Buyers & Investors**: Individuals and organizations looking to discover, compare, and acquire verified land parcels in Indian Rupees (`₹`) with clear screening status and guided site visits.
  - **SLT Field Agents**: Authorized inspection personnel who verify physical boundaries, road access, utilities, and soil conditions on-site and coordinate buyer visits.
  - **SLT Administrators**: Platform operators who review legal documents, assign field agents, approve or reject listings, manage staff roles, and oversee registration assistance cases.
- **Key Value**: Eliminates unverified listings and opaque broker chains by enforcing a structured 10-stage human verification and registration assistance workflow before and after a property goes live.

---

## 2. User Experience & Visual Design

### Key User Flows (Aligned with the SLT Culture Flowchart)

1. **Authentication & Role Selection (`Start → Log-In / Sign Up → Buyer and Seller Page`)**:
   - Users sign in via **Continue with Google** or **Email & Password** (including email verification and password reset).
   - First-time users complete their profile (Full Name, Phone Number, City/State) and choose their operational mode: **Buyer**, **Seller**, or **Both Buyer and Seller** (with seamless switching between Buyer and Seller workspaces).
   - Privileged roles (**Agent** and **Admin**) are strictly controlled via server-side and database-enforced authorization—never self-assigned during signup.

2. **Seller Journey (`Seller → Personal Details → Land Details → Register → Agent Will Arrive`)**:
   - Multi-step validated submission wizard:
     - **Step 1: Seller Personal Details** (Full name, email, mobile number, optional alternative contact, address, city, state, PIN code, privacy consent).
     - **Step 2: Land & Location Details** (Property title, category: Agricultural / Residential / Commercial / Industrial, State, District, Mandal/Taluk, Village/Locality, Survey Number, Plot Number, Land Area & Unit: Acres / Cents / Sq. Ft. / Sq. Yards, Expected Price in `₹`, Negotiable toggle, road access, water & electricity availability, current land use, ownership type, and interactive map pin).
     - **Step 3: Protected Document & Photo Upload** (Ownership document, Sale deed, Encumbrance certificate, Land tax records, Survey documents, Land photos, and optional soil testing reports with file type/size validation).
     - **Step 4: Review, Register & Request Agent Visit**: Generates a unique Registration Reference ID (e.g., `SLT-LST-2026-XXXX`), sets status to `Submitted` / `Pending Review`, notifies the Admin Dashboard in real time, and lets the seller request an on-site agent visit.

3. **Buyer Journey (`Buyer → Shows Land Details and Prices → Selection → Personal Details → Register → Agent Will Approach You`)**:
   - Buyers browse approved, listed properties with multi-criteria filtering (State, District/City, Category, Min/Max Price in `₹`, Min/Max Area, Verification Status, and sorting by Newest, Price, or Area), interactive map view, side-by-side property comparison (up to 3 lands), and saved favourites.
   - Upon selecting a property, the buyer reviews verified specifications, facilities, public screening summary, and map location.
   - To proceed, the buyer enters/confirms their personal details and registers interest (or requests a callback / site visit). The platform generates an Enquiry ID (`SLT-ENQ-XXXX`), notifies the administrator, enables agent assignment, and displays *"An SLT Culture agent will contact you"* with live status tracking in the Buyer Dashboard.

4. **10-Stage Land Screening & Registration Lifecycle**:
   - Every parcel tracks a transparent 10-stage timeline across Seller, Agent, and Admin views:
     `01. Land Information Collection` → `02. Document Review` → `03. Ownership Record Verification` → `04. Physical Site Inspection` → `05. Soil / Land Testing` → `06. Screening Report Preparation` → `07. Administrative Decision` → `08. Buyer & Seller Coordination` → `09. Registration Assistance` → `10. Case Closure`.
   - Standardized status states: `Submitted`, `Under Review`, `Visit Scheduled`, `Inspection Complete`, `Documents Pending`, `Approved`, `Rejected`, `Listed`, `Negotiation`, `Registration in Progress`, and `Closed`.

### Visual Identity & Theme

- **Aesthetic Direction**: Authoritative, heritage-grade Indian land stewardship and real estate advisory—combining editorial architectural warmth with high-density operational clarity.
- **Brand Assets**: The official uploaded **SLT Culture** logo (`/assets/aistudio/image_de4003f1.png`) is embedded directly in the sticky header, authentication screens, navigation drawer, and footer.
- **Color Palette (60-30-10 Discipline)**:
  - **60% Dominant Neutral Canvas**: Crisp White (`#FFFFFF`) primary background and soft warm stone (`#F7F9F7`) structural section surfaces.
  - **30% Brand Structural Authority**: **Forest Green (`#124A32`)** for primary headers, authority banners, active navigation states, and primary action buttons; **Dark Charcoal (`#17251D`)** for high-contrast body typography; **Fresh Green (`#82B440`)** for verified screening progression and agricultural/land vitality accents.
  - **10% High-Intent Accent**: **Gold (`#D5AD51`)** reserved for primary focal calls-to-action, verification seals, and active step highlights.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - **Display / Headings**: `Playfair Display` (matching the classic serif aesthetic of the SLT Culture wordmark) for hero headlines (`clamp(2.25rem, 4vw, 3.75rem)`), section titles, and property titles with `text-wrap: balance`.
  - **Body Prose & UI Controls**: `Plus Jakarta Sans` (Regular 400, Medium 500, SemiBold 600) for clean form labels, descriptions, and navigation.
  - **Tabular Data & Financial Metrics**: `JetBrains Mono` with `tabular-nums` for Indian Rupee (`₹`) prices (formatted in Lakhs/Crores and exact numerals), survey numbers, land areas, reference IDs, and timestamps.
- **Component & Spatial Architecture**:
  - **Top Bar Contract**: Clean 3-zone sticky header (`SLT Culture` official logo lockup on left — concise single-line navigation links in center — role dashboard switcher / primary action on right) occupying `<10%` of viewport height on mobile with an accessible hamburger drawer.
  - **Zero-Pill Metadata Discipline**: Property card metadata (Category · Area · District · Survey No.) rendered as clean inline typography separated by `·` dot dividers rather than cluttered badge sandwiches.
  - **Interactive Feedback & Motion**: Smooth 150ms–200ms compositor transitions (`opacity`, `transform`), inline field validation, duplicate-submission locks, skeleton loading states, and persistent real-time notification centre.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Separation of Public Marketplace vs. Private Document Vault**
  - *Chosen Approach*: Split public property listing metadata (`properties` collection) from sensitive legal/ownership records (`propertyDocuments` collection + protected upload storage) and seller contact details.
  - *Why*: Buyers need rich property discovery (photos, survey locality, utilities, screening summary, price in `₹`), but sellers' personal phone numbers, addresses, and title deeds must never be exposed publicly without explicit admin authorization.
- **Decision 2: Real-Time Multi-Role Synchronization via Cloud Firestore**
  - *Chosen Approach*: Use real-time `onSnapshot` listeners across all 12 collections paired with a Express/Node.js backend (`server.ts`) for protected file handling, role verification, and administrative audit logging.
  - *Why*: Ensures that when a seller registers land, an admin approves a listing, or an agent schedules a site visit, the corresponding dashboards and notification feeds update instantaneously and persist across refreshes and sessions.
- **Decision 3: Human-in-the-Loop Verification & Registration Assistance**
  - *Chosen Approach*: Represent land screening and registration assistance as a structured, auditable 10-step human coordination workflow with explicit legal disclaimers rather than automated title certification.
  - *Why*: Respects real-world Indian land revenue and sub-registrar procedures where physical inspection, encumbrance review, and human professional verification are mandatory.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        SLT CULTURE – LST WEB PLATFORM (React + TS)                  │
├──────────────────────────────────────────┬──────────────────────────────────────────┤
│         PUBLIC & DISCOVERY VIEWS         │      PROTECTED ROLE WORKSPACES           │
│  ┌────────────────────────────────────┐  │  ┌────────────────────────────────────┐  │
│  │ Public Layout & Sticky Top Bar     │  │  │ Auth & Onboarding Gate             │  │
│  │ • Home (Hero, Screening, Featured) │  │  │ • Google Sign-In & Email/Password  │  │
│  │ • About SLT Culture & How It Works │  │  │ • Email Verification & Reset       │  │
│  │ • Browse Land (Filters + Map View) │  │  │ • Buyer / Seller / Both Selector   │  │
│  │ • Property Details & Compare Drawer│  │  ├────────────────────────────────────┤  │
│  │ • Sell Your Land (Flow Overview)   │  │  │ • Seller Dashboard (/seller)       │  │
│  │ • Contact Us, Privacy & Terms      │  │  │ • Buyer Dashboard (/buyer)         │  │
│  └─────────────────┬──────────────────┘  │  │ • Agent Portal (/agent)            │  │
│                    │                     │  │ • Admin Control Center (/admin)    │  │
│                    ▼                     │  └─────────────────┬──────────────────┘  │
├──────────────────────────────────────────┴────────────────────┴─────────────────────┤
│                  STATE, REAL-TIME LISTENERS & SERVICES LAYER                        │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────┐ │
│  │ Firebase Auth + RBAC    │  │ Firestore Live Store    │  │ Google Maps Platform │ │
│  │ • Persistent Session    │  │ • onSnapshot Listeners  │  │ • @vis.gl/react-     │ │
│  │ • Role Guard (Buyer,    │  │ • handleFirestoreError  │  │   google-maps        │ │
│  │   Seller, Agent, Admin) │  │ • Audit & Notification  │  │ • AdvancedMarker     │ │
│  │                         │  │   Dispatchers           │  │ • Coordinate Fallback│ │
│  └────────────┬────────────┘  └────────────┬────────────┘  └──────────┬───────────┘ │
└───────────────┼────────────────────────────┼──────────────────────────┼─────────────┘
                │                            │                          │
                ▼                            ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│          FIREBASE BACKEND (Firestore + Rules) & EXPRESS SERVER (server.ts)          │
│  • 12 Collections: users, properties, propertyDocuments, screeningReports,          │
│    inspectionRequests, buyerEnquiries, savedProperties, agentAssignments,           │
│    appointments, registrationCases, notifications, auditLogs                        │
│  • Express API (/api/*): Protected Document Upload/Retrieval, Admin Role Management │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Collections (`Cloud Firestore`)

1. **`users`**: `uid`, `fullName`, `email`, `phone`, `altPhone`, `address`, `city`, `state`, `pinCode`, `userType` (`buyer` | `seller` | `both`), `role` (`user` | `agent` | `admin`), `emailVerified`, `status` (`active` | `suspended`), `createdAt`, `updatedAt`.
2. **`properties`**: `id`, `referenceId` (`SLT-LST-XXXX`), `sellerId`, `title`, `category` (`Agricultural` | `Residential` | `Commercial` | `Industrial`), `state`, `district`, `mandal`, `village`, `surveyNumber`, `plotNumber`, `area`, `areaUnit` (`Acres` | `Cents` | `Sq. Ft.` | `Sq. Yards`), `priceInr`, `isNegotiable`, `description`, `latitude`, `longitude`, `locationAddress`, `roadAccess`, `waterAvailability`, `electricityAvailability`, `currentLandUse`, `ownershipDetails`, `images` (bounded array), `status` (11 lifecycle states), `screeningStage` (1–10), `testingStatus`, `agentVisitStatus`, `registrationAssistanceStatus`, `assignedAgentId`, `assignedAgentName`, `rejectionReason`, `isFlagged`, `isPublished`, `isSample`, `publicScreeningSummary`, `createdAt`, `updatedAt`.
3. **`propertyDocuments`**: `id`, `propertyId`, `sellerId`, `docType` (`ownership` | `sale_deed` | `ec` | `tax_record` | `survey` | `soil_report` | `other`), `fileName`, `fileUrl`, `fileSize`, `mimeType`, `verificationStatus` (`pending` | `verified` | `rejected`), `reviewerNotes`, `createdAt`.
4. **`screeningReports`**: `id`, `propertyId`, `agentId`, `agentName`, `boundariesVerified`, `roadAccessVerified`, `waterVerified`, `electricityVerified`, `soilQualityNotes`, `encumbranceNotes`, `overallRecommendation` (`approve` | `reject` | `needs_more_info`), `checklist` (map), `reportPhotos`, `submittedAt`.
5. **`inspectionRequests`**: `id`, `propertyId`, `referenceId`, `sellerId`, `sellerName`, `sellerPhone`, `preferredDate`, `preferredTimeSlot`, `notes`, `assignedAgentId`, `assignedAgentName`, `status` (`Requested` | `Assigned` | `Visit Scheduled` | `Inspection Started` | `Inspection Completed` | `Report Submitted`), `createdAt`, `updatedAt`.
6. **`buyerEnquiries`**: `id`, `enquiryId` (`SLT-ENQ-XXXX`), `propertyId`, `propertyTitle`, `propertyReferenceId`, `buyerId`, `buyerName`, `buyerEmail`, `buyerPhone`, `buyerCity`, `enquiryType` (`interest` | `callback` | `site_visit`), `preferredVisitDate`, `message`, `assignedAgentId`, `assignedAgentName`, `status` (`Submitted` | `Assigned` | `Contacted` | `Visit Scheduled` | `Negotiation` | `Registration in Progress` | `Closed`), `agentNotes`, `createdAt`, `updatedAt`.
7. **`savedProperties`**: `id`, `userId`, `propertyId`, `createdAt`.
8. **`agentAssignments`**: `id`, `agentId`, `agentName`, `targetType` (`property_inspection` | `buyer_enquiry`), `targetId`, `propertyId`, `propertyTitle`, `assignedByAdminId`, `status` (`Assigned` | `Contacted` | `Visit Scheduled` | `Inspection Started` | `Inspection Completed` | `Report Submitted`), `notes`, `createdAt`, `updatedAt`.
9. **`appointments`**: `id`, `propertyId`, `propertyTitle`, `agentId`, `agentName`, `participantId` (buyer or seller UID), `participantRole` (`buyer` | `seller`), `participantName`, `participantPhone`, `scheduledAt`, `locationNotes`, `purpose` (`site_inspection` | `buyer_site_visit` | `document_verification`), `status` (`Scheduled` | `Completed` | `Rescheduled` | `Cancelled`), `createdAt`, `updatedAt`.
10. **`registrationCases`**: `id`, `caseReferenceId` (`SLT-REG-XXXX`), `propertyId`, `propertyTitle`, `sellerId`, `buyerId`, `assignedAgentId`, `currentStage` (Stages 1–10), `status` (`Documents Pending` | `Under Review` | `Registration in Progress` | `Closed`), `subRegistrarOffice`, `targetDate`, `milestoneNotes`, `createdAt`, `updatedAt`.
11. **`notifications`**: `id`, `recipientId` (UID or `'admin_broadcast'`), `title`, `message`, `type` (`submission` | `approval` | `enquiry` | `assignment` | `appointment` | `status_update`), `link`, `isRead`, `createdAt`.
12. **`auditLogs`**: `id`, `actorId`, `actorEmail`, `actorRole`, `action`, `targetCollection`, `targetId`, `details`, `createdAt`.

### Interactive Component & State Mapping

- **Public Pages (`Home`, `About`, `Browse Land`, `Land Details`, `How It Works`, `Sell Your Land`, `Contact Us`, `Privacy Policy`, `Terms & Conditions`)**:
  - `Browse Land` provides live search and multi-filter controls (State, District, Category, Price range in `₹`, Area range, Verification status, Sort selector), an interactive Map/Grid split toggle, a Sample Data visibility switch, and a sticky Compare Drawer allowing side-by-side comparison of up to 3 properties.
  - `Land Details` renders high-resolution imagery, a 10-stage verification badge & progress bar, public testing report summary, facility checklist, interactive Google Map pin, Favourite toggle, and the **Register Interest / Request Site Visit** modal wired directly to `buyerEnquiries`.
- **Seller Dashboard (`/seller`)**:
  - Displays seller KPIs, "My Land Listings" table with live status timelines (`Screening`, `Testing`, `Agent Visit`, `Registration Assistance`), "Add New Land" 4-step wizard, "Edit Allowed Listing Fields" modal (for price, description, and negotiable flag while preserving verified fields), document vault uploader, agent visit scheduler, buyer enquiry count, and real-time notifications.
- **Buyer Dashboard (`/buyer`)**:
  - Displays tracked enquiries (`buyerEnquiries`) with live status progression, scheduled site visits (`appointments`) with assigned SLT agent contact details, saved favourites grid (`savedProperties`), side-by-side property comparator, and active registration assistance tracker.
- **Agent Dashboard (`/agent`)**:
  - Provides assigned land inspections and buyer enquiries, authorized contact details for active assignments only, appointment scheduler, interactive **Land Verification Checklist** (boundary check, road width, water source, power line, soil observation), photo/report uploader (`screeningReports`), and status updater (`Assigned` → `Contacted` → `Visit Scheduled` → `Inspection Started` → `Inspection Completed` → `Report Submitted`).
- **Admin Dashboard (`/admin`)**:
  - Full executive overview with live metrics (Total Buyers, Total Sellers, Properties Submitted, Awaiting Verification, Approved/Rejected, Pending Enquiries, Active Agent Assignments, Scheduled Visits, Registration Cases).
  - **Land Management Tab**: Inspect submissions, view private ownership documents, update 10-stage screening/testing status, approve & publish listings, reject with recorded reasons, or flag suspicious/duplicate listings.
  - **Agent & Case Management Tab**: Authorize users as field agents, assign/reassign agents to property inspections and buyer enquiries, review submitted `screeningReports`, and manage `registrationCases`.
  - **User & Audit Management Tab**: Search/filter buyers, sellers, and staff; manage account status; inspect immutable `auditLogs` for every privileged action; and toggle sample listing visibility.
