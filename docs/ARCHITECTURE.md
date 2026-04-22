# Architektura admin UI

> Projektová mapa — co kde žije, kdo co volá.

## Strom projektu

```
admin-new/
├── src/
│   ├── main.ts                        # Bootstrap: pinia, router, seedy, mount
│   ├── App.vue                        # <RouterView/> + ToastHost + ConfirmDialog
│   │
│   ├── types/                         # Single source of truth — TS typy domény
│   │   ├── patient.ts                 # Patient, Staff, StaffRole…
│   │   ├── plan.ts                    # PlanTemplate, PlanPhase, DayCard,
│   │   │                              # ComponentItem, LibraryComponent…
│   │   ├── video.ts, photo.ts, document.ts, message.ts, settings.ts, ui.ts
│   │   └── index.ts                   # barrel
│   │
│   ├── data/                          # Seed data — start hodnoty pro mock API
│   │   ├── seedPatients.ts, seedPlans.ts, …
│   │   ├── staff.ts                   # Hardcoded staff (v boot app i mock login)
│   │   └── seedIndex.ts               # loadSeeds() → hydratuje všechny stores
│   │
│   ├── services/                      # 🔌 JEDINÉ místo s HTTP/mock logikou
│   │   ├── api.ts                     # axios instance + JWT + refresh
│   │   ├── authService.ts             # login, fetchMe, logout
│   │   ├── patientsService.ts         # CRUD patients
│   │   ├── plansService.ts, videosService.ts, photosService.ts,
│   │   │   documentsService.ts, messagesService.ts, settingsService.ts
│   │   └── index.ts                   # barrel
│   │
│   ├── stores/                        # Pinia — in-memory cache + UI state
│   │   ├── authStore.ts               # user, isAuthenticated, login/logout
│   │   ├── patientsStore.ts           # items + getters + CRUD akce
│   │   ├── plansStore.ts              # PlanTemplate + nested CRUD + library
│   │   ├── videosStore.ts, photosStore.ts, documentsStore.ts,
│   │   │   messagesStore.ts, settingsStore.ts
│   │   └── uiStore.ts                 # toasts, confirm dialogy, sidebar collapsed
│   │
│   ├── composables/                   # Reusable business logic
│   │   ├── useDayMath.ts              # Výpočet dní od 3 referencí (odlet/zákrok/návrat)
│   │   ├── useTable.ts                # Filter + search + paginate + sort
│   │   ├── useConfirm.ts              # ui.confirm() wrapper
│   │   └── useIcon.ts                 # Lucide icon mapping + whitelist
│   │
│   ├── components/
│   │   ├── layout/                    # AppSidebar, AppTopbar, SidebarLink
│   │   ├── shared/                    # Button, Card, Pill, badges, Modal, Drawer,
│   │   │                              # DataTable, Input, Select, Textarea, Toggle,
│   │   │                              # RadioGroup, IconPicker, TagInput, Tabs, …
│   │   ├── dashboard/                 # StatCard
│   │   ├── plans/                     # ComponentEditor (modal content)
│   │   └── preview/                   # MockPwaDashboard, PatientPreviewDrawer
│   │
│   ├── layouts/AdminLayout.vue        # Sidebar + Topbar + RouterView
│   │
│   ├── router/index.ts                # Routy + auth guard
│   │
│   └── views/                         # Route komponenty
│       ├── DashboardView.vue
│       ├── LoginView.vue
│       ├── SettingsView.vue
│       ├── NotFoundView.vue
│       ├── patients/                  # PatientListView, PatientDetailView, PatientNewView
│       ├── plans/                     # PlanListView, PlanEditorView
│       ├── videos/                    # VideoListView, VideoFormView
│       └── messages/                  # InboxView
│
├── docs/
│   ├── INTEGRATION.md                 # 🎯 Hlavní handoff doc pro vývojáře
│   ├── API.md                         # Seznam endpointů s request/response
│   ├── BACKEND.md                     # Návrh Doctrine entit + API Platform
│   └── ARCHITECTURE.md                # Tento soubor
│
├── .env.example                       # VITE_API_URL + VITE_USE_MOCK_API
├── README.md                          # Rychlý start + odkazy do docs
└── package.json                       # Scripts: dev, build, preview, type-check, lint
```

## Tok dat

### Čtení (list pacientů)
```
PatientListView.vue
  → useTable({ rows: () => patientsStore.list })
  → patientsStore.list (getter)
  → patientsStore.items (hydratováno při bootstrapu)
```

### Zápis (přidat pacienta)
```
PatientNewView.vue submit()
  → patientsStore.create(input)    ← sync, okamžitě v UI
  → [SWAP POINT]                    ← tady zavolat patientsService.createPatient(input)
                                       a výsledek vložit do store
```

## Swap points

Místa, kde stores dnes jen mutují in-memory a kam backend volání patří:

| Store akce | Service ekvivalent |
|---|---|
| `patientsStore.create()` | `patientsService.createPatient()` |
| `patientsStore.update()` | `patientsService.updatePatient()` |
| `patientsStore.archive()` | `patientsService.archivePatient()` |
| `plansStore.createTemplate()` | `plansService.createPlan()` |
| `plansStore.clone()` | `plansService.createPlan()` (s upraveným payload) |
| `plansStore.*` (phase/card/component CRUD) | `plansService.savePlan()` (whole tree) |
| `videosStore.create()` | `videosService.createVideo()` |
| `videosStore.update()` / `toggleActive()` / `move()` | `videosService.updateVideo()` / `reorderVideos()` |
| `photosStore.setConsent()` | `photosService.setPhotoConsent()` |
| `documentsStore.uploadStub()` | `documentsService.uploadDocument()` |
| `messagesStore.sendFromAdmin()` | `messagesService.sendMessage()` |
| `settingsStore.updateWhatsApp()` | `settingsService.updateWhatsAppSettings()` |

Doporučený refactor po napojení: udělat store akce **async** a volat service uvnitř nich.
V komponentách pak `await store.createPatient(…)` — store se postará o síť + lokální update.

## Konvence

- **Id jsou UUID stringy.** Frontend je generuje přes `crypto.randomUUID()`; backend
  může přepisovat nebo akceptovat.
- **Datum = ISO yyyy-mm-dd** (string), datum+čas = ISO 8601.
- **API Platform JSON-LD** — kolekce v `hydra:member`, unwrap přes `unwrapHydra(data)`.
- **Error handling** — service vyhodí axios error (propaguje se do Pinia akce → try/catch
  v komponentě → `uiStore.toast({ type: 'error', text: … })`).
- **Strictně typed Vue komponenty** — `defineProps<…>()` všude, žádné any bez důvodu.
- **Tailwind v4 + custom tokens** (`@theme` v `src/assets/main.css`) — brand barvy
  jako `bg-brand-orange`, `text-brand-dark`, `bg-hero-purple`, atd.

## Testování

Zatím neprojekt nemá testy (mockup). Doporučený setup až se začne ostrý vývoj:

- **Unit:** Vitest na stores + composables (`useDayMath` zejména — kritické).
- **Component:** @vue/test-utils + Vitest na formuláře (Patient 3-step, ComponentEditor).
- **E2E:** Playwright — jeden happy path per sekce.

## Buildy a nasazení

- **Dev:** `npm run dev` → Vite dev server na `:3100`.
- **Prod:** `npm run build` → `dist/` static files, deploy na Vercel (už zapojeno).
- **Preview:** `npm run preview` — lokální prod preview.
- **Type-check:** `npm run type-check` (vue-tsc).
