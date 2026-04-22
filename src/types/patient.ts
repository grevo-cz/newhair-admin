export type Language = 'cs' | 'en' | 'de' | 'sk';
export type SurgeryType = 'DHI' | 'FUE' | 'Combo';
export type PatientStatus = 'active' | 'archived';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  birthDate?: string;          // ISO yyyy-mm-dd
  nationality?: string;
  language: Language;

  departureDate: string;       // ISO — datum odletu z ČR
  surgeryDate: string;         // ISO — datum zákroku (Den 0)
  returnDate: string;          // ISO — datum návratu do ČR

  surgeryType: SurgeryType;
  graftCount: number;

  doctorId: string;
  coordinatorId: string;
  planTemplateId: string | null;

  points: number;              // gamifikace
  status: PatientStatus;
  internalNote?: string;

  welcomeEmailSent: boolean;
  pushEnabled: boolean;
  whatsappBroadcast: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export type StaffRole = 'admin_cz' | 'coordinator_cz' | 'staff_tr' | 'doctor_tr';

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin_cz: 'Admin CZ',
  coordinator_cz: 'Koordinátor CZ',
  staff_tr: 'Personál TR',
  doctor_tr: 'Lékař TR',
};
