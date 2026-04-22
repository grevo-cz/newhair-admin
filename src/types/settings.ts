export interface WhatsAppSettings {
  phoneNumberId: string;
  accessToken: string;
  webhookUrl: string;
  verifyToken: string;
  connected: boolean;
}

export interface AppSettings {
  clinicName: string;
  supportEmail: string;
  defaultLanguage: 'cs' | 'en' | 'de' | 'sk';
  whatsapp: WhatsAppSettings;
  pointsExchange: {
    enabled: boolean;
    rules: { points: number; reward: string }[];
  };
}
