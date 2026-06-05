import { db, auth } from '../lib/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, addDoc, 
  onSnapshot, query, orderBy, limit, serverTimestamp, 
  Unsubscribe 
} from 'firebase/firestore';
import { Session, Participant, DisplayMessage } from '../types';

export interface CreateSessionInput {}
export interface JoinSessionInput {
  sessionId: string;
  preferredLanguage: string;
  displayName?: string;
}
export interface SendMessageInput {
  text: string;
  originalPayload?: any; 
}
export interface MessageDeliveryResult {
  success: boolean;
}

export class LinguaLayerClient {
  private sessionId: string | null = null;
  private participantId: string | null = null;
  
  constructor() {
    this.participantId = localStorage.getItem('lingualayer-pid');
    if (!this.participantId) {
      this.participantId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('lingualayer-pid', this.participantId);
    }
  }
  
  getParticipantId() {
    return this.participantId;
  }

  async createSession(input?: CreateSessionInput): Promise<Session> {
    if (!auth.currentUser) throw new Error("Must be signed in to create session");
    const newRoomId = Math.random().toString(36).substring(2, 8);
    const sessionDoc = {
      created: serverTimestamp(),
      createdAt: serverTimestamp(),
      activeTypers: {},
      status: 'active',
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email
    };
    await setDoc(doc(db, 'rooms', newRoomId), sessionDoc);
    this.sessionId = newRoomId;
    return { id: newRoomId, ...sessionDoc } as Session;
  }

  async getSession(sessionId: string): Promise<Session> {
    const docSnap = await getDoc(doc(db, 'rooms', sessionId));
    if (!docSnap.exists()) throw new Error("Session not found");
    return { id: sessionId, ...docSnap.data() } as Session;
  }

  async joinSession(input: JoinSessionInput): Promise<Participant> {
    this.sessionId = input.sessionId;
    const p: Participant = {
      id: this.participantId!,
      sessionId: input.sessionId,
      displayName: input.displayName || 'Guest',
      preferredLanguage: input.preferredLanguage,
      role: 'participant',
      joinedAt: serverTimestamp(),
    };
    // Let's send a joined message
    await this.sendSystemMessage('joined');
    return p;
  }

  async setPreferredLanguage(languageCode: string): Promise<void> {
    // In current LiveChat, this updates local state. 
    // Usually we might update user doc or emit a system message.
  }

  async switchLanguage(languageCode: string): Promise<void> {
    await this.setPreferredLanguage(languageCode);
  }

  async sendMessage(input: SendMessageInput): Promise<MessageDeliveryResult> {
    if (!this.sessionId) throw new Error("Not in a session");
    
    // Fallback: If originalPayload is passed (for backward compatibility), use it.
    // Otherwise construct the basic payload.
    const payload = input.originalPayload || {
      id: Date.now().toString() + this.participantId,
      participantId: this.participantId,
      originalText: input.text,
      timestamp: Date.now(),
      type: 'chat'
    };
    
    await addDoc(collection(db, 'rooms', this.sessionId, 'messages'), payload);
    return { success: true };
  }
  
  async sendSystemMessage(action: 'joined'|'left', extraData?: any) {
    if (!this.sessionId) return;
    try {
      await addDoc(collection(db, 'rooms', this.sessionId, 'messages'), {
        id: Date.now().toString() + this.participantId,
        type: 'system',
        action,
        participantId: this.participantId,
        timestamp: Date.now(),
        ...extraData
      });
    } catch(e) {}
  }

  subscribeToMessages(callback: (message: any) => void): () => void {
    if (!this.sessionId) return () => {};
    const q = query(collection(db, 'rooms', this.sessionId, 'messages'), orderBy('timestamp', 'desc'), limit(50));
    let isInitialLoad = true;
    const unsub = onSnapshot(q, (snapshot) => {
      if (!isInitialLoad) {
         snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
               callback(change.doc.data());
            }
         });
      } else {
         isInitialLoad = false;
      }
    });
    return unsub;
  }

  subscribeToSession(callback: (session: any) => void): () => void {
    if (!this.sessionId) return () => {};
    const unsub = onSnapshot(doc(db, 'rooms', this.sessionId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({ id: docSnapshot.id, ...docSnapshot.data() });
      }
    });
    return unsub;
  }

  async leaveSession(): Promise<void> {
    await this.sendSystemMessage('left');
    this.sessionId = null;
  }

  async rejoinSession(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    await this.sendSystemMessage('joined');
  }

  async endSession(): Promise<void> {
    if (!this.sessionId) return;
    await updateDoc(doc(db, 'rooms', this.sessionId), { status: 'ended' });
  }

  async updateTyping(isTyping: boolean, displayName: string) {
    if (!this.sessionId) return;
    await updateDoc(doc(db, 'rooms', this.sessionId), {
       [`activeTypers.${this.participantId}`]: isTyping ? displayName : null
    });
  }

  destroy(): void {
    // cleanup
  }
}

export function createLinguaLayerClient(): LinguaLayerClient {
  return new LinguaLayerClient();
}
