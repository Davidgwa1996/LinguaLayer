export interface Session {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  status: 'active' | 'ended';
  createdAt?: any;
  endedAt?: any;
  endedBy?: string;
  participantCount?: number;
  activeTypers?: Record<string, any>;
}

export interface Participant {
  id: string;
  sessionId: string;
  userId?: string;
  displayName: string;
  email?: string;
  preferredLanguage: string;
  joinedAt?: any;
  lastSeenAt?: any;
  connectionStatus?: 'online' | 'offline';
  role: 'owner' | 'participant';
}

export interface OriginalMessage {
  id: string;
  sessionId: string;
  senderParticipantId: string;
  immutableOriginalText: string;
  detectedSourceLanguage?: string;
  createdAt: any;
}

export interface ProtectedFacts {
  names: string[];
  numbers: string[];
  dates: string[];
  times: string[];
  prices: string[];
  currencies: string[];
  quantities: string[];
  addresses: string[];
  productCodes: string[];
}

export interface ReceiverDelivery {
  messageId: string;
  receiverParticipantId: string;
  targetLanguage: string;
  displayedText: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  verificationStatus?: 'verified' | 'flagged' | 'rejected';
  confidence?: number;
  createdAt: any;
}

export interface VerificationResult {
  meaningPreserved: boolean;
  targetLanguageCorrect: boolean;
  protectedFactsPreserved: boolean;
  requiresReview: boolean;
  warnings: string[];
  confidence: number;
}

export interface DisplayMessage {
  id: string;
  messageId?: string;
  type?: 'system' | 'chat';
  action?: 'joined' | 'left' | 'language_changed';
  senderParticipantId?: string;
  senderDisplayName?: string;
  displayedText: string;
  createdAt: any;
  timestamp?: any;
  deliveryStatus?: 'pending' | 'delivered' | 'failed';
}

export interface SDKError {
  code: string;
  message: string;
  retryable: boolean;
  details?: any;
}
