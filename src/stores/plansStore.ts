import { defineStore } from 'pinia';
import type {
  PlanTemplate,
  PlanPhase,
  DayCard,
  ComponentItem,
  ComponentType,
  PhaseReference,
  HeroColor,
  DangerItem,
  LibraryComponent,
} from '@/types';

interface State {
  items: Record<string, PlanTemplate>;
  order: string[];
}

function autoCardName(dayFrom: number, dayTo: number): string {
  if (dayFrom === dayTo) return `Den ${dayFrom}`;
  return `Dny ${dayFrom} až ${dayTo}`;
}

export const usePlansStore = defineStore('plans', {
  state: (): State => ({ items: {}, order: [] }),

  getters: {
    list: (s): PlanTemplate[] => s.order.map((id) => s.items[id]).filter(Boolean),
    byId: (s) => (id: string | null | undefined): PlanTemplate | undefined =>
      id ? s.items[id] : undefined,
    defaultTemplate(): PlanTemplate | undefined {
      return this.list.find((t) => t.isDefault);
    },
  },

  actions: {
    hydrate(items: PlanTemplate[]) {
      this.items = {};
      this.order = [];
      for (const t of items) {
        if (!Array.isArray(t.library)) t.library = [];
        this.items[t.id] = t;
        this.order.push(t.id);
      }
    },

    componentCount(templateId: string): number {
      const t = this.items[templateId];
      if (!t) return 0;
      return t.phases.reduce(
        (sum, ph) => sum + ph.dayCards.reduce((s, c) => s + c.components.length, 0),
        0,
      );
    },

    notificationCount(templateId: string): number {
      const t = this.items[templateId];
      if (!t) return 0;
      let n = 0;
      for (const ph of t.phases)
        for (const c of ph.dayCards)
          for (const comp of c.components)
            if (comp.notification?.enabled) n++;
      return n;
    },

    createTemplate(input: Partial<PlanTemplate> & { name: string }): PlanTemplate {
      const t: PlanTemplate = {
        id: crypto.randomUUID(),
        name: input.name,
        surgeryType: input.surgeryType ?? 'any',
        description: input.description,
        isDefault: input.isDefault ?? false,
        phases: input.phases ?? [],
        library: input.library ?? [],
      };
      this.items[t.id] = t;
      this.order.unshift(t.id);
      return t;
    },

    // ── Component library (master components) ──
    library(templateId: string): LibraryComponent[] {
      return this.items[templateId]?.library ?? [];
    },

    libraryById(templateId: string, libraryId: string | null | undefined): LibraryComponent | undefined {
      if (!libraryId) return undefined;
      return this.items[templateId]?.library.find((l) => l.id === libraryId);
    },

    /** Count of instances referencing the given master across all phases/cards. */
    libraryUsageCount(templateId: string, libraryId: string): number {
      const t = this.items[templateId];
      if (!t) return 0;
      let n = 0;
      for (const ph of t.phases)
        for (const c of ph.dayCards)
          for (const comp of c.components)
            if (comp.libraryId === libraryId) n++;
      return n;
    },

    createLibraryComponent(
      templateId: string,
      input: Partial<LibraryComponent> & { name: string; type: ComponentType },
    ): LibraryComponent | undefined {
      const t = this.items[templateId];
      if (!t) return;
      const lib: LibraryComponent = {
        id: crypto.randomUUID(),
        templateId,
        type: input.type,
        name: input.name,
        shortDescription: input.shortDescription,
        hasDetail: input.hasDetail ?? false,
        detailRichtext: input.detailRichtext,
        icon: input.icon ?? defaultIconForType(input.type),
        requiresCompletion: input.requiresCompletion ?? false,
        requiresPhoto: input.requiresPhoto ?? false,
        timeOfDay: input.timeOfDay,
        pointsForCompletion: input.pointsForCompletion ?? 0,
        notification: input.notification,
        dangerItems: input.dangerItems,
        videoId: input.videoId,
        externalLink: input.externalLink,
      };
      t.library.push(lib);
      return lib;
    },

    updateLibraryComponent(templateId: string, libraryId: string, patch: Partial<LibraryComponent>) {
      const t = this.items[templateId];
      const lib = t?.library.find((l) => l.id === libraryId);
      if (!lib) return;
      Object.assign(lib, patch);
    },

    /** Delete a library component — all instances are detached (copied → local). */
    removeLibraryComponent(templateId: string, libraryId: string) {
      const t = this.items[templateId];
      if (!t) return;
      const lib = t.library.find((l) => l.id === libraryId);
      if (!lib) return;
      // Detach all instances first
      for (const ph of t.phases)
        for (const c of ph.dayCards)
          for (const comp of c.components)
            if (comp.libraryId === libraryId) this.applyLibraryToInstance(comp, lib, { detach: true });
      t.library = t.library.filter((l) => l.id !== libraryId);
    },

    /** Create a new instance in a given day card, linked to a library component. */
    instantiateFromLibrary(
      templateId: string,
      phaseId: string,
      cardId: string,
      libraryId: string,
    ): ComponentItem | undefined {
      const t = this.items[templateId];
      const lib = t?.library.find((l) => l.id === libraryId);
      const card = t?.phases.find((p) => p.id === phaseId)?.dayCards.find((c) => c.id === cardId);
      if (!t || !lib || !card) return;
      const instance: ComponentItem = {
        id: crypto.randomUUID(),
        dayCardId: cardId,
        libraryId: lib.id,
        type: lib.type,
        name: lib.name,
        shortDescription: lib.shortDescription,
        hasDetail: lib.hasDetail,
        detailRichtext: lib.detailRichtext,
        icon: lib.icon,
        requiresCompletion: lib.requiresCompletion,
        requiresPhoto: lib.requiresPhoto,
        timeOfDay: lib.timeOfDay,
        pointsForCompletion: lib.pointsForCompletion,
        order: card.components.length,
        notification: lib.notification ? { ...lib.notification } : undefined,
        dangerItems: lib.dangerItems ? lib.dangerItems.map((d) => ({ ...d })) : undefined,
        videoId: lib.videoId,
        externalLink: lib.externalLink,
      };
      card.components.push(instance);
      return instance;
    },

    /** Promote a local component into the library and link the current one to it. */
    saveComponentToLibrary(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
    ): LibraryComponent | undefined {
      const comp = findComponent(this.items, templateId, phaseId, cardId, componentId);
      if (!comp || comp.libraryId) return;
      const lib = this.createLibraryComponent(templateId, {
        type: comp.type,
        name: comp.name,
        shortDescription: comp.shortDescription,
        hasDetail: comp.hasDetail,
        detailRichtext: comp.detailRichtext,
        icon: comp.icon,
        requiresCompletion: comp.requiresCompletion,
        requiresPhoto: comp.requiresPhoto,
        timeOfDay: comp.timeOfDay,
        pointsForCompletion: comp.pointsForCompletion,
        notification: comp.notification ? { ...comp.notification } : undefined,
        dangerItems: comp.dangerItems ? comp.dangerItems.map((d) => ({ ...d })) : undefined,
        videoId: comp.videoId,
        externalLink: comp.externalLink,
      });
      if (lib) comp.libraryId = lib.id;
      return lib;
    },

    /** Detach an instance — its fields remain local, library link is removed. */
    detachFromLibrary(templateId: string, phaseId: string, cardId: string, componentId: string) {
      const comp = findComponent(this.items, templateId, phaseId, cardId, componentId);
      if (!comp) return;
      comp.libraryId = null;
    },

    /**
     * Propagate library values to a specific instance (used internally on delete).
     * If `detach = true`, clears the libraryId after copying.
     */
    applyLibraryToInstance(
      instance: ComponentItem,
      lib: LibraryComponent,
      opts: { detach?: boolean } = {},
    ) {
      instance.type = lib.type;
      instance.name = lib.name;
      instance.shortDescription = lib.shortDescription;
      instance.hasDetail = lib.hasDetail;
      instance.detailRichtext = lib.detailRichtext;
      instance.icon = lib.icon;
      instance.requiresCompletion = lib.requiresCompletion;
      instance.requiresPhoto = lib.requiresPhoto;
      instance.timeOfDay = lib.timeOfDay;
      instance.pointsForCompletion = lib.pointsForCompletion;
      instance.notification = lib.notification ? { ...lib.notification } : undefined;
      instance.dangerItems = lib.dangerItems ? lib.dangerItems.map((d) => ({ ...d })) : undefined;
      instance.videoId = lib.videoId;
      instance.externalLink = lib.externalLink;
      if (opts.detach) instance.libraryId = null;
    },

    /** Called after updating a master: pushes new values to every instance. */
    propagateLibraryUpdate(templateId: string, libraryId: string) {
      const t = this.items[templateId];
      const lib = t?.library.find((l) => l.id === libraryId);
      if (!t || !lib) return;
      for (const ph of t.phases)
        for (const c of ph.dayCards)
          for (const comp of c.components)
            if (comp.libraryId === libraryId) this.applyLibraryToInstance(comp, lib);
    },

    clone(id: string): PlanTemplate | undefined {
      const src = this.items[id];
      if (!src) return;
      const json = JSON.parse(JSON.stringify(src)) as PlanTemplate;
      json.id = crypto.randomUUID();
      json.name = `${src.name} (kopie)`;
      json.isDefault = false;
      if (!Array.isArray(json.library)) json.library = [];
      // Remap library ids so instances continue to reference the clone's library
      const libraryIdMap: Record<string, string> = {};
      for (const lib of json.library) {
        const newId = crypto.randomUUID();
        libraryIdMap[lib.id] = newId;
        lib.id = newId;
        lib.templateId = json.id;
      }
      // re-id nested
      for (const ph of json.phases) {
        ph.id = crypto.randomUUID();
        ph.templateId = json.id;
        for (const c of ph.dayCards) {
          c.phaseId = ph.id;
          c.id = crypto.randomUUID();
          for (const comp of c.components) {
            comp.dayCardId = c.id;
            comp.id = crypto.randomUUID();
            if (comp.libraryId && libraryIdMap[comp.libraryId]) {
              comp.libraryId = libraryIdMap[comp.libraryId];
            }
            if (comp.dangerItems) {
              comp.dangerItems = comp.dangerItems.map((d) => ({ ...d, id: crypto.randomUUID() }));
            }
          }
        }
      }
      this.items[json.id] = json;
      this.order.unshift(json.id);
      return json;
    },

    updateTemplate(id: string, patch: Partial<PlanTemplate>) {
      const t = this.items[id];
      if (!t) return;
      this.items[id] = { ...t, ...patch };
    },

    setDefault(id: string) {
      for (const tid of this.order) {
        this.items[tid].isDefault = tid === id;
      }
    },

    removeTemplate(id: string) {
      delete this.items[id];
      this.order = this.order.filter((x) => x !== id);
    },

    // ── Phases ──
    addPhase(
      templateId: string,
      input: Partial<PlanPhase> & { name: string; relativeTo: PhaseReference },
    ): PlanPhase | undefined {
      const t = this.items[templateId];
      if (!t) return;
      const ph: PlanPhase = {
        id: crypto.randomUUID(),
        templateId,
        name: input.name,
        slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, '-'),
        order: t.phases.length,
        relativeTo: input.relativeTo,
        heroColor: (input.heroColor ?? 'dark') as HeroColor,
        icon: input.icon ?? 'flag',
        quote: input.quote,
        description: input.description,
        dayCards: [],
      };
      t.phases.push(ph);
      return ph;
    },

    updatePhase(templateId: string, phaseId: string, patch: Partial<PlanPhase>) {
      const t = this.items[templateId];
      if (!t) return;
      const ph = t.phases.find((p) => p.id === phaseId);
      if (!ph) return;
      Object.assign(ph, patch);
    },

    removePhase(templateId: string, phaseId: string) {
      const t = this.items[templateId];
      if (!t) return;
      t.phases = t.phases.filter((p) => p.id !== phaseId);
      t.phases.forEach((p, i) => (p.order = i));
    },

    movePhase(templateId: string, phaseId: string, direction: 1 | -1) {
      const t = this.items[templateId];
      if (!t) return;
      const idx = t.phases.findIndex((p) => p.id === phaseId);
      if (idx < 0) return;
      const target = idx + direction;
      if (target < 0 || target >= t.phases.length) return;
      [t.phases[idx], t.phases[target]] = [t.phases[target], t.phases[idx]];
      t.phases.forEach((p, i) => (p.order = i));
    },

    // ── DayCards ──
    addDayCard(
      templateId: string,
      phaseId: string,
      input: { dayFrom: number; dayTo: number; name?: string },
    ): DayCard | undefined {
      const t = this.items[templateId];
      const ph = t?.phases.find((p) => p.id === phaseId);
      if (!ph) return;
      const card: DayCard = {
        id: crypto.randomUUID(),
        phaseId,
        dayFrom: input.dayFrom,
        dayTo: input.dayTo,
        name: input.name ?? autoCardName(input.dayFrom, input.dayTo),
        order: ph.dayCards.length,
        components: [],
      };
      ph.dayCards.push(card);
      return card;
    },

    updateDayCard(
      templateId: string,
      phaseId: string,
      cardId: string,
      patch: Partial<DayCard>,
    ) {
      const ph = this.items[templateId]?.phases.find((p) => p.id === phaseId);
      const c = ph?.dayCards.find((x) => x.id === cardId);
      if (!c) return;
      Object.assign(c, patch);
      if (!c.name) c.name = autoCardName(c.dayFrom, c.dayTo);
    },

    removeDayCard(templateId: string, phaseId: string, cardId: string) {
      const ph = this.items[templateId]?.phases.find((p) => p.id === phaseId);
      if (!ph) return;
      ph.dayCards = ph.dayCards.filter((c) => c.id !== cardId);
      ph.dayCards.forEach((c, i) => (c.order = i));
    },

    moveDayCard(
      templateId: string,
      phaseId: string,
      cardId: string,
      direction: 1 | -1,
    ) {
      const ph = this.items[templateId]?.phases.find((p) => p.id === phaseId);
      if (!ph) return;
      const idx = ph.dayCards.findIndex((c) => c.id === cardId);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= ph.dayCards.length) return;
      [ph.dayCards[idx], ph.dayCards[target]] = [ph.dayCards[target], ph.dayCards[idx]];
      ph.dayCards.forEach((c, i) => (c.order = i));
    },

    // ── Components ──
    addComponent(
      templateId: string,
      phaseId: string,
      cardId: string,
      input: Partial<ComponentItem> & { name: string; type: ComponentType },
    ): ComponentItem | undefined {
      const card = this.items[templateId]?.phases
        .find((p) => p.id === phaseId)
        ?.dayCards.find((c) => c.id === cardId);
      if (!card) return;
      const comp: ComponentItem = {
        id: crypto.randomUUID(),
        dayCardId: cardId,
        libraryId: input.libraryId ?? null,
        type: input.type,
        name: input.name,
        shortDescription: input.shortDescription,
        hasDetail: input.hasDetail ?? false,
        detailRichtext: input.detailRichtext,
        icon: input.icon ?? defaultIconForType(input.type),
        requiresCompletion: input.requiresCompletion ?? false,
        requiresPhoto: input.requiresPhoto ?? false,
        timeOfDay: input.timeOfDay,
        pointsForCompletion: input.pointsForCompletion ?? 0,
        order: card.components.length,
        notification: input.notification,
        dangerItems: input.dangerItems,
        videoId: input.videoId,
        externalLink: input.externalLink,
      };
      card.components.push(comp);
      return comp;
    },

    updateComponent(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
      patch: Partial<ComponentItem>,
    ) {
      const card = this.items[templateId]?.phases
        .find((p) => p.id === phaseId)
        ?.dayCards.find((c) => c.id === cardId);
      const comp = card?.components.find((x) => x.id === componentId);
      if (!comp) return;
      Object.assign(comp, patch);
    },

    removeComponent(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
    ) {
      const card = this.items[templateId]?.phases
        .find((p) => p.id === phaseId)
        ?.dayCards.find((c) => c.id === cardId);
      if (!card) return;
      card.components = card.components.filter((x) => x.id !== componentId);
      card.components.forEach((c, i) => (c.order = i));
    },

    moveComponent(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
      direction: 1 | -1,
    ) {
      const card = this.items[templateId]?.phases
        .find((p) => p.id === phaseId)
        ?.dayCards.find((c) => c.id === cardId);
      if (!card) return;
      const idx = card.components.findIndex((x) => x.id === componentId);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= card.components.length) return;
      [card.components[idx], card.components[target]] =
        [card.components[target], card.components[idx]];
      card.components.forEach((c, i) => (c.order = i));
    },

    addDangerItem(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
      text: string,
    ): DangerItem | undefined {
      const comp = findComponent(this.items, templateId, phaseId, cardId, componentId);
      if (!comp) return;
      if (!comp.dangerItems) comp.dangerItems = [];
      const item: DangerItem = {
        id: crypto.randomUUID(),
        text,
        order: comp.dangerItems.length,
      };
      comp.dangerItems.push(item);
      return item;
    },

    removeDangerItem(
      templateId: string,
      phaseId: string,
      cardId: string,
      componentId: string,
      itemId: string,
    ) {
      const comp = findComponent(this.items, templateId, phaseId, cardId, componentId);
      if (!comp?.dangerItems) return;
      comp.dangerItems = comp.dangerItems.filter((x) => x.id !== itemId);
      comp.dangerItems.forEach((x, i) => (x.order = i));
    },
  },
});

function defaultIconForType(t: ComponentType): string {
  const map: Record<ComponentType, string> = {
    info: 'info',
    instrukce: 'check',
    varovani: 'alert-triangle',
    nebezpeci: 'x-circle',
    uspech: 'check-circle',
  };
  return map[t];
}

function findComponent(
  items: Record<string, PlanTemplate>,
  templateId: string,
  phaseId: string,
  cardId: string,
  componentId: string,
): ComponentItem | undefined {
  return items[templateId]?.phases
    .find((p) => p.id === phaseId)
    ?.dayCards.find((c) => c.id === cardId)
    ?.components.find((x) => x.id === componentId);
}
