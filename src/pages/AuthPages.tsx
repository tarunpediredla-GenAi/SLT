import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useLST } from '../context/LSTContext';
import { UserType, INDIAN_STATES } from '../types/lst';

export const LoginPage: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    resetPassword,
    firebaseUser,
    userProfile,
  } = useLST();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const redirectAfterAuth = () => {
    if (userProfile?.role === 'admin') navigate('/admin');
    else if (userProfile?.role === 'agent') navigate('/agent');
    else if (userProfile?.userType === 'seller') navigate('/seller');
    else navigate('/buyer');
  };

  if (firebaseUser && userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-neutral-200 rounded-xl p-8">
          <img
            src="/assets/aistudio/image_de4003f1.png"
            alt="SLT Culture Logo"
            className="h-12 mx-auto mb-4 object-contain"
          />
          <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
            You are signed in
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Logged in as <strong>{userProfile.fullName}</strong> ({userProfile.email})
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={redirectAfterAuth}
              className="w-full py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
            >
              Go to My Dashboard
            </button>
            <Link
              to="/browse"
              className="w-full py-2.5 rounded-lg border border-neutral-300 text-xs font-medium text-[#17251D]"
            >
              Browse Verified Lands
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setError('Enter your email address above first to receive a password reset link.');
      return;
    }
    try {
      await resetPassword(email);
      setResetMessage(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err: any) {
      setError(err?.message || 'Could not send password reset email.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white border border-neutral-200 rounded-xl p-8">
        <div className="text-center">
          <img
            src="/assets/aistudio/image_de4003f1.png"
            alt="SLT Culture Official Logo"
            className="h-12 w-auto mx-auto object-contain"
          />
          <h1 className="font-serif-display text-2xl font-semibold text-[#17251D] mt-4">
            Sign In to SLT Culture
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Land Screening and Transforming (LST) — Buyer, Seller & Staff Portal
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}
        {resetMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {resetMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full py-2.5 px-4 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-[#17251D] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>Continue with Google</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          <span>or sign in with email</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#17251D]">Password</label>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-xs text-[#124A32] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-neutral-600 mt-6">
          New to SLT Culture?{' '}
          <Link to="/signup" className="font-semibold text-[#124A32] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const { signupWithEmail, loginWithGoogle, firebaseUser, userProfile } = useLST();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (firebaseUser && userProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-neutral-200 rounded-xl p-8">
          <CheckCircle2 className="w-10 h-10 text-[#82B440] mx-auto mb-3" />
          <h2 className="font-serif-display text-2xl font-semibold text-[#17251D]">
            Account Ready
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Welcome, {userProfile.fullName}. Your {userProfile.userType} profile is active.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(userProfile.userType === 'seller' ? '/seller' : '/buyer')
            }
            className="mt-5 w-full py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signupWithEmail(email, password, fullName);
    } catch (err: any) {
      setError(err?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white border border-neutral-200 rounded-xl p-8">
        <div className="text-center">
          <img
            src="/assets/aistudio/image_de4003f1.png"
            alt="SLT Culture Official Logo"
            className="h-12 w-auto mx-auto object-contain"
          />
          <h1 className="font-serif-display text-2xl font-semibold text-[#17251D] mt-4">
            Create Your SLT Culture Account
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Register as a Land Buyer, Land Seller, or Both
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              await loginWithGoogle();
            } catch (err: any) {
              setError(err?.message || 'Google signup failed.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="mt-6 w-full py-2.5 px-4 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-[#17251D] flex items-center justify-center gap-2 transition-colors"
        >
          <span>Continue with Google</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          <span>or sign up with email</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Create Password (min. 6 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-[#124A32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up & Continue'}
          </button>
        </form>

        <p className="text-xs text-center text-neutral-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#124A32] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

// First-Login Profile Completion & Buyer/Seller Role Selector Modal (Matches Flowchart "Buyer and Seller Page")
export const OnboardingModal: React.FC = () => {
  const { firebaseUser, needsOnboarding, completeOnboarding, logoutUser } = useLST();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(firebaseUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [pinCode, setPinCode] = useState('');
  const [userType, setUserType] = useState<UserType>('buyer');
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!needsOnboarding || !firebaseUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError('Full name and mobile number are required.');
      return;
    }
    if (!privacyConsent) {
      setError('Please accept the privacy consent to complete your profile.');
      return;
    }
    setSubmitting(true);
    try {
      await completeOnboarding({
        fullName,
        phone,
        altPhone,
        address,
        city,
        state,
        pinCode,
        userType,
        privacyConsent,
      });
      if (userType === 'seller') navigate('/seller');
      else navigate('/buyer');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full p-7 border border-neutral-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_de4003f1.png"
              alt="SLT Culture"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#17251D]">
                Complete Your SLT Culture Profile
              </h2>
              <p className="text-xs text-neutral-500">
                Select your role as shown in the SLT Buyer & Seller workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logoutUser}
            className="text-xs text-neutral-500 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-[#17251D] mb-2">
              How would you like to use SLT Culture? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'buyer' as UserType,
                  title: 'Buyer',
                  desc: 'Browse verified lands, compare prices & book site visits',
                },
                {
                  id: 'seller' as UserType,
                  title: 'Seller',
                  desc: 'Register land, request agent screening & sell securely',
                },
                {
                  id: 'both' as UserType,
                  title: 'Both Buyer & Seller',
                  desc: 'Access both Buyer and Seller protected dashboards',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setUserType(opt.id)}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    userType === opt.id
                      ? 'border-[#124A32] bg-[#124A32]/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#124A32]">{opt.title}</div>
                  <div className="text-[11px] text-neutral-600 mt-1 leading-snug">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full legal name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Visakhapatnam"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#17251D] mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="530001"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17251D] mb-1">
              Address (Optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Door No., Street, Locality"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 text-[#124A32]"
            />
            <span>
              I agree to SLT Culture's Terms & Conditions and Privacy Policy for land screening and agent coordination.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#124A32] text-white text-xs font-semibold hover:bg-[#17251D] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving Profile...' : 'Save Profile & Open Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
