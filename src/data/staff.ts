import type { Staff } from '@/types';
export { STAFF_ROLE_LABELS } from '@/types';

export const STAFF: Staff[] = [
  {
    id: 'staff-admin-1',
    firstName: 'Anna',
    lastName: 'Nováková',
    role: 'admin_cz',
    email: 'anna.novakova@newhair.cz',
    phone: '+420 777 111 222',
  },
  {
    id: 'staff-coord-1',
    firstName: 'Lucie',
    lastName: 'Černá',
    role: 'coordinator_cz',
    email: 'lucie.cerna@newhair.cz',
    phone: '+420 777 333 444',
  },
  {
    id: 'staff-tr-1',
    firstName: 'Ayşe',
    lastName: 'Kaya',
    role: 'staff_tr',
    email: 'ayse.kaya@newhair.cz',
    phone: '+90 532 555 0011',
  },
  {
    id: 'staff-doc-1',
    firstName: 'Mehmet',
    lastName: 'Yilmaz',
    role: 'doctor_tr',
    email: 'dr.mehmet@newhair.cz',
    phone: '+90 532 555 0022',
  },
  {
    id: 'staff-doc-2',
    firstName: 'Emre',
    lastName: 'Demir',
    role: 'doctor_tr',
    email: 'dr.emre@newhair.cz',
    phone: '+90 532 555 0033',
  },
];

export const CURRENT_ADMIN_ID = 'staff-admin-1';

export function staffById(id: string): Staff | undefined {
  return STAFF.find((s) => s.id === id);
}

export function staffLabel(id: string): string {
  const s = staffById(id);
  return s ? `${s.firstName} ${s.lastName}` : '—';
}
