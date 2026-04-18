import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Allowed email addresses
const ALLOWED_EMAILS = ["filifonsecacagnazzo@gmail.com"];

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Check if email is allowed
export function isEmailAllowed(email: string | null): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if email is allowed
    if (!isEmailAllowed(user.email)) {
      await signOut(auth);
      return { user: null, error: "Access denied. This email is not authorized." };
    }

    return { user, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Sign-in failed";
    console.error("Google sign-in failed:", error);
    return { user: null, error: errorMessage };
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    // If user exists but email not allowed, sign them out
    if (user && !isEmailAllowed(user.email)) {
      signOut(auth);
      callback(null);
    } else {
      callback(user);
    }
  });
}

export { app, auth, db };
