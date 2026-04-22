import type { AppSettings } from '@/types';

export function buildSeedSettings(): AppSettings {
  return {
    clinicName: 'NewHair',
    supportEmail: 'support@newhair.cz',
    defaultLanguage: 'cs',
    whatsapp: {
      phoneNumberId: '116849247830341',
      accessToken: 'EAAJ***_ukazkovy_token_***',
      webhookUrl: 'https://api.newhair.cz/webhooks/whatsapp',
      verifyToken: 'nh_verify_8s3h2k',
      connected: true,
    },
    pointsExchange: {
      enabled: false,
      rules: [
        { points: 500, reward: 'Sleva 5% na doplňkový produkt v e-shopu' },
        { points: 1000, reward: 'Doporučující dárek (kosmetika)' },
      ],
    },
  };
}
