import { db } from "./firebaseClient.ts";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, collection } from "firebase/firestore";

export const createRoom = async (uid: string, languageData: { code: string, name: string }) => {
  const newRoomRef = doc(collection(db, "rooms"));
  const roomId = newRoomRef.id;

  await setDoc(newRoomRef, {
    roomId,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    participantLanguages: [languageData.code],
    theme: "default",
    pinnedMessageId: null,
    lastMessage: null
  });

  await setDoc(doc(db, "rooms", roomId, "participants", uid), {
    uid,
    languageCode: languageData.code,
    languageName: languageData.name,
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp()
  });

  return roomId;
};

export const joinRoom = async (roomId: string, uid: string, languageData: { code: string, name: string }) => {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Room does not exist.");
  }

  const participantRef = doc(db, "rooms", roomId, "participants", uid);
  await setDoc(participantRef, {
    uid,
    languageCode: languageData.code,
    languageName: languageData.name,
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp()
  }, { merge: true });

  await updateDoc(roomRef, {
    participantLanguages: arrayUnion(languageData.code)
  });

  return roomSnap.data();
};

export const updateRoomTheme = async (roomId: string, theme: string) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { theme });
};

export const pinMessage = async (roomId: string, messageId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { pinnedMessageId: messageId });
};

export const unpinMessage = async (roomId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { pinnedMessageId: null });
};
