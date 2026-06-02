import { auth, googleProvider } from "./firebaseClient.ts";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User, 
  onAuthStateChanged 
} from "firebase/auth";

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signUpWithEmail = async (email: string, pass: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const logoutSession = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentAuthUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, (error) => {
      unsubscribe();
      reject(error);
    });
  });
};
