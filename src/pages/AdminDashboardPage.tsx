import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Flag,
  UserPlus,
  ExternalLink,
  X,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import {
  PropertyListing,
  LIFECYCLE_STATUSES,
  LifecycleStatus,
  UserRole,
  formatInr,
} from '../types/lst';

export const AdminDashboardPage: React.FC = () => {
  const {
    firebaseUser,
    isAdmin,
    allUsers,
    allProperties,
    propertyDocuments,
    screeningReports,
    inspectionRequests,
    buyerEnquiries,
    agentAssignments,
    appointments,
    registrationCases,
    auditLogs,
    showSampleListings,
    setShowSampleListings,
    adminReviewProperty,
    adminAssignAgent,
    adminUpdateDocumentVerification,
    adminChangeUserRole,
    adminUpsertRegistrationCase,
  } = useLST();

  const [activeTab, setActiveTab] = useState<
    'lands' | 'enquiries' | 'documents' | 'registration' | 'users' | 'audit'
  >('lands');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Admin Review & Stage Update Modal
  const [reviewProp, setReviewProp] = useState<PropertyListing | null>(null);
  const [newStage, setNewStage] = useState<number>(7);
  const [newStatus, setNewStatus] = useState<LifecycleStatus>('Approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [publicSummary, setPublicSummary] = useState('');
  const [testingStatus, setTestingStatus] = useState('');
  const [regAssistStatus, setRegAssistStatus] = useState('');
  const [selectedAgentUid, setSelectedAgentUid] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 space-y-3">
          <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
            Restricted SLT Culture Administration Portal
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Access to <code>/admin</code> is restricted to verified SLT Culture Administrators (enforced via server-side and Firestore security rules).
          </p>
        </div>
      </div>
    );
  }

  const totalBuyers = allUsers.filter(
    (u) => u.userType === 'buyer' || u.userType === 'both'
  ).length;
  const totalSellers = allUsers.filter(
    (u) => u.userType === 'seller' || u.userType === 'both'
  ).length;
  const awaitingVerification = allProperties.filter(
    (p) => !p.isPublished && p.status !== 'Rejected'
  ).length;
  const approvedOrListed = allProperties.filter(
    (p) => p.status === 'Approved' || p.status === 'Listed' || p.isPublished
  ).length;
  const rejectedCount = allProperties.filter((p) => p.status === 'Rejected').length;
  const pendingEnquiries = buyerEnquiries.filter(
    (e) => e.status === 'Submitted' || e.status === 'Assigned'
  ).length;

  const authorizedAgents = allUsers.filter(
    (u) => u.role === 'agent' || u.role === 'admin'
  );

  const filteredLands = allProperties.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (
      searchQuery.trim() &&
      !`${p.title} ${p.referenceId} ${p.village} ${p.district} ${p.surveyNumber}`
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openManageProp = (prop: PropertyListing) => {
    setReviewProp(prop);
    setNewStage(prop.screeningStage || 1);
    setNewStatus(prop.status);
    setRejectionReason(prop.rejectionReason || '');
    setPublicSummary(prop.publicScreeningSummary || '');
    setTestingStatus(prop.testingStatus || 'Verified');
    setRegAssistStatus(prop.registrationAssistanceStatus || 'Ready for Coordination');
    setSelectedAgentUid(prop.assignedAgentId || authorizedAgents[0]?.uid || '');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            SLT Culture Executive Control Center
          </p>
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
            Administration & Verification Portal
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Approve or reject land listings, review private ownership deeds, authorize field agents, and audit platform activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSampleListings(!showSampleListings)}
          className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-[#17251D] hover:bg-neutral-50"
        >
          {showSampleListings ? 'Sample Test Data: Visible' : 'Sample Test Data: Hidden'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 9 Required Executive Overview Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Registered Buyers</div>
          <div className="font-mono-tabular text-xl font-bold text-[#17251D] mt-1">
            {totalBuyers}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Registered Sellers</div>
          <div className="font-mono-tabular text-xl font-bold text-[#17251D] mt-1">
            {totalSellers}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Properties Submitted</div>
          <div className="font-mono-tabular text-xl font-bold text-[#124A32] mt-1">
            {allProperties.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Awaiting Verification</div>
          <div className="font-mono-tabular text-xl font-bold text-[#D5AD51] mt-1">
            {awaitingVerification}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Approved / Rejected</div>
          <div className="font-mono-tabular text-xl font-bold text-[#82B440] mt-1">
            {approvedOrListed} / <span className="text-red-600">{rejectedCount}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Pending Enquiries</div>
          <div className="font-mono-tabular text-xl font-bold text-[#124A32] mt-1">
            {pendingEnquiries}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Agent Assignments</div>
          <div className="font-mono-tabular text-xl font-bold text-[#17251D] mt-1">
            {agentAssignments.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Scheduled Site Visits</div>
          <div className="font-mono-tabular text-xl font-bold text-[#17251D] mt-1">
            {appointments.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Registration Cases</div>
          <div className="font-mono-tabular text-xl font-bold text-[#124A32] mt-1">
            {registrationCases.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="text-neutral-500">Screening Reports</div>
          <div className="font-mono-tabular text-xl font-bold text-[#17251D] mt-1">
            {screeningReports.length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F9F7] border border-neutral-200 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'lands', label: `Land Management (${allProperties.length})` },
          { id: 'enquiries', label: `Buyer Enquiries (${buyerEnquiries.length})` },
          { id: 'documents', label: `Document Vault (${propertyDocuments.length})` },
          { id: 'registration', label: `Registration (${registrationCases.length})` },
          { id: 'users', label: `Staff & Users (${allUsers.length})` },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === t.id
                ? 'bg-[#124A32] text-white shadow-xs'
                : 'text-neutral-600 hover:text-[#17251D]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Land Management */}
      {activeTab === 'lands' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Reference ID, title, village, survey number..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white w-full sm:w-auto"
            >
              <option value="All">All Lifecycle Statuses</option>
              {LIFECYCLE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full min-w-[720px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                  <th className="p-4 font-semibold">Reference ID</th>
                  <th className="p-4 font-semibold">Property & Location</th>
                  <th className="p-4 font-semibold">Area & Price (₹)</th>
                  <th className="p-4 font-semibold">Stage & Status</th>
                  <th className="p-4 font-semibold">Assigned Agent</th>
                  <th className="p-4 font-semibold">Published</th>
                  <th className="p-4 font-semibold">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredLands.map((prop) => (
                  <tr key={prop.id} className="hover:bg-neutral-50">
                    <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                      {prop.referenceId}
                      {prop.isFlagged && (
                        <div className="text-[10px] text-red-600 font-bold mt-0.5">
                          FLAGGED
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#17251D]">{prop.title}</div>
                      <div className="text-neutral-500">
                        {prop.village}, {prop.district}, {prop.state} · Sy No. {prop.surveyNumber}
                      </div>
                    </td>
                    <td className="p-4 font-mono-tabular">
                      <div>
                        {prop.area} {prop.areaUnit}
                      </div>
                      <div className="font-bold text-[#17251D]">{formatInr(prop.priceInr)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#124A32]">
                        Stage {prop.screeningStage}/10 · {prop.status}
                      </div>
                      <div className="text-neutral-500">{prop.testingStatus || 'Pending'}</div>
                    </td>
                    <td className="p-4">{prop.assignedAgentName || 'Unassigned'}</td>
                    <td className="p-4 font-semibold">
                      {prop.isPublished ? (
                        <span className="text-[#82B440]">Published</span>
                      ) : (
                        <span className="text-neutral-500">Private / Draft</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openManageProp(prop)}
                        className="px-3 py-1.5 rounded-lg bg-[#124A32] text-white font-semibold hover:bg-[#17251D] whitespace-nowrap"
                      >
                        Manage & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Buyer Enquiries & Agent Assignment */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Buyer Enquiries & Field Agent Assignments
            </h2>
          </div>
          {buyerEnquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No buyer enquiries submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full min-w-[680px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Enquiry ID</th>
                    <th className="p-4 font-semibold">Property</th>
                    <th className="p-4 font-semibold">Buyer Details</th>
                    <th className="p-4 font-semibold">Type & Visit Date</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Assign Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {buyerEnquiries.map((enq) => {
                    const propObj = allProperties.find((p) => p.id === enq.propertyId);
                    return (
                      <tr key={enq.id}>
                        <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                          {enq.enquiryId}
                        </td>
                        <td className="p-4 font-semibold">{enq.propertyTitle}</td>
                        <td className="p-4">
                          <div className="font-semibold">{enq.buyerName}</div>
                          <div className="font-mono-tabular">{enq.buyerPhone}</div>
                          <div className="text-neutral-500">{enq.buyerEmail}</div>
                        </td>
                        <td className="p-4">
                          <div>{enq.enquiryType}</div>
                          {enq.preferredVisitDate && (
                            <div className="font-mono-tabular text-neutral-500">
                              Visit: {enq.preferredVisitDate}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-[#124A32]">{enq.status}</td>
                        <td className="p-4">
                          <select
                            value={enq.assignedAgentId || ''}
                            onChange={async (e) => {
                              const agent = authorizedAgents.find(
                                (a) => a.uid === e.target.value
                              );
                              if (!agent || !propObj) return;
                              await adminAssignAgent({
                                agent,
                                targetType: 'Buyer Enquiry',
                                property: propObj,
                                relatedRecordId: enq.id,
                                contactName: enq.buyerName,
                                contactPhone: enq.buyerPhone,
                              });
                              setFeedback({
                                type: 'ok',
                                text: `Assigned ${agent.fullName} to enquiry ${enq.enquiryId}.`,
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                          >
                            <option value="">Select Agent...</option>
                            {authorizedAgents.map((ag) => (
                              <option key={ag.uid} value={ag.uid}>
                                {ag.fullName} ({ag.role})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Document Vault & Screening Reports */}
      {activeTab === 'documents' && (
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-neutral-200">
              <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
                Submitted Seller Ownership & Verification Documents
              </h2>
            </div>
            {propertyDocuments.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-500">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                <table className="w-full min-w-[660px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                      <th className="p-4 font-semibold">Doc Type</th>
                      <th className="p-4 font-semibold">File Name</th>
                      <th className="p-4 font-semibold">Property ID</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Inspect File</th>
                      <th className="p-4 font-semibold">Admin Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {propertyDocuments.map((d) => (
                      <tr key={d.id}>
                        <td className="p-4 font-semibold uppercase text-[#124A32]">{d.docType}</td>
                        <td className="p-4">{d.fileName}</td>
                        <td className="p-4 font-mono-tabular">{d.propertyId}</td>
                        <td className="p-4 font-semibold">{d.verificationStatus}</td>
                        <td className="p-4">
                          <a
                            href={`${d.fileUrl}?uid=${firebaseUser?.uid || ''}&role=admin&email=${encodeURIComponent(
                              firebaseUser?.email || ''
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#124A32] font-semibold hover:underline"
                          >
                            <span>Open File</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              adminUpdateDocumentVerification(
                                d,
                                'verified',
                                'Verified by SLT Admin'
                              )
                            }
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              adminUpdateDocumentVerification(
                                d,
                                'rejected',
                                'Clearer scan required'
                              )
                            }
                            className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-neutral-200">
              <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
                Field Agent Screening Reports
              </h2>
            </div>
            {screeningReports.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-500">
                No field agent reports submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {screeningReports.map((rep) => (
                  <div key={rep.id} className="p-5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#124A32]">
                        Agent: {rep.agentName} · Property: {rep.propertyId} · Recommendation:{' '}
                        {rep.recommendation}
                      </span>
                      <span className="font-mono-tabular text-neutral-400">
                        {new Date(rep.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[#17251D] font-medium">{rep.soilQualitySummary}</p>
                    <p className="text-neutral-600">{rep.inspectionNotes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Registration Assistance Cases */}
      {activeTab === 'registration' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Sub-Registrar & 10-Stage Registration Coordination Cases
            </h2>
          </div>
          {registrationCases.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No active registration cases yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full min-w-[660px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Case No.</th>
                    <th className="p-4 font-semibold">Property</th>
                    <th className="p-4 font-semibold">Seller</th>
                    <th className="p-4 font-semibold">Sub-Registrar Office</th>
                    <th className="p-4 font-semibold">Current Stage (1–10)</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {registrationCases.map((rc) => (
                    <tr key={rc.id}>
                      <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                        {rc.caseNumber}
                      </td>
                      <td className="p-4 font-semibold">{rc.propertyTitle}</td>
                      <td className="p-4">{rc.sellerName}</td>
                      <td className="p-4">{rc.subRegistrarOffice}</td>
                      <td className="p-4">
                        <select
                          value={rc.currentStage}
                          onChange={(e) =>
                            adminUpsertRegistrationCase({
                              ...rc,
                              currentStage: Number(e.target.value),
                            })
                          }
                          className="px-2 py-1 rounded border border-neutral-300 bg-white font-mono-tabular"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                            <option key={s} value={s}>
                              Stage {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={rc.status}
                          onChange={(e) =>
                            adminUpsertRegistrationCase({
                              ...rc,
                              status: e.target.value as LifecycleStatus,
                            })
                          }
                          className="px-2.5 py-1 rounded border border-neutral-300 bg-white"
                        >
                          {LIFECYCLE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: User & Staff Management */}
      {activeTab === 'users' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Registered Buyers, Sellers & Authorized Staff Management
            </h2>
            <p className="text-xs text-neutral-500">
              Authorize verified staff accounts as Field Agents or Administrators.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full min-w-[660px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                  <th className="p-4 font-semibold">Full Name</th>
                  <th className="p-4 font-semibold">Email & Phone</th>
                  <th className="p-4 font-semibold">User Type</th>
                  <th className="p-4 font-semibold">System Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Authorize Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {allUsers.map((u) => (
                  <tr key={u.uid}>
                    <td className="p-4 font-semibold text-[#17251D]">{u.fullName}</td>
                    <td className="p-4">
                      <div>{u.email}</div>
                      <div className="font-mono-tabular text-neutral-500">{u.phone}</div>
                    </td>
                    <td className="p-4 uppercase font-mono-tabular">{u.userType}</td>
                    <td className="p-4 font-semibold text-[#124A32] uppercase">{u.role}</td>
                    <td className="p-4">{u.accountStatus}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          const nr = e.target.value as UserRole;
                          await adminChangeUserRole(u, nr);
                          setFeedback({
                            type: 'ok',
                            text: `Updated ${u.fullName}'s system role to ${nr}.`,
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-medium"
                      >
                        <option value="user">Standard User (Buyer/Seller)</option>
                        <option value="agent">Authorized SLT Agent</option>
                        <option value="admin">SLT Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Immutable Security & Administrative Audit Trail
            </h2>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No audit events recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Timestamp</th>
                    <th className="p-4 font-semibold">Actor</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-4 font-mono-tabular text-neutral-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-medium">{log.actorEmail}</td>
                      <td className="p-4 uppercase font-mono-tabular text-[#124A32]">
                        {log.actorRole}
                      </td>
                      <td className="p-4 font-semibold text-[#17251D]">{log.action}</td>
                      <td className="p-4 text-neutral-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Manage & Verify Property */}
      {reviewProp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                  Admin Verification & Publishing Control ({reviewProp.referenceId})
                </h3>
                <p className="text-xs text-neutral-500">{reviewProp.title}</p>
              </div>
              <button type="button" onClick={() => setReviewProp(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewProp.isSample ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                This is a read-only sample demonstration record (`{reviewProp.referenceId}`). You can hide sample records using the toggle in the top-right, or submit a live land parcel via <strong>Sell Your Land</strong> to test full database mutations.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Agent Assignment */}
                <div className="p-4 rounded-lg bg-[#F7F9F7] border border-neutral-200 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-[#17251D] mb-1">
                      Assign Field Agent for Site Inspection
                    </label>
                    <select
                      value={selectedAgentUid}
                      onChange={(e) => setSelectedAgentUid(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                    >
                      <option value="">Select Authorized Agent...</option>
                      {authorizedAgents.map((ag) => (
                        <option key={ag.uid} value={ag.uid}>
                          {ag.fullName} ({ag.email} — {ag.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const ag = authorizedAgents.find((a) => a.uid === selectedAgentUid);
                      if (!ag) return;
                      const matchReq = inspectionRequests.find(
                        (r) => r.propertyId === reviewProp.id
                      );
                      await adminAssignAgent({
                        agent: ag,
                        targetType: 'Property Inspection',
                        property: reviewProp,
                        relatedRecordId: matchReq?.id,
                      });
                      setFeedback({
                        type: 'ok',
                        text: `Assigned agent ${ag.fullName} to ${reviewProp.referenceId}.`,
                      });
                      setReviewProp(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#124A32] text-white font-semibold whitespace-nowrap"
                  >
                    Assign Agent
                  </button>
                </div>

                {/* Screening & Stage Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Screening Stage (1 to 10)</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-mono-tabular"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <option key={s} value={s}>
                          Stage {s} of 10
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Lifecycle Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as LifecycleStatus)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                    >
                      {LIFECYCLE_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Testing Status Label</label>
                    <input
                      type="text"
                      value={testingStatus}
                      onChange={(e) => setTestingStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      Registration Assistance Status
                    </label>
                    <input
                      type="text"
                      value={regAssistStatus}
                      onChange={(e) => setRegAssistStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Public Screening & Testing Summary (Shown on Public Property Page)
                  </label>
                  <textarea
                    rows={2}
                    value={publicSummary}
                    onChange={(e) => setPublicSummary(e.target.value)}
                    placeholder="Summary of verified boundary stones, road access, and soil report..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Rejection Reason (Required if Rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify missing documents or boundary discrepancy..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminReviewProperty({
                          property: reviewProp,
                          decision: 'approve_publish',
                          publicScreeningSummary: publicSummary,
                        });
                        setFeedback({
                          type: 'ok',
                          text: `Approved and published ${reviewProp.referenceId} to public Browse Land page.`,
                        });
                        setReviewProp(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#82B440] text-[#17251D] font-bold"
                    >
                      Approve & Publish Listing
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await adminReviewProperty({
                          property: reviewProp,
                          decision: 'update_stage',
                          screeningStage: newStage,
                          lifecycleStatus: newStatus,
                          testingStatus,
                          registrationAssistanceStatus: regAssistStatus,
                          publicScreeningSummary: publicSummary,
                        });
                        setFeedback({
                          type: 'ok',
                          text: `Updated stage & status for ${reviewProp.referenceId}.`,
                        });
                        setReviewProp(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#124A32] text-white font-semibold"
                    >
                      Save Stage Update
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminReviewProperty({
                          property: reviewProp,
                          decision: reviewProp.isFlagged ? 'unflag' : 'flag',
                        });
                        setReviewProp(null);
                      }}
                      className="px-3 py-2 rounded-lg border border-amber-400 text-amber-800 font-semibold"
                    >
                      {reviewProp.isFlagged ? 'Unflag' : 'Flag Listing'}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await adminReviewProperty({
                          property: reviewProp,
                          decision: 'reject',
                          rejectionReason,
                        });
                        setFeedback({
                          type: 'err',
                          text: `Rejected ${reviewProp.referenceId}.`,
                        });
                        setReviewProp(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
