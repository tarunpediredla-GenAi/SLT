# SLT Culture – LST Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Identity & Privilege Escalation Guard**: New users creating `/users/{userId}` can only set `role == 'user'` (unless they match the verified bootstrap administrator email `tarunpediredla9966@gmail.com`). Users can never self-assign `agent` or `admin` roles.
2. **PII & Private Document Isolation**: `/users/{userId}` and `/propertyDocuments/{docId}` are strictly restricted so that only the document owner (`request.auth.uid`), an explicitly assigned agent (`assignedAgentId == request.auth.uid`), or a verified administrator (`isAdmin()`) can read them.
3. **Public Marketplace Publishing Gate**: Sellers creating a property in `/properties/{propertyId}` must initialize `status == 'Submitted'` and `isPublished == false`. Only an administrator can approve and publish (`isPublished == true`) a listing.
4. **Immutable Ownership & Audit Trail**: `sellerId`, `buyerId`, `userId`, `actorId`, and `createdAt` fields are strictly immutable after creation. `/auditLogs/{logId}` are append-only (`allow update, delete: if false`).
5. **Query Enforcer**: Every `allow list` rule enforces document-level boundaries on `resource.data` or verified admin identity without `get()`/`exists()` inside `allow list`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Self-Promoted Admin Payload**: `POST /users/attacker_uid` with `{ "role": "admin", "userType": "buyer", ... }` → `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: `GET /auditLogs/log_1` with `auth.token.email = "tarunpediredla9966@gmail.com"` and `auth.token.email_verified = false` → `PERMISSION_DENIED`.
3. **Seller Auto-Publish Bypass**: `POST /properties/prop_1` by seller with `{ "status": "Listed", "isPublished": true }` → `PERMISSION_DENIED`.
4. **Shadow Field Injection**: `PATCH /properties/prop_1` by seller adding `{ "ghostField": "injected" }` → `PERMISSION_DENIED` via `hasOnly()`.
5. **Cross-Tenant Document Snooping**: `GET /propertyDocuments/doc_1` by an unrelated buyer → `PERMISSION_DENIED`.
6. **ID Poisoning (2KB ID)**: `POST /savedProperties/<2000-char-id>` → `PERMISSION_DENIED` via `isValidId()`.
7. **Ownership Hijack on Update**: `PATCH /properties/prop_1` changing `sellerId` to another UID → `PERMISSION_DENIED`.
8. **Agent Final Approval Bypass**: `PATCH /properties/prop_1` by assigned agent attempting to set `isPublished: true` or `status: 'Approved'` → `PERMISSION_DENIED`.
9. **Enquiry Identity Spoofing**: `POST /buyerEnquiries/enq_1` where `buyerId != request.auth.uid` → `PERMISSION_DENIED`.
10. **Audit Log Tampering**: `DELETE /auditLogs/log_1` or `PATCH /auditLogs/log_1` by any user → `PERMISSION_DENIED`.
11. **Oversized Description DoS**: `POST /properties/prop_1` with a 50,000-character `description` → `PERMISSION_DENIED`.
12. **Blanket User List Scraping**: `LIST /users` by a regular buyer attempting to scrape seller phone numbers → `PERMISSION_DENIED`.
