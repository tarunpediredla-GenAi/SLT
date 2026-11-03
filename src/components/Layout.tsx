import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Scale,
  LogOut,
  UserCheck,
  ShieldAlert,
  Home,
  Compass,
  PlusCircle,
  User,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useLST } from '../context/LSTContext';
import { formatInr } from '../types/lst';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    firebaseUser,
    userProfile,
    isAdmin,
    isAgent,
    notifications,
    markNotificationRead,
    logoutUser,
    compareIds,
    allProperties,
    toggleCompareProperty,
    clearCompare,
  } = useLST();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const comparedProperties = allProperties.filter((p) => compareIds.includes(p.id));

  const getPrimaryDashboardRoute = () => {
    if (isAdmin) return { path: '/admin', label: 'Admin Portal' };
    if (isAgent) return { path: '/agent', label: 'Agent Portal' };
    if (userProfile?.userType === 'seller') return { path: '/seller', label: 'Seller Dashboard' };
    if (userProfile?.userType === 'both') return { path: '/seller', label: 'My Dashboards' };
    return { path: '/buyer', label: 'Buyer Dashboard' };
  };

  const primaryDash = getPrimaryDashboardRoute();

  const handleLogout = async () => {
    await logoutUser();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17251D]">
      {/* Sticky Top Header — 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Official SLT Culture Logo Lockup */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0 focus:outline-none"
          >
            <img
              src="/assets/aistudio/image_de4003f1.png"
              alt="SLT Culture Official Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Zone 2: 5 Concise Single-Line Navigation Links (Desktop & Tablet Lg) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-[#17251D]/80">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `hover:text-[#124A32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive ? 'border-[#124A32] text-[#124A32] font-semibold' : 'border-transparent'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/browse"
              className={({ isActive }) =>
                `hover:text-[#124A32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive ? 'border-[#124A32] text-[#124A32] font-semibold' : 'border-transparent'
                }`
              }
            >
              Browse Land
            </NavLink>
            <NavLink
              to="/sell"
              className={({ isActive }) =>
                `hover:text-[#124A32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive ? 'border-[#124A32] text-[#124A32] font-semibold' : 'border-transparent'
                }`
              }
            >
              Sell Your Land
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `hover:text-[#124A32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive ? 'border-[#124A32] text-[#124A32] font-semibold' : 'border-transparent'
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-[#124A32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive ? 'border-[#124A32] text-[#124A32] font-semibold' : 'border-transparent'
                }`
              }
            >
              About SLT
            </NavLink>
          </nav>

          {/* Zone 3: Primary Action & Role Workspace Access */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {firebaseUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
                  className="relative p-2 rounded-lg text-[#17251D] hover:bg-neutral-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D5AD51] text-[#17251D] text-[10px] font-bold flex items-center justify-center font-mono-tabular">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <Link
                  to={primaryDash.path}
                  className="hidden sm:inline-flex items-center px-3.5 sm:px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs sm:text-sm font-medium hover:bg-[#17251D] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  {primaryDash.label}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 rounded-lg bg-[#124A32] text-white text-xs sm:text-sm font-medium hover:bg-[#17251D] transition-colors whitespace-nowrap shrink-0 min-h-[40px] flex items-center"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#17251D] hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Role Sub-Bar for Authenticated Users with Multiple Dashboards (Horizontally Scrollable) */}
        {firebaseUser && userProfile && (
          <div className="bg-[#F7F9F7] border-t border-neutral-200 px-3 sm:px-6 py-2">
            <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
                <span className="text-neutral-500 shrink-0">
                  <strong className="text-[#17251D]">{userProfile.fullName}</strong>
                </span>
                <span aria-hidden="true" className="text-neutral-300">|</span>
                <Link to="/buyer" className="font-medium text-[#124A32] hover:underline shrink-0">
                  Buyer Dashboard
                </Link>
                <Link to="/seller" className="font-medium text-[#124A32] hover:underline shrink-0">
                  Seller Dashboard
                </Link>
                {isAgent && (
                  <Link to="/agent" className="font-medium text-[#124A32] hover:underline shrink-0">
                    Agent Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="font-semibold text-[#124A32] hover:underline shrink-0">
                    Admin Portal
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-neutral-600 hover:text-red-700 font-medium whitespace-nowrap shrink-0 pl-2 min-h-[32px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Hamburger Drawer with Backdrop Blur */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative bg-white border-b border-neutral-200 px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#124A32] px-2">
                Navigation
              </div>
              <div className="flex flex-col space-y-1 text-sm font-medium">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link
                  to="/browse"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>Browse Land Parcels</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link
                  to="/sell"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>Sell & Register Your Land</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>10-Stage Screening Process</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>About SLT Culture</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-[#17251D]"
                >
                  <span>Contact & Enquiry</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>
              </div>

              {firebaseUser ? (
                <div className="pt-3 border-t border-neutral-200 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-2">
                    My Portals
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/buyer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg bg-[#F7F9F7] border border-neutral-200 text-xs font-medium text-center"
                    >
                      Buyer Portal
                    </Link>
                    <Link
                      to="/seller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg bg-[#F7F9F7] border border-neutral-200 text-xs font-medium text-center"
                    >
                      Seller Portal
                    </Link>
                    {isAgent && (
                      <Link
                        to="/agent"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2.5 rounded-lg bg-[#F7F9F7] border border-neutral-200 text-xs font-medium text-center"
                      >
                        Agent Portal
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-medium text-center"
                      >
                        Admin Portal
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-2 py-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-neutral-200 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-lg border border-[#124A32] text-[#124A32] text-xs font-semibold text-center"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Real-Time Notifications Slide-Over Panel */}
      {notifDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col justify-between">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif-display text-lg font-semibold text-[#17251D]">
                  Real-Time Notifications
                </h3>
                <p className="text-xs text-neutral-500">
                  Live updates on land screening, visits, and enquiries
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  No notifications yet. Activity updates will appear here in real time.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.isRead) await markNotificationRead(n.id);
                      setNotifDrawerOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                    className={`p-3.5 rounded-lg cursor-pointer transition-colors ${
                      n.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-[#F7F9F7] border border-[#82B440]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#124A32]">{n.title}</span>
                      <span className="text-[11px] font-mono-tabular text-neutral-400">
                        {new Date(n.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport with mobile bottom bar padding */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* Sticky Compare Bar (when properties selected) — Mobile Optimized */}
      {comparedProperties.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-30 bg-[#17251D] text-white border-t border-[#D5AD51]/40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xl">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-3">
            {/* Desktop / Tablet View */}
            <div className="hidden sm:flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D5AD51]">
                <Scale className="w-4 h-4" />
                <span>Compare Lands ({comparedProperties.length}/3):</span>
              </div>
              {comparedProperties.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-lg text-xs"
                >
                  <span className="truncate max-w-[140px] md:max-w-[180px]">{cp.title}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompareProperty(cp.id)}
                    className="text-white/70 hover:text-white p-0.5"
                    aria-label="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile View: Compact Label */}
            <div className="sm:hidden flex items-center gap-2 text-xs font-semibold text-[#D5AD51]">
              <Scale className="w-4 h-4" />
              <span>Comparing ({comparedProperties.length}/3)</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearCompare}
                className="px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white min-h-[36px]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#D5AD51] text-[#17251D] text-xs font-semibold hover:bg-[#e2be69] transition-colors whitespace-nowrap min-h-[36px] flex items-center"
              >
                Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Property Comparison Modal — Fully Responsive */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <h3 className="font-serif-display text-lg sm:text-xl font-semibold text-[#17251D]">
                  Land Parcel Comparison Matrix
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Side-by-side comparison of verified metrics, access, and screening stages in Indian Rupees (₹)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                aria-label="Close Comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left border-collapse text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F9F7]">
                    <th className="p-3 font-semibold text-neutral-600 w-36 sm:w-44">Specification</th>
                    {comparedProperties.map((p) => (
                      <th key={p.id} className="p-3 font-semibold text-[#124A32] min-w-[180px]">
                        <Link
                          to={`/land/${p.id}`}
                          onClick={() => setCompareModalOpen(false)}
                          className="hover:underline line-clamp-1"
                        >
                          {p.title}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Reference ID</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 font-mono-tabular">
                        {p.referenceId}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Asking Price (₹)</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 font-mono-tabular font-bold text-[#17251D]">
                        {formatInr(p.priceInr)} {p.isNegotiable ? '(Negotiable)' : '(Fixed)'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Category & Total Area</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3 font-mono-tabular">
                        {p.category} · {p.area} {p.areaUnit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Location & Survey No.</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.village}, {p.district}, {p.state} (Sy No. {p.surveyNumber})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Road, Water & Power</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3">
                        Road: {p.roadAccess || 'Yes'} · Water: {p.waterAvailability || 'Yes'} · Power:{' '}
                        {p.electricityAvailability || 'Yes'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-neutral-600">Screening & Testing</td>
                    {comparedProperties.map((p) => (
                      <td key={p.id} className="p-3">
                        Stage {p.screeningStage}/10 ({p.status}) · {p.testingStatus || 'Verified'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Professional SLT Culture Footer */}
      <footer className="bg-[#17251D] text-white border-t border-[#124A32] mt-16 pb-8 lg:pb-0">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            <div>
              <div className="bg-white inline-block p-2 rounded-lg mb-4">
                <img
                  src="/assets/aistudio/image_de4003f1.png"
                  alt="SLT Culture Official Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <p className="text-sm font-serif-display text-[#D5AD51] italic">
                "Your Land. Our Responsibility. A Better Future."
              </p>
              <p className="text-xs text-white/75 mt-3 leading-relaxed">
                SLT Culture – Land Screening and Transforming (LST) connects landowners and buyers through structured physical site verification, soil testing, and registration coordination.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5AD51] mb-3 sm:mb-4">
                Marketplace & Workflows
              </h4>
              <ul className="space-y-2.5 text-xs text-white/80">
                <li>
                  <Link to="/browse" className="hover:text-white transition-colors py-1 block">
                    Browse Verified Lands
                  </Link>
                </li>
                <li>
                  <Link to="/sell" className="hover:text-white transition-colors py-1 block">
                    Sell & Register Your Land
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors py-1 block">
                    10-Stage Land Screening Process
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors py-1 block">
                    About SLT Culture
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors py-1 block">
                    Contact & Enquiry Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5AD51] mb-3 sm:mb-4">
                Protected Role Portals
              </h4>
              <ul className="space-y-2.5 text-xs text-white/80">
                <li>
                  <Link to="/buyer" className="hover:text-white transition-colors py-1 block">
                    Buyer Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/seller" className="hover:text-white transition-colors py-1 block">
                    Seller Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/agent" className="hover:text-white transition-colors py-1 block">
                    Field Agent Inspection Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition-colors py-1 block">
                    Administration Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors py-1 block">
                    Account Login / Signup
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5AD51] mb-3 sm:mb-4">
                Legal & Verification Notice
              </h4>
              <p className="text-xs text-white/75 leading-relaxed">
                SLT Culture provides physical screening, soil testing coordination, and registration assistance. Final title certification and government registration are executed before the Sub-Registrar and verified by licensed legal/revenue professionals.
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-[#82B440]">
                <Link to="/privacy" className="hover:underline py-1">
                  Privacy Policy
                </Link>
                <span>·</span>
                <Link to="/terms" className="hover:underline py-1">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} SLT Culture – Land Screening and Transforming (LST).
            </span>
            <span>All land values denominated in Indian Rupees (₹ INR).</span>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Tab Bar (Ergonomic Thumb Navigation for Phones) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              location.pathname === '/' ? 'text-[#124A32] font-semibold' : 'text-neutral-500 hover:text-[#17251D]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Home</span>
          </Link>

          {/* 2. Browse Land */}
          <Link
            to="/browse"
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              location.pathname.startsWith('/browse') || location.pathname.startsWith('/land')
                ? 'text-[#124A32] font-semibold'
                : 'text-neutral-500 hover:text-[#17251D]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Browse</span>
          </Link>

          {/* 3. Sell Land */}
          <Link
            to="/sell"
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              location.pathname === '/sell' ? 'text-[#124A32] font-semibold' : 'text-neutral-500 hover:text-[#17251D]'
            }`}
          >
            <PlusCircle className="w-5 h-5 text-[#82B440]" />
            <span className="text-[10px] tracking-tight mt-1">Sell Land</span>
          </Link>

          {/* 4. Notifications */}
          <button
            type="button"
            onClick={() => setNotifDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-neutral-500 hover:text-[#17251D] transition-colors relative min-h-[44px]"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#D5AD51] text-[#17251D] text-[9px] font-bold flex items-center justify-center font-mono-tabular">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">Alerts</span>
          </button>

          {/* 5. Dashboard / Account */}
          <Link
            to={firebaseUser ? primaryDash.path : '/login'}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              location.pathname === '/buyer' ||
              location.pathname === '/seller' ||
              location.pathname === '/agent' ||
              location.pathname === '/admin' ||
              location.pathname === '/login'
                ? 'text-[#124A32] font-semibold'
                : 'text-neutral-500 hover:text-[#17251D]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 truncate max-w-[55px]">
              {firebaseUser ? (isAdmin ? 'Admin' : isAgent ? 'Agent' : 'Portal') : 'Sign In'}
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

