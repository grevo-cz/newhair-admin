import type { PlanTemplate, PlanPhase, DayCard, ComponentItem } from '@/types';

function phase(overrides: Partial<PlanPhase>): PlanPhase {
  return {
    id: crypto.randomUUID(),
    templateId: '',
    name: '',
    slug: 'pred-odletem',
    order: 0,
    relativeTo: 'zakrok',
    heroColor: 'dark',
    icon: 'plane',
    dayCards: [],
    ...overrides,
  };
}

function card(overrides: Partial<DayCard>): DayCard {
  return {
    id: crypto.randomUUID(),
    phaseId: '',
    dayFrom: 0,
    dayTo: 0,
    order: 0,
    components: [],
    ...overrides,
  };
}

function comp(overrides: Partial<ComponentItem>): ComponentItem {
  return {
    id: crypto.randomUUID(),
    dayCardId: '',
    type: 'instrukce',
    name: '',
    hasDetail: false,
    icon: 'check',
    requiresCompletion: false,
    requiresPhoto: false,
    pointsForCompletion: 0,
    order: 0,
    ...overrides,
  };
}

function buildDhiTemplate(): PlanTemplate {
  const templateId = 'plan-dhi';

  const pPred = phase({
    id: 'phase-dhi-pred',
    templateId,
    name: 'Před odletem',
    slug: 'pred-odletem',
    order: 0,
    relativeTo: 'odlet',
    heroColor: 'dark',
    icon: 'plane',
    quote: 'Připrav se na svůj nový začátek.',
    description: 'Příprava v ČR před odletem do Istanbulu.',
  });

  const pPobyt = phase({
    id: 'phase-dhi-pobyt',
    templateId,
    name: 'Pobyt v Istanbulu',
    slug: 'pobyt',
    order: 1,
    relativeTo: 'zakrok',
    heroColor: 'teal',
    icon: 'zap',
    quote: 'Den zákroku je tady.',
    description: 'Pobyt v Istanbulu — den zákroku a dny po něm.',
  });

  const pPo = phase({
    id: 'phase-dhi-po',
    templateId,
    name: 'Po návratu',
    slug: 'po-navratu',
    order: 2,
    relativeTo: 'navrat',
    heroColor: 'purple',
    icon: 'home',
    quote: 'Doma pokračuje péče — důslednost přináší výsledky.',
    description: 'Návrat domů a dlouhodobá péče.',
  });

  // ── Před odletem ──
  const c1 = card({
    id: 'card-dhi-pred-1',
    phaseId: pPred.id,
    dayFrom: -30,
    dayTo: -8,
    name: 'Příprava — víc než týden před odletem',
    order: 0,
    components: [
      comp({
        id: 'comp-pred-1',
        type: 'instrukce',
        name: 'Přestat kouřit',
        shortDescription: 'Alespoň 30 dní před zákrokem.',
        icon: 'x-circle',
        hasDetail: true,
        detailRichtext:
          '# Přestat kouřit\n\nKouření zhoršuje prokrvení a snižuje úspěšnost přijetí štěpů. Doporučujeme úplné přerušení **minimálně 30 dní před zákrokem** a alespoň 14 dní po něm.',
        requiresCompletion: true,
        timeOfDay: 'cely_den',
        pointsForCompletion: 20,
        order: 0,
      }),
      comp({
        id: 'comp-pred-2',
        type: 'info',
        name: 'Objednání krevních testů',
        shortDescription: 'Kompletní krevní obraz + HIV/HCV/HBV.',
        icon: 'flask-conical',
        hasDetail: false,
        order: 1,
      }),
    ],
  });

  const c2 = card({
    id: 'card-dhi-pred-2',
    phaseId: pPred.id,
    dayFrom: -7,
    dayTo: -2,
    name: 'Týden před odletem',
    order: 1,
    components: [
      comp({
        id: 'comp-pred-3',
        type: 'instrukce',
        name: 'Balíček na cestu',
        shortDescription: 'Pas, pohodlné oblečení, nabíječka, knoflíky košile.',
        icon: 'briefcase',
        hasDetail: true,
        detailRichtext:
          '## Co si sbalit\n\n- Cestovní pas (platnost min. 6 měsíců)\n- Kopii letenky\n- Pohodlné oblečení — **nepřetahovat přes hlavu**\n- Knoflíkové košile (3–4 ks)\n- Nabíječka\n- Osobní léky',
        requiresCompletion: true,
        timeOfDay: 'cely_den',
        pointsForCompletion: 10,
        order: 0,
      }),
      comp({
        id: 'comp-pred-4',
        type: 'nebezpeci',
        name: 'Týden před zákrokem zakázáno',
        icon: 'x-circle',
        hasDetail: false,
        order: 1,
        dangerItems: [
          { id: crypto.randomUUID(), text: 'Alkohol', order: 0 },
          { id: crypto.randomUUID(), text: 'Aspirin a ředidla krve', order: 1 },
          { id: crypto.randomUUID(), text: 'Vitamín E ve vysokých dávkách', order: 2 },
          { id: crypto.randomUUID(), text: 'Tvrdá fyzická aktivita', order: 3 },
        ],
      }),
    ],
  });

  const c3 = card({
    id: 'card-dhi-pred-3',
    phaseId: pPred.id,
    dayFrom: -1,
    dayTo: -1,
    name: 'Den odletu',
    order: 2,
    components: [
      comp({
        id: 'comp-pred-5',
        type: 'instrukce',
        name: 'Foto před zákrokem',
        shortDescription: 'Pořiď si 3 fotky hlavy pro dokumentaci.',
        icon: 'camera',
        hasDetail: false,
        requiresCompletion: true,
        requiresPhoto: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 30,
        order: 0,
        notification: { enabled: true, time: '09:00', actionType: 'detail' },
      }),
      comp({
        id: 'comp-pred-6',
        type: 'info',
        name: 'Klidná snídaně — nevynech tekutiny',
        icon: 'utensils',
        hasDetail: false,
        order: 1,
      }),
    ],
  });

  pPred.dayCards.push(c1, c2, c3);

  // ── Pobyt v Istanbulu ──
  const c4 = card({
    id: 'card-dhi-pobyt-1',
    phaseId: pPobyt.id,
    dayFrom: -1,
    dayTo: -1,
    name: 'Den příjezdu',
    order: 0,
    components: [
      comp({
        id: 'comp-pobyt-1',
        type: 'info',
        name: 'Vítejte v Istanbulu',
        shortDescription: 'Transfer z letiště do hotelu zajištěn.',
        icon: 'map-pin',
        hasDetail: false,
        order: 0,
      }),
      comp({
        id: 'comp-pobyt-2',
        type: 'instrukce',
        name: 'Lehká večeře, hodně spát',
        icon: 'moon',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'vecer',
        pointsForCompletion: 10,
        order: 1,
      }),
    ],
  });

  const c5 = card({
    id: 'card-dhi-pobyt-2',
    phaseId: pPobyt.id,
    dayFrom: 0,
    dayTo: 0,
    name: 'Den zákroku',
    order: 1,
    components: [
      comp({
        id: 'comp-pobyt-3',
        type: 'instrukce',
        name: 'Vydatná snídaně — bílkoviny',
        icon: 'utensils',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'rano',
        pointsForCompletion: 10,
        order: 0,
        notification: { enabled: true, time: '07:00', actionType: 'dashboard' },
      }),
      comp({
        id: 'comp-pobyt-4',
        type: 'instrukce',
        name: 'Transfer do kliniky',
        shortDescription: 'Řidič tě vyzvedne v lobby.',
        icon: 'map-pin',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'rano',
        pointsForCompletion: 5,
        order: 1,
        notification: { enabled: true, time: '08:00', actionType: 'dashboard' },
      }),
      comp({
        id: 'comp-pobyt-5',
        type: 'instrukce',
        name: 'Konzultace a kresba linie',
        icon: 'activity',
        hasDetail: true,
        detailRichtext:
          '## Kresba linie\n\nLékař s tebou projde přesnou kresbu přední linie a hustoty. Dej se na to rezervu 20–30 minut — **nic nepodepisuj, dokud nejsi spokojen/á**.',
        requiresCompletion: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 10,
        order: 2,
      }),
      comp({
        id: 'comp-pobyt-6',
        type: 'nebezpeci',
        name: 'Dnes zakázáno',
        icon: 'x-circle',
        hasDetail: false,
        order: 3,
        dangerItems: [
          { id: crypto.randomUUID(), text: 'Alkohol', order: 0 },
          { id: crypto.randomUUID(), text: 'Kouření', order: 1 },
          { id: crypto.randomUUID(), text: 'Kofein v nadměrném množství', order: 2 },
        ],
      }),
    ],
  });

  const c6 = card({
    id: 'card-dhi-pobyt-3',
    phaseId: pPobyt.id,
    dayFrom: 1,
    dayTo: 3,
    name: 'Po zákroku v Istanbulu',
    order: 2,
    components: [
      comp({
        id: 'comp-pobyt-7',
        type: 'info',
        name: 'To je normální!',
        shortDescription: 'Otok čela, stroupky a lehké svědění.',
        icon: 'info',
        hasDetail: true,
        detailRichtext:
          'V den 1–3 je běžný **otok čela a obličeje**, lehké svědění a vznik stroupků. Spi polosedě 45°, nepřikrývej si hlavu přímo polštářem.',
        order: 0,
      }),
      comp({
        id: 'comp-pobyt-8',
        type: 'instrukce',
        name: 'Ranní léky',
        icon: 'pill',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'rano',
        pointsForCompletion: 10,
        order: 1,
        notification: { enabled: true, time: '08:00', text: 'Čas na ranní léky 💊', actionType: 'detail' },
      }),
      comp({
        id: 'comp-pobyt-9',
        type: 'instrukce',
        name: 'Spánek polosedě 45°',
        icon: 'moon',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'noc',
        pointsForCompletion: 10,
        order: 2,
      }),
      comp({
        id: 'comp-pobyt-10',
        type: 'instrukce',
        name: 'Foto: den po zákroku',
        icon: 'camera',
        hasDetail: false,
        requiresCompletion: true,
        requiresPhoto: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 30,
        order: 3,
      }),
    ],
  });

  pPobyt.dayCards.push(c4, c5, c6);

  // ── Po návratu ──
  const c7 = card({
    id: 'card-dhi-po-1',
    phaseId: pPo.id,
    dayFrom: 1,
    dayTo: 7,
    name: 'Kritický týden doma',
    order: 0,
    components: [
      comp({
        id: 'comp-po-1',
        type: 'instrukce',
        name: 'Denní mytí hlavy',
        shortDescription: 'Jemně, bez tření, podle videa.',
        icon: 'droplets',
        hasDetail: true,
        detailRichtext:
          '## Postup mytí\n\n1. Naředěný šampon aplikuj rukou, nepouštěj sprchu přímo\n2. Pěn jemně bříšky prstů\n3. Opláchni vlažnou vodou z hrnečku\n4. Nech uschnout na vzduchu',
        requiresCompletion: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 10,
        order: 0,
        videoId: 'video-myti',
        notification: { enabled: true, time: '09:30', text: 'Čas na mytí hlavy 🚿', actionType: 'detail' },
      }),
      comp({
        id: 'comp-po-2',
        type: 'instrukce',
        name: 'Večerní léky',
        icon: 'pill',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'vecer',
        pointsForCompletion: 10,
        order: 1,
        notification: { enabled: true, time: '20:00', actionType: 'detail' },
      }),
      comp({
        id: 'comp-po-3',
        type: 'varovani',
        name: 'Žádný sport ani zvedání těžkých věcí',
        icon: 'alert-triangle',
        hasDetail: false,
        order: 2,
      }),
    ],
  });

  const c8 = card({
    id: 'card-dhi-po-2',
    phaseId: pPo.id,
    dayFrom: 7,
    dayTo: 7,
    name: 'Týden po návratu — foto',
    order: 1,
    components: [
      comp({
        id: 'comp-po-4',
        type: 'instrukce',
        name: 'Foto pokroku — týden doma',
        icon: 'camera',
        hasDetail: false,
        requiresCompletion: true,
        requiresPhoto: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 50,
        order: 0,
        notification: { enabled: true, time: '10:00', text: 'Nezapomeň dnes nafotit pokrok! 📸', actionType: 'detail' },
      }),
      comp({
        id: 'comp-po-5',
        type: 'uspech',
        name: 'Prvních 7 dní doma je za tebou!',
        icon: 'check-circle',
        hasDetail: false,
        order: 1,
      }),
    ],
  });

  const c9 = card({
    id: 'card-dhi-po-3',
    phaseId: pPo.id,
    dayFrom: 8,
    dayTo: 30,
    name: 'Druhý a třetí týden',
    order: 2,
    components: [
      comp({
        id: 'comp-po-6',
        type: 'instrukce',
        name: 'Jemný šampon a pokračovat v péči',
        icon: 'droplets',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 10,
        order: 0,
      }),
      comp({
        id: 'comp-po-7',
        type: 'info',
        name: 'Shock loss je normální',
        shortDescription: 'Mezi 10.–14. dnem může dojít k dočasnému vypadávání.',
        icon: 'info',
        hasDetail: true,
        detailRichtext:
          'Tzv. **shock loss** je dočasné vypadávání původních štěpů. Nebojte se — folliculy zůstávají a vlasy začnou růst zpět do 3 měsíců.',
        order: 1,
      }),
    ],
  });

  const c10 = card({
    id: 'card-dhi-po-4',
    phaseId: pPo.id,
    dayFrom: 30,
    dayTo: 30,
    name: 'Měsíc 1 — foto',
    order: 3,
    components: [
      comp({
        id: 'comp-po-8',
        type: 'instrukce',
        name: 'Foto pokroku — měsíc 1',
        icon: 'camera',
        hasDetail: false,
        requiresCompletion: true,
        requiresPhoto: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 100,
        order: 0,
        notification: { enabled: true, time: '10:00', actionType: 'detail' },
      }),
    ],
  });

  const c11 = card({
    id: 'card-dhi-po-5',
    phaseId: pPo.id,
    dayFrom: 90,
    dayTo: 90,
    name: 'Měsíc 3 — kontrola',
    order: 4,
    components: [
      comp({
        id: 'comp-po-9',
        type: 'instrukce',
        name: 'Foto pokroku — měsíc 3',
        icon: 'camera',
        hasDetail: false,
        requiresCompletion: true,
        requiresPhoto: true,
        timeOfDay: 'dopoledne',
        pointsForCompletion: 150,
        order: 0,
      }),
      comp({
        id: 'comp-po-10',
        type: 'instrukce',
        name: 'Online kontrola s lékařem',
        icon: 'activity',
        hasDetail: false,
        requiresCompletion: true,
        timeOfDay: 'odpoledne',
        pointsForCompletion: 50,
        order: 1,
      }),
    ],
  });

  pPo.dayCards.push(c7, c8, c9, c10, c11);

  return {
    id: templateId,
    name: 'Standardní DHI plán',
    surgeryType: 'DHI',
    description: 'Výchozí plán pro DHI zákrok — 3 fáze, 11 karet dní, 26 komponent.',
    isDefault: true,
    phases: [pPred, pPobyt, pPo],
  };
}

function buildFueTemplate(): PlanTemplate {
  const templateId = 'plan-fue';
  const pPred = phase({
    id: 'phase-fue-pred',
    templateId,
    name: 'Před odletem',
    slug: 'pred-odletem',
    order: 0,
    relativeTo: 'odlet',
    heroColor: 'dark',
    icon: 'plane',
  });
  const pPobyt = phase({
    id: 'phase-fue-pobyt',
    templateId,
    name: 'Pobyt v Istanbulu',
    slug: 'pobyt',
    order: 1,
    relativeTo: 'zakrok',
    heroColor: 'teal',
    icon: 'zap',
  });
  const pPo = phase({
    id: 'phase-fue-po',
    templateId,
    name: 'Po návratu',
    slug: 'po-navratu',
    order: 2,
    relativeTo: 'navrat',
    heroColor: 'purple',
    icon: 'home',
  });

  pPred.dayCards.push(
    card({
      id: 'card-fue-pred-1',
      phaseId: pPred.id,
      dayFrom: -14,
      dayTo: -1,
      name: 'Příprava',
      order: 0,
      components: [
        comp({
          id: 'comp-fue-pred-1',
          type: 'instrukce',
          name: 'Přestat kouřit a omezit alkohol',
          icon: 'x-circle',
          hasDetail: false,
          requiresCompletion: true,
          timeOfDay: 'cely_den',
          pointsForCompletion: 20,
          order: 0,
        }),
      ],
    }),
  );

  pPobyt.dayCards.push(
    card({
      id: 'card-fue-pobyt-1',
      phaseId: pPobyt.id,
      dayFrom: 0,
      dayTo: 3,
      name: 'Zákrok a pobyt',
      order: 0,
      components: [
        comp({
          id: 'comp-fue-pobyt-1',
          type: 'instrukce',
          name: 'Ranní léky',
          icon: 'pill',
          hasDetail: false,
          requiresCompletion: true,
          timeOfDay: 'rano',
          pointsForCompletion: 10,
          order: 0,
        }),
      ],
    }),
  );

  pPo.dayCards.push(
    card({
      id: 'card-fue-po-1',
      phaseId: pPo.id,
      dayFrom: 1,
      dayTo: 14,
      name: 'Doma',
      order: 0,
      components: [
        comp({
          id: 'comp-fue-po-1',
          type: 'instrukce',
          name: 'Denní mytí hlavy',
          icon: 'droplets',
          hasDetail: false,
          requiresCompletion: true,
          timeOfDay: 'dopoledne',
          pointsForCompletion: 10,
          order: 0,
        }),
      ],
    }),
  );

  return {
    id: templateId,
    name: 'Standardní FUE plán',
    surgeryType: 'FUE',
    description: 'Plán pro FUE zákrok.',
    isDefault: false,
    phases: [pPred, pPobyt, pPo],
  };
}

export function buildSeedPlans(): PlanTemplate[] {
  return [buildDhiTemplate(), buildFueTemplate()];
}
