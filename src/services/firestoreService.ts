import { db, handleFirestoreError, OperationType, auth } from "./firebaseClient.ts";
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { UserProfile, ContactLanguageProfile, Conversation, ChatMessage } from "../types/index.ts";

export class FirestoreService {
  static async saveUser(profile: UserProfile): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");

    const pathForWrite = `users/${userId}`;
    const userRef = doc(db, "users", userId);
    let snapExists = false;
    try {
      const snap = await getDoc(userRef);
      snapExists = snap.exists();
      if (!snapExists) {
        const newProfile = {
          name: profile.name || auth.currentUser?.displayName || "User",
          preferredLanguage: profile.preferredLanguage || "English",
          languageCode: profile.languageCode || "en",
          simpleModeEnabled: profile.simpleModeEnabled || false,
          voiceModeEnabled: profile.voiceModeEnabled || false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        await setDoc(userRef, newProfile);
      } else {
        const updateData: any = {
          updatedAt: Timestamp.now()
        };
        if (profile.name !== undefined) updateData.name = profile.name;
        if (profile.preferredLanguage !== undefined) updateData.preferredLanguage = profile.preferredLanguage;
        if (profile.languageCode !== undefined) updateData.languageCode = profile.languageCode;
        if (profile.simpleModeEnabled !== undefined) updateData.simpleModeEnabled = profile.simpleModeEnabled;
        if (profile.voiceModeEnabled !== undefined) updateData.voiceModeEnabled = profile.voiceModeEnabled;
        
        await updateDoc(userRef, updateData);
      }
    } catch (error) {
      handleFirestoreError(error, snapExists ? OperationType.UPDATE : OperationType.CREATE, pathForWrite);
    }
  }

  static async getUser(userId: string): Promise<UserProfile | null> {
    const pathForRead = `users/${userId}`;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          preferredLanguage: data.preferredLanguage,
          languageCode: data.languageCode,
          simpleModeEnabled: data.simpleModeEnabled,
          voiceModeEnabled: data.voiceModeEnabled,
        } as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, pathForRead);
    }
  }

  static async saveContact(contactId: string, contact: ContactLanguageProfile): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");

    const pathForWrite = `users/${userId}/contacts/${contactId}`;
    try {
      const contactRef = doc(db, "users", userId, "contacts", contactId);
      const snap = await getDoc(contactRef);
      
      if (!snap.exists()) {
        await setDoc(contactRef, {
          contactName: contact.contactName || contact.name || "Unknown",
          preferredLanguage: contact.preferredLanguage,
          languageCode: contact.languageCode,
          lastUsedAt: Timestamp.now()
        });
      } else {
        await updateDoc(contactRef, {
          contactName: contact.contactName || contact.name,
          preferredLanguage: contact.preferredLanguage,
          languageCode: contact.languageCode,
          lastUsedAt: Timestamp.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    }
  }

  static async getContacts(): Promise<ContactLanguageProfile[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    const pathForRead = `users/${userId}/contacts`;
    try {
      const contactsRef = collection(db, "users", userId, "contacts");
      const snap = await getDocs(contactsRef);
      return snap.docs.map((doc: any) => ({
        id: doc.id,
        contactId: doc.id,
        ...doc.data()
      } as ContactLanguageProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, pathForRead);
      return [];
    }
  }

  static async getContact(contactId: string): Promise<ContactLanguageProfile | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    
    const pathForRead = `users/${userId}/contacts/${contactId}`;
    try {
      const docRef = doc(db, "users", userId, "contacts", contactId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          id: snap.id,
          contactId: snap.id,
          ...snap.data()
        } as ContactLanguageProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, pathForRead);
      return null;
    }
  }
}
