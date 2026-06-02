import { storage } from "./firebaseClient.ts";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadVoiceMessage = async (roomId: string, uid: string, messageId: string, audioBlob: Blob) => {
  const fileRef = ref(storage, `rooms/${roomId}/voice/${uid}/${messageId}.webm`);
  await uploadBytes(fileRef, audioBlob);
  const url = await getDownloadURL(fileRef);
  return { voiceUrl: url, voicePath: fileRef.fullPath };
};
