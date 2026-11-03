# SLT Culture – Land Screening and Transforming (LST)

**Tagline:** *"Your Land. Our Responsibility. A Better Future."*

A complete, production-oriented, real-time land management, screening, verification, and real estate transaction platform built with React, TypeScript, Tailwind CSS, Express, Firebase (Authentication + Cloud Firestore), and Google Maps Platform.

---

## 1. Architecture & Core Capabilities

- **Official Branding:** SLT Culture logo (`/public/assets/aistudio/image_de4003f1.png`) and workflow architecture (`/public/assets/aistudio/image_fdd9555b.png`) with Forest Green (`#124A32`), Fresh Green (`#82B440`), Gold (`#D5AD51`), and Dark Charcoal (`#17251D`).
- **Real-Time Firebase Integration:**
  - **Authentication:** Google Sign-In, Email/Password Signup & Login, Password Reset, Email Verification, persistent sessions, and first-login Role Onboarding (`Buyer`, `Seller`, `Both Buyer and Seller`).
  - **Cloud Firestore (12 Collections):** `users`, `properties`, `sellerSubmissions`, `buyerInterests`, `agentVisits`, `landVerifications`, `testReports`, `agents`, `adminLogs`, `contactMessages`, `savedProperties`, `propertyDocuments`.
- **10-Stage Land Screening & Transforming (LST) Pipeline:**
  1. `Submitted`
  2. `Under Initial Review`
  3. `Seller Contacted`
  4. `Agent Assigned`
  5. `Field Visit Scheduled`
  6. `Land Screening & Testing in Progress`
  7. `Documents Under Review`
  8. `Verified Ready for Listing`
  9. `Clarification Needed`
  10. `Rejected`
- **4 Dedicated Role-Protected Dashboards:**
  - **Buyer Dashboard (`/buyer`):** Saved properties, submitted purchase enquiries, scheduled site visits, and assigned agent updates.
  - **Seller Dashboard (`/seller`):** Submitted land parcels, live 10-stage screening progress tracker, assigned agent details, and registration support status.
  - **Agent Dashboard (`/agent`):** Assigned seller & buyer field visits, GPS boundary check-in, and field verification report submission.
  - **Admin Dashboard (`/admin`):** Full pipeline command center, property screening stage manager, agent assignment, document verification & test report publishing, role management, and immutable audit logs.

---

## 2. Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Configuration:**
   Copy `.env.example` to `.env` if running outside AI Studio:
   ```bash
   cp .env.example .env
   ```
3. **Start the Full-Stack Development Server (Port 3000):**
   ```bash
   npm run dev
   ```
4. **Deploy or Validate Firestore Security Rules:**
   ```bash
   npx eslint firestore.rules
   ```

---

## 3. Deploying from Google AI Studio to Google Cloud Run

1. Click **Deploy to Cloud Run** in the top-right bar of Google AI Studio.
2. Select or confirm your Google Cloud Project.
3. Cloud Run builds the production bundle (`npm run build`) and starts the Express + static server (`npm start` -> `node server.ts`) on port `3000`.
4. Once deployed, copy your `.run.app` service URL and add it to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## 4. Deploying or Connecting to Vercel (Optional Frontend / Hybrid Deployment)

A `vercel.json` configuration is included at the project root:
1. Push this repository to GitHub.
2. Import the repository in **Vercel**.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add your custom domain or `.vercel.app` domain to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## 5. Connecting a Custom Domain & HTTPS

1. **Google Cloud Run Custom Domain Mapping:**
   - Open Google Cloud Console → Cloud Run → Manage Custom Domains.
   - Map your domain (e.g., `sltculture.com` or `app.sltculture.com`) and update your DNS `A`/`AAAA` or `CNAME` records as instructed.
   - Google Cloud automatically provisions and renews a managed SSL/TLS certificate for HTTPS.
2. **Firebase Authorized Domains:**
   - In Firebase Console → Authentication → Settings → Authorized domains, add your custom domain so Google OAuth popups and email verification links work seamlessly.

---

## 6. Production Security Checklist

- [x] **No Default Hardcoded Admin Passwords:** Zero hardcoded credentials in source code.
- [x] **Privilege Escalation Prevention:** New signups can only select `buyer`, `seller`, or `both`. Only verified server/Firestore administrators can assign `agent` or `admin` roles.
- [x] **Database-Level Security (`firestore.rules`):** Every collection validates authentication, ownership, schema fields, and data types. Private seller ownership documents and legal notes are restricted to the owner, assigned agent, and admins.
- [x] **Protected Document Streaming (`/api/documents/protected/:fileId`):** Private title deeds and EC documents require an explicit role header and are never exposed on public property cards.
- [x] **API Rate Limiting & Security Headers:** Express backend enforces per-IP rate limiting (`120 req/min`), `X-Content-Type-Options: nosniff`, and strict referrer policies.
