import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit3,
  Calendar,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import {
  PropertyListing,
  PropertyDocument,
  formatInr,
  formatExactInr,
} from '../types/lst';
import { ScreeningTimeline } from '../components/ScreeningTimeline';

export const SellerDashboardPage: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    mySellerProperties,
    propertyDocuments,
    buyerEnquiries,
    inspectionRequests,
    registrationCases,
    notifications,
    updateSellerPropertyFields,
    requestAgentInspectionVisit,
    uploadDocumentFile,
    markNotificationRead,
  } = useLST();

  const [activeTab, setActiveTab] = useState<
    'listings' | 'documents' | 'enquiries' | 'registration' | 'notifications'
  >('listings');

  // Edit Allowed Listing Fields Modal State
  const [editingProp, setEditingProp] = useState<PropertyListing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriceInr, setEditPriceInr] = useState('');
  const [editNegotiable, setEditNegotiable] = useState(true);
  const [editDesc, setEditDesc] = useState('');
  const [editRoad, setEditRoad] = useState('');
  const [editWater, setEditWater] = useState('');
  const [editElectric, setEditElectric] = useState('');
  const [editLandUse, setEditLandUse] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Request Agent Visit Modal State
  const [visitProp, setVisitProp] = useState<PropertyListing | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('Morning (10:00 AM - 1:00 PM)');
  const [visitNotes, setVisitNotes] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const myDocs = propertyDocuments.filter((d) => d.sellerId === firebaseUser?.uid);
  const enquiriesOnMyLands = buyerEnquiries.filter((e) => e.sellerId === firebaseUser?.uid);
  const myRegCases = registrationCases.filter((c) => c.sellerId === firebaseUser?.uid);

  const openEditModal = (prop: PropertyListing) => {
    setEditingProp(prop);
    setEditTitle(prop.title);
    setEditPriceInr(String(prop.priceInr));
    setEditNegotiable(prop.isNegotiable);
    setEditDesc(prop.description || '');
    setEditRoad(prop.roadAccess || '');
    setEditWater(prop.waterAvailability || '');
    setEditElectric(prop.electricityAvailability || '');
    setEditLandUse(prop.currentLandUse || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSavingEdit(true);
    try {
      await updateSellerPropertyFields(editingProp.id, {
        title: editTitle,
        priceInr: Number(editPriceInr),
        isNegotiable: editNegotiable,
        description: editDesc,
        roadAccess: editRoad,
        waterAvailability: editWater,
        electricityAvailability: editElectric,
        currentLandUse: editLandUse,
      });
      setActionMessage(`Updated listing details for ${editingProp.referenceId}.`);
      setEditingProp(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRequestVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitProp || !visitDate) return;
    setSavingVisit(true);
    try {
      await requestAgentInspectionVisit({
        propertyId: visitProp.id,
        referenceId: visitProp.referenceId,
        propertyTitle: visitProp.title,
        preferredDate: visitDate,
        preferredSlot: visitSlot,
        notes: visitNotes,
      });
      setActionMessage(
        `Agent site inspection requested for ${visitProp.referenceId} on ${visitDate}.`
      );
      setVisitProp(null);
      setVisitDate('');
      setVisitNotes('');
    } finally {
      setSavingVisit(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            Protected Landowner Workspace
          </p>
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
            Seller Dashboard — {userProfile?.fullName || 'Landowner'}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Manage your submitted lands, track 10-stage screening & soil testing, schedule agent visits, and review buyer enquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/buyer"
            className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-[#17251D] hover:bg-neutral-50"
          >
            Switch to Buyer Dashboard
          </Link>
          <Link
            to="/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Land</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <span>{actionMessage}</span>
          <button type="button" onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">My Submitted Lands</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#17251D] mt-1">
            {mySellerProperties.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Approved & Published</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#82B440] mt-1">
            {mySellerProperties.filter((p) => p.isPublished).length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Protected Vault Documents</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#124A32] mt-1">
            {myDocs.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Buyer Enquiries Received</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#D5AD51] mt-1">
            {enquiriesOnMyLands.length}
          </div>
        </div>
      </div>

      {/* Tabs (Smooth Horizontal Swipe on Mobile/Tablet) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F9F7] border border-neutral-200 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'listings', label: `My Land Listings (${mySellerProperties.length})` },
          { id: 'documents', label: `Document Vault (${myDocs.length})` },
          { id: 'enquiries', label: `Buyer Enquiries Received (${enquiriesOnMyLands.length})` },
          { id: 'registration', label: `Registration Assistance (${myRegCases.length})` },
          { id: 'notifications', label: `Notifications (${notifications.length})` },
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

      {/* Tab 1: My Land Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {mySellerProperties.length === 0 ? (
            <div className="p-12 bg-white border border-neutral-200 rounded-xl text-center space-y-3">
              <h3 className="font-serif-display text-xl font-semibold text-[#17251D]">
                You Have Not Registered Any Land Listings Yet
              </h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Click "Add New Land" to submit your personal and land details, upload ownership documents, and schedule an SLT Culture agent inspection.
              </p>
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Register Your First Land</span>
              </Link>
            </div>
          ) : (
            mySellerProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-mono-tabular font-bold text-[#124A32]">
                        {prop.referenceId}
                      </span>
                      <span>·</span>
                      <span>{prop.category}</span>
                      <span>·</span>
                      <span className="font-mono-tabular">
                        {prop.area} {prop.areaUnit}
                      </span>
                      <span>·</span>
                      <span>Sy No. {prop.surveyNumber}</span>
                    </div>
                    <h3 className="font-serif-display text-xl font-semibold text-[#17251D] mt-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {prop.village}, {prop.district}, {prop.state} · Expected Price:{' '}
                      <strong className="font-mono-tabular text-[#17251D]">
                        {formatInr(prop.priceInr)} ({formatExactInr(prop.priceInr)})
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(prop)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-[#17251D] hover:bg-neutral-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Listing Fields</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisitProp(prop)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold hover:bg-[#e2be69]"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Agent Visit</span>
                    </button>
                    <Link
                      to={`/land/${prop.id}`}
                      className="px-3.5 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
                    >
                      View Listing
                    </Link>
                  </div>
                </div>

                {/* 4 Required Status Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-[#F7F9F7] border border-neutral-200">
                    <div className="text-neutral-500">Screening Status</div>
                    <div className="font-semibold text-[#124A32] mt-1">
                      {prop.screeningStatus || prop.status}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#F7F9F7] border border-neutral-200">
                    <div className="text-neutral-500">Testing Status</div>
                    <div className="font-semibold text-[#17251D] mt-1">
                      {prop.testingStatus || 'Pending Soil & Boundary Check'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#F7F9F7] border border-neutral-200">
                    <div className="text-neutral-500">Agent Visit Status</div>
                    <div className="font-semibold text-[#17251D] mt-1">
                      {prop.agentVisitStatus || 'Not Scheduled'}
                      {prop.assignedAgentName ? ` · ${prop.assignedAgentName}` : ''}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#F7F9F7] border border-neutral-200">
                    <div className="text-neutral-500">Registration Assistance Status</div>
                    <div className="font-semibold text-[#17251D] mt-1">
                      {prop.registrationAssistanceStatus || 'Stage ' + prop.screeningStage}
                    </div>
                  </div>
                </div>

                {prop.rejectionReason && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    <strong>Administrator Review Note:</strong> {prop.rejectionReason}
                  </div>
                )}

                <ScreeningTimeline
                  currentStage={prop.screeningStage}
                  status={prop.status}
                  compact
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Document Vault */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              My Protected Ownership & Screening Documents
            </h2>
            <p className="text-xs text-neutral-500">
              Only you, your assigned SLT inspection agent, and authorized administrators can access these files.
            </p>
          </div>
          {myDocs.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No property documents uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Document Type</th>
                    <th className="p-4 font-semibold">File Name</th>
                    <th className="p-4 font-semibold">Verification Status</th>
                    <th className="p-4 font-semibold">Reviewer Notes</th>
                    <th className="p-4 font-semibold">Protected Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {myDocs.map((d) => (
                    <tr key={d.id}>
                      <td className="p-4 font-semibold text-[#124A32] uppercase">{d.docType}</td>
                      <td className="p-4">{d.fileName}</td>
                      <td className="p-4 font-semibold">{d.verificationStatus}</td>
                      <td className="p-4 text-neutral-600">
                        {d.reviewerNotes || 'Under verification review'}
                      </td>
                      <td className="p-4">
                        <a
                          href={`${d.fileUrl}?uid=${firebaseUser?.uid || ''}&email=${encodeURIComponent(
                            firebaseUser?.email || ''
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#124A32] font-semibold hover:underline"
                        >
                          <span>View Document</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Buyer Enquiries Received */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Buyer Enquiries Received on My Lands
            </h2>
            <p className="text-xs text-neutral-500">
              SLT Culture agents coordinate all buyer callbacks and site visits on your behalf.
            </p>
          </div>
          {enquiriesOnMyLands.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No buyer enquiries received on your listings yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Enquiry Ref</th>
                    <th className="p-4 font-semibold">Property</th>
                    <th className="p-4 font-semibold">Enquiry Type</th>
                    <th className="p-4 font-semibold">Buyer City</th>
                    <th className="p-4 font-semibold">Assigned SLT Agent</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {enquiriesOnMyLands.map((enq) => (
                    <tr key={enq.id}>
                      <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                        {enq.enquiryId}
                      </td>
                      <td className="p-4 font-semibold">{enq.propertyTitle}</td>
                      <td className="p-4">{enq.enquiryType}</td>
                      <td className="p-4">{enq.buyerCity || 'Verified Buyer'}</td>
                      <td className="p-4">{enq.assignedAgentName || 'SLT Coordination Desk'}</td>
                      <td className="p-4 font-semibold text-[#124A32]">{enq.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Registration Assistance */}
      {activeTab === 'registration' && (
        <div className="space-y-6">
          {myRegCases.length === 0 ? (
            <div className="p-12 bg-white border border-neutral-200 rounded-xl text-center text-xs text-neutral-500">
              Registration assistance cases appear automatically as soon as you submit a property.
            </div>
          ) : (
            myRegCases.map((rc) => (
              <div key={rc.id} className="space-y-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                      {rc.caseNumber}
                    </div>
                    <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                      {rc.propertyTitle}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Sub-Registrar Office: {rc.subRegistrarOffice} · Status: {rc.status}
                    </p>
                  </div>
                  <div className="text-xs text-neutral-600 max-w-md">
                    {rc.coordinationNotes}
                  </div>
                </div>
                <ScreeningTimeline currentStage={rc.currentStage} status={rc.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markNotificationRead(n.id)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer ${
                  n.isRead ? 'bg-white' : 'bg-[#F7F9F7]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-[#124A32]">{n.title}</div>
                  <p className="text-xs text-neutral-700 mt-1">{n.message}</p>
                </div>
                <span className="text-[11px] font-mono-tabular text-neutral-400">
                  {new Date(n.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Edit Allowed Listing Fields */}
      {editingProp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                Edit Listing Details ({editingProp.referenceId})
              </h3>
              <button type="button" onClick={() => setEditingProp(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Expected Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={editPriceInr}
                    onChange={(e) => setEditPriceInr(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Negotiable</label>
                  <select
                    value={editNegotiable ? 'yes' : 'no'}
                    onChange={(e) => setEditNegotiable(e.target.value === 'yes')}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Road Access</label>
                  <input
                    type="text"
                    value={editRoad}
                    onChange={(e) => setEditRoad(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Water Availability</label>
                  <input
                    type="text"
                    value={editWater}
                    onChange={(e) => setEditWater(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Property Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-lg bg-[#124A32] text-white font-semibold"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Agent Visit */}
      {visitProp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                Request SLT Agent Site Visit
              </h3>
              <button type="button" onClick={() => setVisitProp(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestVisitSubmit} className="space-y-3 text-xs">
              <p className="text-neutral-600">
                Property: <strong>{visitProp.title}</strong> ({visitProp.referenceId})
              </p>
              <div>
                <label className="block font-medium mb-1">Preferred Visit Date *</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 font-mono-tabular"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Preferred Time Slot</label>
                <select
                  value={visitSlot}
                  onChange={(e) => setVisitSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                >
                  <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Site Directions / Notes</label>
                <textarea
                  rows={2}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVisitProp(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVisit}
                  className="px-5 py-2 rounded-lg bg-[#124A32] text-white font-semibold"
                >
                  {savingVisit ? 'Submitting...' : 'Submit Visit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
