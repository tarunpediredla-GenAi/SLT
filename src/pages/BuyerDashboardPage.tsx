import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  FileSpreadsheet,
  Phone,
  ArrowUpRight,
  Bell,
  MailCheck,
  Scale,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import { PropertyCard } from '../components/PropertyCard';
import { ScreeningTimeline } from '../components/ScreeningTimeline';

export const BuyerDashboardPage: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    buyerEnquiries,
    savedProperties,
    allProperties,
    appointments,
    registrationCases,
    notifications,
    resendVerification,
    markNotificationRead,
  } = useLST();

  const [activeTab, setActiveTab] = useState<
    'enquiries' | 'visits' | 'saved' | 'registration' | 'notifications'
  >('enquiries');
  const [verificationSent, setVerificationSent] = useState(false);

  const myEnquiries = buyerEnquiries.filter((e) => e.buyerId === firebaseUser?.uid);
  const myAppointments = appointments.filter(
    (a) => a.participantId === firebaseUser?.uid && a.participantRole === 'buyer'
  );
  const mySavedListings = allProperties.filter((p) =>
    savedProperties.some((s) => s.propertyId === p.id && s.userId === firebaseUser?.uid)
  );
  const myRegCases = registrationCases.filter((c) => c.buyerId === firebaseUser?.uid);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Email Verification Notice */}
      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <MailCheck className="w-4 h-4 text-amber-700" />
            <span>
              Please verify your email address ({firebaseUser.email}) to unlock full transaction coordination.
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await resendVerification();
              setVerificationSent(true);
            }}
            disabled={verificationSent}
            className="px-3.5 py-1.5 rounded-lg bg-[#124A32] text-white font-semibold disabled:opacity-50"
          >
            {verificationSent ? 'Verification Email Sent' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#124A32]">
            Protected Buyer Workspace
          </p>
          <h1 className="font-serif-display text-3xl font-semibold text-[#17251D] mt-1">
            Welcome, {userProfile?.fullName || 'Buyer'}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Track your registered land enquiries, scheduled site visits, saved favourites, and registration assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(userProfile?.userType === 'both' || userProfile?.userType === 'seller') && (
            <Link
              to="/seller"
              className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-[#17251D] hover:bg-neutral-50"
            >
              Switch to Seller Dashboard
            </Link>
          )}
          <Link
            to="/browse"
            className="px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors"
          >
            Browse Verified Lands
          </Link>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Tracked Enquiries</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#17251D] mt-1">
            {myEnquiries.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Scheduled Site Visits</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#124A32] mt-1">
            {myAppointments.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Saved Favourites</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#17251D] mt-1">
            {mySavedListings.length}
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-neutral-200">
          <div className="text-xs text-neutral-500">Registration Cases</div>
          <div className="font-mono-tabular text-2xl font-bold text-[#82B440] mt-1">
            {myRegCases.length}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs (Smooth Horizontal Swipe on Mobile/Tablet) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F9F7] border border-neutral-200 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'enquiries', label: `My Enquiries (${myEnquiries.length})` },
          { id: 'visits', label: `Site Visits (${myAppointments.length})` },
          { id: 'saved', label: `Saved Lands (${mySavedListings.length})` },
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

      {/* Tab 1: My Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-lg sm:text-xl font-semibold text-[#17251D]">
              Registered Interest & Callback Enquiries
            </h2>
            <p className="text-xs text-neutral-500">
              Live status updates from assigned SLT Culture field agents
            </p>
          </div>

          {myEnquiries.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-xs text-neutral-600">
                You have not registered interest on any land parcel yet.
              </p>
              <Link
                to="/browse"
                className="inline-block px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
              >
                Explore Verified Lands
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7] text-neutral-600">
                    <th className="p-4 font-semibold">Enquiry ID</th>
                    <th className="p-4 font-semibold">Property</th>
                    <th className="p-4 font-semibold">Request Type</th>
                    <th className="p-4 font-semibold">Assigned SLT Agent</th>
                    <th className="p-4 font-semibold">Current Status</th>
                    <th className="p-4 font-semibold">Agent Follow-Up Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {myEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-neutral-50">
                      <td className="p-4 font-mono-tabular font-semibold text-[#124A32]">
                        {enq.enquiryId}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/land/${enq.propertyId}`}
                          className="font-semibold text-[#17251D] hover:text-[#124A32] inline-flex items-center gap-1"
                        >
                          <span>{enq.propertyTitle}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                      <td className="p-4">{enq.enquiryType}</td>
                      <td className="p-4">
                        {enq.assignedAgentName ? (
                          <div>
                            <div className="font-semibold text-[#17251D]">
                              {enq.assignedAgentName}
                            </div>
                            {enq.assignedAgentPhone && (
                              <div className="text-[11px] font-mono-tabular text-[#124A32]">
                                {enq.assignedAgentPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500">
                            An SLT Culture agent will contact you
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-[#124A32]">{enq.status}</td>
                      <td className="p-4 text-neutral-600 max-w-xs">
                        {enq.followUpNotes || 'An SLT Culture agent will contact you.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Site Visits */}
      {activeTab === 'visits' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-200">
            <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
              Scheduled Site Visits & Agent Appointments
            </h2>
          </div>
          {myAppointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No scheduled site visits yet. Request a site visit on any property page and an SLT agent will schedule your appointment.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-mono-tabular text-[#124A32] font-semibold">
                      {appt.visitDate} · {appt.visitTime}
                    </div>
                    <h3 className="font-serif-display text-lg font-semibold text-[#17251D] mt-0.5">
                      {appt.propertyTitle}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Accompanying SLT Agent: <strong>{appt.agentName}</strong> · Meeting Point:{' '}
                      {appt.meetingPoint || 'Property Entrance'}
                    </p>
                    {appt.notes && (
                      <p className="text-xs text-neutral-500 mt-1">Notes: {appt.notes}</p>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#124A32] whitespace-nowrap">
                    Status: {appt.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Favourites */}
      {activeTab === 'saved' && (
        <div>
          {mySavedListings.length === 0 ? (
            <div className="p-12 bg-white border border-neutral-200 rounded-xl text-center space-y-3">
              <p className="text-xs text-neutral-600">
                You have no saved favourite properties yet. Click the heart icon on any land card to bookmark it.
              </p>
              <Link
                to="/browse"
                className="inline-block px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
              >
                Browse Lands
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySavedListings.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Registration Assistance */}
      {activeTab === 'registration' && (
        <div className="space-y-6">
          {myRegCases.length === 0 ? (
            <div className="p-12 bg-white border border-neutral-200 rounded-xl text-center text-xs text-neutral-500">
              No active Sub-Registrar coordination cases linked to your Buyer UID yet. Once your offer enters Negotiation or Registration in Progress, its 10-stage tracker appears here.
            </div>
          ) : (
            myRegCases.map((rc) => (
              <div key={rc.id} className="space-y-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono-tabular font-semibold text-[#124A32]">
                      CASE {rc.caseNumber}
                    </div>
                    <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                      {rc.propertyTitle}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Sub-Registrar Office: {rc.subRegistrarOffice || 'TBD'} · Target Date:{' '}
                      {rc.appointmentDate || 'Being Coordinated'}
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
                <span className="text-[11px] font-mono-tabular text-neutral-400 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
