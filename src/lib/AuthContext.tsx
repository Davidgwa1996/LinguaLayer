import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, signInAnonymously, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInAsGuest: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result) {
        const redirect = localStorage.getItem('redirect_after_login');
        if (redirect) {
          window.location.hash = redirect;
          localStorage.removeItem('redirect_after_login');
        }
      }
    }).catch((error) => {
      console.error("Redirect sign in failed", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    localStorage.setItem('redirect_after_login', window.location.hash);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (error: any) {
        console.error("Google mobile sign in failed", error);
        alert(`Sign in failed: ${error.message || 'Unknown error'}`);
      }
    } else {
      try {
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
          try {
            await signInWithRedirect(auth, provider);
          } catch (redirectError: any) {
            console.error("Redirect fallback failed", redirectError);
            alert(`Sign in failed: ${redirectError.message || 'Unknown error'}`);
          }
        } else {
          console.error("Google sign in failed", error);
          if (error.code === 'auth/unauthorized-domain') {
            alert(`Firebase domain authorization error. Please add this exact domain to Firebase Console > Authentication > Settings > Authorized domains.`);
          } else {
            alert(`Sign in failed: ${error.message || 'Unknown error'}`);
          }
        }
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Guest sign in failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

