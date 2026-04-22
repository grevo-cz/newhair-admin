import type { Thread } from '@/types';

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export function buildSeedThreads(): Thread[] {
  return [
    {
      patientId: 'pat-eva',
      archived: false,
      messages: [
        {
          id: 'msg-eva-1',
          patientId: 'pat-eva',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'Dobrý den, mám trochu jiné svědění, je to normální?',
          timestamp: hoursAgo(26),
          read: true,
        },
        {
          id: 'msg-eva-2',
          patientId: 'pat-eva',
          sender: 'admin',
          channel: 'whatsapp',
          text: 'Dobrý den Evo, ano — svědění v den 3 je naprosto normální. Folliculy se zakotvují a kůže se hojí.',
          timestamp: hoursAgo(25),
          read: true,
        },
        {
          id: 'msg-eva-3',
          patientId: 'pat-eva',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'Díky! Stroupky jsou stále tam, můžu si je opatrně umýt?',
          timestamp: hoursAgo(3),
          read: false,
        },
        {
          id: 'msg-eva-4',
          patientId: 'pat-eva',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'A kdy můžu zase na sport? 🏃‍♀️',
          timestamp: hoursAgo(2),
          read: false,
        },
      ],
    },
    {
      patientId: 'pat-martin',
      archived: false,
      messages: [
        {
          id: 'msg-martin-1',
          patientId: 'pat-martin',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'Dobrý den, ještě otázka — můžu si den před odletem dát jedno pivo?',
          timestamp: hoursAgo(48),
          read: true,
        },
        {
          id: 'msg-martin-2',
          patientId: 'pat-martin',
          sender: 'admin',
          channel: 'whatsapp',
          text: 'Dobrý den, raději bez alkoholu min. 3 dny před odletem. Díky za pochopení!',
          timestamp: hoursAgo(47),
          read: true,
        },
        {
          id: 'msg-martin-3',
          patientId: 'pat-martin',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'OK rozumím 👍',
          timestamp: hoursAgo(47),
          read: true,
        },
      ],
    },
    {
      patientId: 'pat-jan',
      archived: false,
      messages: [
        {
          id: 'msg-jan-1',
          patientId: 'pat-jan',
          sender: 'patient',
          channel: 'whatsapp',
          text: 'Ahoj, píše mi appka že mám nafotit měsíc 1 — stačí 2 fotky ze zadu a zepředu?',
          timestamp: hoursAgo(120),
          read: true,
        },
        {
          id: 'msg-jan-2',
          patientId: 'pat-jan',
          sender: 'admin',
          channel: 'whatsapp',
          text: 'Ahoj Jane, ideálně 3–4 záběry (zepředu, 2× ze stran, zezadu). Dobré světlo a hlava suchá.',
          timestamp: hoursAgo(119),
          read: true,
        },
      ],
    },
  ];
}

export const MESSAGE_SNIPPETS: string[] = [
  'Dobrý den, děkuji za zprávu. Podíváme se a ozvu se vám do hodiny.',
  'To, co popisujete, je naprosto normální. Folliculy se zakotvují, svědění ustoupí během pár dní.',
  'Stroupky jsou součástí procesu hojení. Neoddělávejte je, odpadnou samy mezi dnem 10–14.',
  'Pokud potíže přetrvávají, zavolejte prosím na linku +420 777 111 222 nebo se ozvěte lékaři.',
  'Pokračujte v péči podle plánu v aplikaci. Při pochybnostech napište zprávu.',
];
