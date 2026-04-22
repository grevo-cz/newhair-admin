import type { Photo, PhotoChallenge } from '@/types';

export const PHOTO_CHALLENGES: PhotoChallenge[] = [
  { key: 'before', label: 'Před zákrokem', referenceOffset: { ref: 'zakrok', dayOffset: -1 }, points: 30 },
  { key: 'day1', label: 'Den po zákroku', referenceOffset: { ref: 'zakrok', dayOffset: 1 }, points: 30 },
  { key: 'week1', label: 'Týden po návratu', referenceOffset: { ref: 'navrat', dayOffset: 7 }, points: 50 },
  { key: 'month1', label: 'Měsíc 1', referenceOffset: { ref: 'navrat', dayOffset: 30 }, points: 100 },
  { key: 'month3', label: 'Měsíc 3', referenceOffset: { ref: 'navrat', dayOffset: 90 }, points: 150 },
  { key: 'month6', label: 'Měsíc 6', referenceOffset: { ref: 'navrat', dayOffset: 180 }, points: 200 },
  { key: 'month12', label: 'Měsíc 12', referenceOffset: { ref: 'navrat', dayOffset: 365 }, points: 250 },
];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function buildSeedPhotos(): Photo[] {
  return [
    {
      id: 'photo-eva-before-1',
      patientId: 'pat-eva',
      challengeLabel: 'Před zákrokem',
      url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300',
      marketingConsent: 'yes',
      uploadedByPatient: true,
      createdAt: isoDaysAgo(4),
      description: 'Pohled zezadu.',
    },
    {
      id: 'photo-eva-before-2',
      patientId: 'pat-eva',
      challengeLabel: 'Před zákrokem',
      url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300',
      marketingConsent: 'yes',
      uploadedByPatient: true,
      createdAt: isoDaysAgo(4),
    },
    {
      id: 'photo-eva-day1',
      patientId: 'pat-eva',
      challengeLabel: 'Den po zákroku',
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300',
      marketingConsent: 'pending',
      uploadedByPatient: true,
      createdAt: isoDaysAgo(2),
    },
    {
      id: 'photo-jan-m1',
      patientId: 'pat-jan',
      challengeLabel: 'Měsíc 1',
      url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300',
      marketingConsent: 'yes',
      uploadedByPatient: true,
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'photo-petr-m3',
      patientId: 'pat-petr',
      challengeLabel: 'Měsíc 3',
      url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
      marketingConsent: 'yes',
      uploadedByPatient: true,
      createdAt: isoDaysAgo(10),
    },
  ];
}
