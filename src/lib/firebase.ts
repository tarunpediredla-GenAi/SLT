import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Route Firebase Identity Toolkit & SecureToken REST calls through our same-origin server proxy
// so browser extensions, cross-origin iframe policies, or client clock skew cannot cause auth/internal-error
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  if (!(window as any).__sltFirebaseFetchPatched) {
    (window as any).__sltFirebaseFetchPatched = true;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
            ? input.toString()
            : input.url;

        if (
          url.startsWith('https://identitytoolkit.googleapis.com/') ||
          url.startsWith('https://securetoken.googleapis.com/')
        ) {
          const method = init?.method || (input instanceof Request ? input.method : 'POST');
          const rawHeaders: Record<string, string> = {};
          const headerSource = init?.headers || (input instanceof Request ? input.headers : undefined);
          if (headerSource) {
            if (headerSource instanceof Headers) {
              headerSource.forEach((v, k) => {
                rawHeaders[k] = v;
              });
            } else if (Array.isArray(headerSource)) {
              for (const [k, v] of headerSource) {
                rawHeaders[k] = v;
              }
            } else {
              Object.assign(rawHeaders, headerSource);
            }
          }

          let bodyText: string | undefined;
          if (init?.body !== undefined && init?.body !== null) {
            if (typeof init.body === 'string') {
              bodyText = init.body;
            } else if (init.body instanceof URLSearchParams) {
              bodyText = init.body.toString();
            }
          }

          const proxyRes = await originalFetch('/api/firebase-auth-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetUrl: url,
              method,
              headers: rawHeaders,
              body: bodyText,
            }),
          });

          if (proxyRes.status !== 502 && proxyRes.status !== 404) {
            return proxyRes;
          }
        }
      } catch (proxyErr) {
        console.warn('Auth proxy fallback to direct fetch:', proxyErr);
      }
      return originalFetch(input, init);
    };
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

function createResilientAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        inMemoryPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createResilientAuth();
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function formatFirebaseAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  const code = (err as any)?.code || '';

  if (code === 'auth/invalid-credential' || raw.includes('auth/invalid-credential') || raw.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'Incorrect password for this email address. Please check your password or click "Forgot password?".';
  }
  if (code === 'auth/email-already-in-use' || raw.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Signing you in or please use the Sign In tab.';
  }
  if (code === 'auth/weak-password' || raw.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters long.';
  }
  if (code === 'auth/invalid-email' || raw.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests' || raw.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (
    code === 'auth/internal-error' ||
    raw.includes('auth/internal-error') ||
    code === 'auth/popup-blocked' ||
    raw.includes('auth/popup-blocked') ||
    code === 'auth/popup-closed-by-user' ||
    raw.includes('auth/popup-closed-by-user') ||
    code === 'auth/cancelled-popup-request'
  ) {
    return 'Google popup was blocked by the embedded browser preview. Please confirm your Google email in the selector to continue.';
  }
  return raw.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[^)]+\)\.?/gi, '').trim() || 'Authentication could not be completed. Please try again.';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export function makeSafeId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `${prefix}_${timePart}_${randomPart}`.replace(/[^a-zA-Z0-9_-]/g, '');
}
