import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('[Auth] Starting user registration...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] User account created:', userCredential.user.uid);

      const profileData = {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('[Auth] Creating profile document...', profileData);

      try {
        await setDoc(doc(db, 'profiles', userCredential.user.uid), profileData);
        console.log('[Auth] Profile document created successfully!');
      } catch (profileError: any) {
        console.error('[Auth] Failed to create profile document:', profileError);
        console.error('[Auth] Error code:', profileError.code);
        console.error('[Auth] Error message:', profileError.message);

        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[Auth] Retrying profile creation...');
        try {
          await setDoc(doc(db, 'profiles', userCredential.user.uid), profileData);
          console.log('[Auth] Profile created on retry!');
        } catch (retryError: any) {
          console.error('[Auth] Retry failed:', retryError);
          throw new Error(`Failed to create user profile: ${retryError.message || retryError.code || 'Unknown error'}. Your account was created but profile setup failed. Please contact support.`);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
