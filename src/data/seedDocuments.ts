import type { DocumentFile } from '@/types';

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function buildSeedDocuments(): DocumentFile[] {
  return [
    {
      id: 'doc-eva-smlouva',
      patientId: 'pat-eva',
      type: 'smlouva',
      name: 'Smlouva_Svobodova_28032026.pdf',
      url: '#',
      sizeBytes: 420_000,
      visibleToPatient: false,
      uploadedById: 'staff-coord-1',
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'doc-eva-gdpr',
      patientId: 'pat-eva',
      type: 'gdpr',
      name: 'GDPR_Souhlas_Svobodova.pdf',
      url: '#',
      sizeBytes: 130_000,
      visibleToPatient: false,
      uploadedById: 'staff-coord-1',
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'doc-eva-lekar',
      patientId: 'pat-eva',
      type: 'lekarska',
      name: 'Zprava_po_zakroku_D3.pdf',
      url: '#',
      sizeBytes: 820_000,
      visibleToPatient: false,
      uploadedById: 'staff-tr-1',
      createdAt: isoDaysAgo(1),
    },
    {
      id: 'doc-eva-instr',
      patientId: 'pat-eva',
      type: 'instrukce',
      name: 'Instrukce_po_zakroku_CS.pdf',
      url: '#',
      sizeBytes: 210_000,
      visibleToPatient: true,
      uploadedById: 'staff-admin-1',
      createdAt: isoDaysAgo(1),
    },
    {
      id: 'doc-eva-kontakty',
      patientId: 'pat-eva',
      type: 'kontakty',
      name: 'Kontakty_kliniky.pdf',
      url: '#',
      sizeBytes: 45_000,
      visibleToPatient: true,
      uploadedById: 'staff-admin-1',
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'doc-martin-smlouva',
      patientId: 'pat-martin',
      type: 'smlouva',
      name: 'Smlouva_Novak_rezervace.pdf',
      url: '#',
      sizeBytes: 410_000,
      visibleToPatient: false,
      uploadedById: 'staff-coord-1',
      createdAt: isoDaysAgo(2),
    },
    {
      id: 'doc-jan-smlouva',
      patientId: 'pat-jan',
      type: 'smlouva',
      name: 'Smlouva_Dvorak.pdf',
      url: '#',
      sizeBytes: 430_000,
      visibleToPatient: false,
      uploadedById: 'staff-coord-1',
      createdAt: isoDaysAgo(35),
    },
  ];
}
