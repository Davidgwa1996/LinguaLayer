import { db } from "./firebaseClient.ts";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const upsertUserProfile = async (uid: string, languageCode: string, languageName: string) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    languageCode,
    languageName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
};
