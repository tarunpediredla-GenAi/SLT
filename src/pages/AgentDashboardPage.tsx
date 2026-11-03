import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  FileCheck,
  Phone,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import {
  AGENT_STATUSES,
  AgentWorkflowStatus,
  PropertyListing,
  ScreeningReport,
} from '../types/lst';

export const AgentDashboardPage: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    isAgent,
    isAdmin,
    allProperties,
    agentAssignments,
    inspectionRequests,
    buyerEnquiries,
    appointments,
    screeningReports,
    updateAgentWorkStatus,
    submitAgentScreeningReport,
    schedulePropertyAppointment,
    updateAppointmentStatus,
  } = useLST();

  const [activeTab, setActiveTab] = useState<
    'inspections' | 'enquiries' | 'appointments' | 'reports'
  >('inspections');

  // Screening Report Modal
  const [reportTargetProp, setReportTargetProp] = useState<PropertyListing | null>(null);
  const [boundariesVerified, setBoundariesVerified] = useState(true);
  const [roadAccessVerified, setRoadAccessVerified] = useState(true);
  const [waterVerified, setWaterVerified] = useState(true);
  const [electricityVerified, setElectricityVerified] = useState(true);
  const [ownershipRecordsChecked, setOwnershipRecordsChecked] = useState(true);
  const [soilTestingCompleted, setSoilTestingCompleted] = useState(true);
  const [soilQualitySummary, setSoilQualitySummary] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [recommendation, setRecommendation] =
    useState<ScreeningReport['recommendation']>('Approve');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Appointment Modal
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [apptPropId, setApptPropId] = useState('');
  const [apptParticipantId, setApptParticipantId] = useState('');
  const [apptParticipantName, setApptParticipantName] = useState('');
  const [apptParticipantPhone, setApptParticipantPhone] = useState('');
  const [apptRole, setApptRole] = useState<'buyer' | 'seller'>('buyer');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:30 AM');
  const [apptMeetingPoint, setApptMeetingPoint] = useState('Property Site Entrance');
  const [apptNotes, setApptNotes] = useState('');
  const [submittingAppt, setSubmittingAppt] = useState(false);

  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  if (!isAgent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 space-y-3">
          <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
            Authorized SLT Field Agent Access Only
          </h2>
          <p className="text-xs text-neutral-600">
            New accounts cannot self-assign agent privileges. An authorized SLT Culture Administrator must grant Agent permissions to your account.
          </p>
        </div>
      </div>
    );
  }

  const myAssignedProperties = allProperties.filter(
    (p) => isAdmin || p.assignedAgentId === firebaseUser?.uid
  );
  const myAssignedEnquiries = buyerEnquiries.filter(
    (e) => isAdmin || e.assignedAgentId === firebaseUser?.uid
  );
  const myAppointments = appointments.filter(
    (a) => isAdmin || a.agentId === firebaseUser?.uid
  );
  const myReports = screeningReports.filter(
    (r) => isAdmin || r.agentId === firebaseUser?.uid
  );

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetProp) return;
    setSubmittingReport(true);
    try {
      await submitAgentScreeningReport({
        propertyId: reportTargetProp.id,
        sellerId: reportTargetProp.sellerId,
        boundariesVerified,
        roadAccessVerified,
        waterVerified,
        electricityVerified,
        ownershipRecordsChecked,
        soilTestingCompleted,
        soilQualitySummary,
        inspectionNotes,
        recommendation,
      });
      setStatusFeedback(
        `Screening report submitted for ${reportTargetProp.referenceId}. Final publication awaits Admin approval.`
      );
      setReportTargetProp(null);
      setSoilQualitySummary('');
      setInspectionNotes('');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleScheduleAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProp = allProperties.find((p) => p.id === apptPropId) || myAssignedProperties[0];
    if (!targetProp || !apptDate) return;
    setSubmittingAppt(true);
    try {
      await schedulePropertyAppointment({
        propertyId: targetProp.id,
        propertyTitle: targetProp.title,
        participantId: apptParticipantId || targetProp.sellerId,
        participantName: apptParticipantName || targetProp.sellerName || 'Participant',
        participantPhone: apptParticipantPhone,
        participantRole: apptRole,
        visitDate: apptDate,
        visitTime: apptTime,
        meetingPoint: apptMeetingPoint,
        status: 'Visit Scheduled',
        notes: apptNotes,
      });
      setStatusFeedback(`Appointment scheduled for ${targetProp.title} on ${apptDate}.`);
      setApptModalOpen(false);
    } finally {
      setSubmittingAppt(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            SLT Culture Field Operations
          </p>
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
            Agent Inspection & Coordination Portal
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Manage assigned land inspections, buyer site visits, verification checklists, and screening reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (myAssignedProperties[0]) setApptPropId(myAssignedProperties[0].id);
            setApptModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D]"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Property Visit</span>
        </button>
      </div>

      {statusFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <span>{statusFeedback}</span>
          <button type="button" onClick={() => setStatusFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Assigned Land Inspections</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#17251D] mt-1">
            {myAssignedProperties.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Assigned Buyer Enquiries</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#124A32] mt-1">
            {myAssignedEnquiries.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Upcoming Site Visits</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#D5AD51] mt-1">
            {myAppointments.filter((a) => a.status === 'Visit Scheduled').length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Submitted Screening Reports</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#82B440] mt-1">
            {myReports.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F9F7] border border-neutral-200 rounded-xl">
        {[
          { id: 'inspections', label: `Assigned Land Inspections (${myAssignedProperties.length})` },
          { id: 'enquiries', label: `Assigned Buyer Enquiries (${myAssignedEnquiries.length})` },
          { id: 'appointments', label: `Upcoming Visits (${myAppointments.length})` },
          { id: 'reports', label: `Submitted Screening Reports (${myReports.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-[#124A32] text-white'
                : 'text-neutral-600 hover:text-[#17251D]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Assigned Land Inspections */}
      {activeTab === 'inspections' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Assigned Land Parcel Inspections & Verification Checklists
            </h2>
            <p className="text-xs text-neutral-500">
              Update inspection status or submit a physical verification report. Agents cannot publish listings directly.
            </p>
          </div>

          {myAssignedProperties.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No properties currently assigned to your Agent UID.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {myAssignedProperties.map((prop) => {
                const matchingReq = inspectionRequests.find((r) => r.propertyId === prop.id);
                return (
                  <div key={prop.id} className="p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                          {prop.referenceId} · Sy No. {prop.surveyNumber}
                        </div>
                        <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Location: {prop.village}, {prop.district}, {prop.state} · Area:{' '}
                          <strong>
                            {prop.area} {prop.areaUnit}
                          </strong>
                        </p>
                        {matchingReq && (
                          <p className="text-xs text-[#124A32] mt-1 font-medium">
                            Authorized Seller Contact: {matchingReq.sellerName} ({matchingReq.sellerPhone}) · Preferred Visit:{' '}
                            {matchingReq.preferredDate}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <select
                          value={(prop.agentVisitStatus as AgentWorkflowStatus) || 'Assigned'}
                          onChange={async (e) => {
                            const newSt = e.target.value as AgentWorkflowStatus;
                            await updateAgentWorkStatus({
                              propertyId: prop.id,
                              newAgentStatus: newSt,
                              inspectionRequestId: matchingReq?.id,
                            });
                            setStatusFeedback(
                              `Updated ${prop.referenceId} agent status to ${newSt}.`
                            );
                          }}
                          className="px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white font-medium"
                        >
                          {AGENT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              Status: {st}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => setReportTargetProp(prop)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D]"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Submit Verification Checklist</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Buyer Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Assigned Buyer Enquiries & Follow-Up Coordination
            </h2>
          </div>
          {myAssignedEnquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No buyer enquiries assigned to you yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Enquiry ID</th>
                    <th className="p-4 font-semibold">Property</th>
                    <th className="p-4 font-semibold">Authorized Buyer Contact</th>
                    <th className="p-4 font-semibold">Request Type & Visit Date</th>
                    <th className="p-4 font-semibold">Update Status</th>
                    <th className="p-4 font-semibold">Schedule Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {myAssignedEnquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                        {enq.enquiryId}
                      </td>
                      <td className="p-4 font-semibold">{enq.propertyTitle}</td>
                      <td className="p-4">
                        <div className="font-semibold text-[#17251D]">{enq.buyerName}</div>
                        <div className="font-mono-tabular text-[#124A32]">{enq.buyerPhone}</div>
                        <div className="text-neutral-500">{enq.buyerEmail}</div>
                      </td>
                      <td className="p-4">
                        <div>{enq.enquiryType}</div>
                        {enq.preferredVisitDate && (
                          <div className="text-neutral-500 font-mono-tabular">
                            Preferred: {enq.preferredVisitDate}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={enq.status}
                          onChange={async (e) => {
                            const st = e.target.value as AgentWorkflowStatus;
                            await updateAgentWorkStatus({
                              propertyId: enq.propertyId,
                              newAgentStatus: st,
                              enquiryId: enq.id,
                              notes: `Agent ${userProfile?.fullName} updated enquiry to ${st}.`,
                            });
                            setStatusFeedback(`Updated enquiry ${enq.enquiryId} to ${st}.`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
                        >
                          {AGENT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setApptPropId(enq.propertyId);
                            setApptParticipantId(enq.buyerId);
                            setApptParticipantName(enq.buyerName);
                            setApptParticipantPhone(enq.buyerPhone);
                            setApptRole('buyer');
                            setApptDate(enq.preferredVisitDate || '');
                            setApptModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#D5AD51] text-[#17251D] font-semibold"
                        >
                          Schedule Site Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upcoming Visits */}
      {activeTab === 'appointments' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Scheduled Property Visits & Inspections
            </h2>
          </div>
          {myAppointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No appointments scheduled yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="font-mono-tabular font-semibold text-[#124A32]">
                      {appt.visitDate} · {appt.visitTime} ({appt.participantRole.toUpperCase()} VISIT)
                    </div>
                    <h3 className="font-serif-display text-base font-semibold text-[#17251D] mt-0.5">
                      {appt.propertyTitle}
                    </h3>
                    <p className="text-neutral-600 mt-0.5">
                      Participant: <strong>{appt.participantName}</strong> ({appt.participantPhone || 'Verified'}) · Meeting Point: {appt.meetingPoint}
                    </p>
                  </div>
                  <select
                    value={appt.status}
                    onChange={(e) =>
                      updateAppointmentStatus(appt.id, e.target.value as any, appt.notes)
                    }
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white font-medium"
                  >
                    <option value="Visit Scheduled">Visit Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Submitted Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
          {myReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No screening reports submitted yet.
            </div>
          ) : (
            myReports.map((rep) => (
              <div key={rep.id} className="p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#124A32]">
                    Property ID: {rep.propertyId} · Recommendation: {rep.recommendation}
                  </span>
                  <span className="font-mono-tabular text-neutral-400">
                    {new Date(rep.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="text-neutral-600">
                  Checklist: Boundaries ({rep.boundariesVerified ? 'Verified' : 'Pending'}) · Road (
                  {rep.roadAccessVerified ? 'Verified' : 'Pending'}) · Water (
                  {rep.waterVerified ? 'Verified' : 'Pending'}) · Electricity (
                  {rep.electricityVerified ? 'Verified' : 'Pending'}) · Soil Tested (
                  {rep.soilTestingCompleted ? 'Yes' : 'No'})
                </div>
                <p className="text-[#17251D]">{rep.soilQualitySummary}</p>
                <p className="text-neutral-600">{rep.inspectionNotes}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Land Verification Checklist & Screening Report */}
      {reportTargetProp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                  Land Verification Checklist & Screening Report
                </h3>
                <p className="text-xs text-neutral-500">{reportTargetProp.title}</p>
              </div>
              <button type="button" onClick={() => setReportTargetProp(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-lg bg-[#F7F9F7] border border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={boundariesVerified}
                    onChange={(e) => setBoundariesVerified(e.target.checked)}
                  />
                  <span>Boundary Stones Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadAccessVerified}
                    onChange={(e) => setRoadAccessVerified(e.target.checked)}
                  />
                  <span>Road Access Confirmed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waterVerified}
                    onChange={(e) => setWaterVerified(e.target.checked)}
                  />
                  <span>Water Source Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={electricityVerified}
                    onChange={(e) => setElectricityVerified(e.target.checked)}
                  />
                  <span>Electricity Access Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ownershipRecordsChecked}
                    onChange={(e) => setOwnershipRecordsChecked(e.target.checked)}
                  />
                  <span>Ownership Deeds Cross-Checked</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soilTestingCompleted}
                    onChange={(e) => setSoilTestingCompleted(e.target.checked)}
                  />
                  <span>Soil / Strata Evaluation Done</span>
                </label>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Soil Quality & Public Screening Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={soilQualitySummary}
                  onChange={(e) => setSoilQualitySummary(e.target.value)}
                  placeholder="e.g. Red loamy soil pH 6.7, 30ft road frontage confirmed, boundary pillars intact..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Detailed Field Inspection Notes for Admin *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Internal verification observations..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Agent Recommendation *</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="Approve">Recommend Approval</option>
                  <option value="Further Verification Required">Further Verification Required</option>
                  <option value="Reject">Recommend Rejection</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportTargetProp(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-lg bg-[#124A32] text-white font-semibold"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Screening Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Appointment */}
      {apptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                Schedule Property Site Visit
              </h3>
              <button type="button" onClick={() => setApptModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Select Property</label>
                <select
                  value={apptPropId}
                  onChange={(e) => setApptPropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  {allProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.referenceId} — {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Participant Name *</label>
                  <input
                    type="text"
                    required
                    value={apptParticipantName}
                    onChange={(e) => setApptParticipantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Participant Role</label>
                  <select
                    value={apptRole}
                    onChange={(e) => setApptRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Visit Time *</label>
                  <input
                    type="text"
                    required
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Meeting Point</label>
                <input
                  type="text"
                  value={apptMeetingPoint}
                  onChange={(e) => setApptMeetingPoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApptModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAppt}
                  className="px-5 py-2 rounded-lg bg-[#124A32] text-white font-semibold"
                >
                  {submittingAppt ? 'Scheduling...' : 'Confirm Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
