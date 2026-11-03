import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LSTProvider, useLST } from './context/LSTContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage, SignupPage, OnboardingModal } from './pages/AuthPages';
import {
  AboutPage,
  HowItWorksPage,
  ContactUsPage,
  PrivacyPolicyPage,
  TermsConditionsPage,
} from './pages/AboutHowContactLegalPages';
import { BrowseLandPage, LandDetailsPage } from './pages/BrowseAndDetailsPages';
import { SellYourLandPage } from './pages/SellYourLandPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AgentDashboardPage } from './pages/AgentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let parsedError: { error?: string; operationType?: string; path?: string } | null = null;
      try {
        parsedError = JSON.parse(this.state.errorMessage);
      } catch {
        parsedError = null;
      }

      return (
        <div className="min-h-screen bg-[#F9FBF9] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-red-200 p-8 shadow-lg text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#17251D] mb-2">
              Application Recovery Notice
            </h1>
            <p className="text-sm text-[#4A5D52] mb-4">
              {parsedError?.error
                ? `Database security or query notice: ${parsedError.error}`
                : this.state.errorMessage}
            </p>
            {parsedError?.path && (
              <p className="text-xs font-mono bg-[#F4F7F4] text-[#17251D] px-3 py-2 rounded-xl mb-5">
                Operation: {parsedError.operationType} on {parsedError.path}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#124A32] text-white text-sm font-semibold hover:bg-[#0d3523] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reload SLT Culture Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'both' | 'agent' | 'admin')[];
}> = ({ children, allowedRoles }) => {
  const { firebaseUser, userProfile, authLoading } = useLST();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 rounded-full border-3 border-[#124A32] border-t-transparent animate-spin mb-3" />
        <p className="text-sm font-medium text-[#4A5D52]">
          Verifying SLT Culture session & permissions...
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userProfile) {
    const isAdmin = userProfile.role === 'admin';
    const isAgent = userProfile.role === 'agent';
    const uType = userProfile.userType;
    const isAllowed =
      isAdmin ||
      (isAgent && allowedRoles.includes('agent')) ||
      allowedRoles.includes(uType) ||
      (uType === 'both' &&
        (allowedRoles.includes('buyer') || allowedRoles.includes('seller')));

    if (!isAllowed) {
      return (
        <div className="max-w-xl mx-auto my-16 bg-white rounded-3xl border border-[#17251D]/10 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#17251D] mb-2">
            Role Access Restricted
          </h2>
          <p className="text-sm text-[#4A5D52] mb-6 leading-relaxed">
            Your current account role is{' '}
            <strong className="uppercase">
              {userProfile.role === 'user' ? userProfile.userType : userProfile.role}
            </strong>
            . This dashboard requires specific role permissions ({allowedRoles.join(', ')}).
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#124A32] text-white text-sm font-semibold hover:bg-[#0d3523]"
          >
            Return to Home
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  return (
    <AppErrorBoundary>
      {quotaExceeded && (
        <div
          role="alert"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: '#FEF3C7',
            color: '#92400E',
            padding: '10px 16px',
            borderBottom: '1px solid #F59E0B',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>
            The shared Maps demo key has reached its quota limit. To restore maps, create your own
            Google Cloud key and set it as <code>GOOGLE_MAPS_PLATFORM_API_KEY</code> in{' '}
            <strong>Settings &rarr; Secrets</strong>.{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#92400E', textDecoration: 'underline', fontWeight: 600 }}
            >
              Learn more
            </a>
          </span>
          <button
            onClick={() => setQuotaExceeded(false)}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              color: '#92400E',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
      )}
      <BrowserRouter>
        <LSTProvider>
          <ScrollToTop />
          <OnboardingModal />
          <Layout>
            <Routes>
              {/* Public Marketing & Discovery Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/browse" element={<BrowseLandPage />} />
              <Route path="/land/:id" element={<LandDetailsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/sell" element={<SellYourLandPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsConditionsPage />} />

              {/* Role-Protected Dashboards */}
              <Route
                path="/buyer"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'both', 'admin']}>
                    <BuyerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'both', 'admin']}>
                    <SellerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent"
                element={
                  <ProtectedRoute allowedRoles={['agent', 'admin']}>
                    <AgentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </LSTProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
