export type DocumentType =
  | 'smlouva'
  | 'gdpr'
  | 'lekarska'
  | 'instrukce'
  | 'kontakty'
  | 'jine';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  smlouva: 'Smlouva',
  gdpr: 'GDPR souhlas',
  lekarska: 'Lékařská zpráva',
  instrukce: 'Instrukce pro klienta',
  kontakty: 'Kontakty kliniky',
  jine: 'Jiné',
};

export interface DocumentFile {
  id: string;
  patientId: string;
  type: DocumentType;
  name: string;
  url: string;
  sizeBytes: number;
  visibleToPatient: boolean;
  uploadedById: string;
  createdAt: string;
}
