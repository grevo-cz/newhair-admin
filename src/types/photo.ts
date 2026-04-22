export type PhotoConsent = 'yes' | 'no' | 'pending';

export interface Photo {
  id: string;
  patientId: string;
  componentId?: string;        // ke které výzvě se foto váže (volitelné)
  challengeLabel: string;      // "Před zákrokem", "Měsíc 1" atd.
  url: string;
  thumbnailUrl: string;
  description?: string;
  marketingConsent: PhotoConsent;
  uploadedByPatient: boolean;
  createdAt: string;
}

export interface PhotoChallenge {
  key: string;
  label: string;
  referenceOffset: { ref: 'odlet' | 'zakrok' | 'navrat'; dayOffset: number };
  points: number;
}
