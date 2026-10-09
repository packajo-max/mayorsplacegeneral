import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Verified admin emails according to project security spec
const BOOTSTRAP_ADMIN_EMAILS = ['johncoleexpert@gmail.com', 'admin@agrostreampremier.ng'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const email = currentUser.email?.toLowerCase();
        let authorized = false;

        if (email && BOOTSTRAP_ADMIN_EMAILS.includes(email)) {
          authorized = true;
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              authorized = true;
            }
          } catch (e) {
            console.warn('Error verifying admin document in firestore:', e);
          }
        }
        setIsAdmin(authorized);
      } else {
        // Check if demo admin session was activated in localStorage
        const demoAuth = localStorage.getItem('agro_admin_session');
        if (demoAuth === 'active') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Firebase Google popup sign in failed:', error);
      throw error;
    }
  };

  const loginAsDemoAdmin = () => {
    localStorage.setItem('agro_admin_session', 'active');
    setIsAdmin(true);
  };

  const logout = async () => {
    localStorage.removeItem('agro_admin_session');
    setIsAdmin(false);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        loginWithGoogle,
        logout,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
