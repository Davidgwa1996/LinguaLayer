import { db, logEvent } from "./firebaseClient.ts";
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from "firebase/firestore";
import { getCurrentAuthUser } from "./authService.ts";
import { joinRoom } from "./roomService.ts";
import { uploadVoiceMessage } from "./storageService.ts";

export const sendTextMessage = async (
  roomId: string,
  text: string,
  currentUserProfile: { uid: string, languageCode: string, languageName: string },
  precomputedTranslations: Record<string, any> = {}
) => {
  const user = await getCurrentAuthUser();
  if (!user?.uid) throw new Error("No authenticated user");

  // Ensure they are a participant
  await joinRoom(roomId, user.uid, { code: currentUserProfile.languageCode, name: currentUserProfile.languageName });

  const messageId = "msg_" + Date.now();
  const msgRef = doc(db, "rooms", roomId, "messages", messageId);

  await setDoc(msgRef, {
    id: messageId,
    roomId,
    senderId: user.uid,
    senderLanguageCode: currentUserProfile.languageCode,
    senderLanguageName: currentUserProfile.languageName,
    type: "text",
    originalText: text,
    translations: precomputedTranslations,
    pinned: false,
    createdAt: serverTimestamp(),
  });
};

export const sendVoiceMessage = async (roomId: string, voiceBlob: Blob, durationMs: number, currentUserProfile: { uid: string, languageCode: string, languageName: string }) => {
  const user = await getCurrentAuthUser();
  if (!user?.uid) throw new Error("No authenticated user");

  await joinRoom(roomId, user.uid, { code: currentUserProfile.languageCode, name: currentUserProfile.languageName });

  const messageId = "msg_" + Date.now();
  const { voiceUrl, voicePath } = await uploadVoiceMessage(roomId, user.uid, messageId, voiceBlob);

  const msgRef = doc(db, "rooms", roomId, "messages", messageId);

  await setDoc(msgRef, {
    id: messageId,
    roomId,
    senderId: user.uid,
    senderLanguageCode: currentUserProfile.languageCode,
    senderLanguageName: currentUserProfile.languageName,
    type: "voice",
    originalText: "🎤 Voice Message",
    voiceUrl,
    voicePath,
    voiceDurationMs: durationMs,
    translations: {},
    pinned: false,
    createdAt: serverTimestamp(),
  });
};

export const listenToMessages = (roomId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, "rooms", roomId, "messages"),
    orderBy("createdAt", "asc")
  );
  
  let isFirstLoad = true;

  return onSnapshot(q, (snapshot) => {
    // Only log new messages (skip the initial bulk list)
    if (!isFirstLoad) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          logEvent("message_received", { roomId, messageId: change.doc.id });
        }
      });
    }
    isFirstLoad = false;
    
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      let createdAtStr = new Date().toISOString();
      if (data.createdAt?.toDate) {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === "string") {
         createdAtStr = data.createdAt;
      } else if (typeof data.createdAt === "number") {
         createdAtStr = new Date(data.createdAt).toISOString();
      }
      return {
        ...data,
        createdAt: createdAtStr
      };
    });
    callback(messages);
  });
};

export const addReaction = async (roomId: string, messageId: string, emoji: string, uid: string) => {
  const msgRef = doc(db, "rooms", roomId, "messages", messageId);
  const reactionRef = doc(db, "rooms", roomId, "messages", messageId, "reactions", uid);

  await setDoc(reactionRef, {
    uid,
    emoji,
    createdAt: serverTimestamp()
  });

  // We need to clear this user from any other emoji arrays first. 
  // Given we know the set of common emojis, we can arrayRemove from all of them and arrayUnion on the target
  const allEmojis = ["👍", "❤️", "😂", "😮", "🙏"];
  const updatePayload: any = {};
  allEmojis.forEach(e => {
    if (e === emoji) {
       updatePayload[`reactions.${e}`] = arrayUnion(uid);
    } else {
       updatePayload[`reactions.${e}`] = arrayRemove(uid);
    }
  });

  await updateDoc(msgRef, updatePayload);
  logEvent("reaction_added", { roomId, messageId, emoji });
};

export const removeReaction = async (roomId: string, messageId: string, uid: string, currentEmoji: string) => {
  const reactionRef = doc(db, "rooms", roomId, "messages", messageId, "reactions", uid);
  const msgRef = doc(db, "rooms", roomId, "messages", messageId);

  // remove it from aggregate
  await updateDoc(msgRef, {
    [`reactions.${currentEmoji}`]: arrayRemove(uid)
  });
};

export const listenToReactions = (roomId: string, messageId: string, callback: (reactions: any) => void) => {
  const q = collection(db, "rooms", roomId, "messages", messageId, "reactions");
  return onSnapshot(q, (snapshot) => {
    const reacts = snapshot.docs.map(d => d.data());
    callback(reacts);
  });
};
