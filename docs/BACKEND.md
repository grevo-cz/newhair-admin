# Backend blueprint — entity pro Symfony + API Platform 4.1

> **Scope:** návrh Doctrine entit a API Platform resources, které adminu stačí.
> Nepředepisuje migrace ani DB sloupce detailně — backend tým si to vyskládá
> sám podle vlastních konvencí. TypeScript je v `src/types/` (single source of truth).

## Mapování TS → PHP

TS enum → PHP enum, TS string → `Types::STRING`, TS `number` → `Types::INTEGER` nebo
`Types::FLOAT` podle sloupce, ISO datum → `Types::DATE_IMMUTABLE`, boolean → `Types::BOOLEAN`.

Id jsou `string` (UUID v7 doporučeno; frontend generuje UUID pro nové záznamy,
backend je akceptuje nebo přepisuje — buď jde cesta).

---

## User (↔ Staff v adminu)

Existující entita `api/src/Entity/User.php` — rozšířit o tato pole:

```php
#[ApiResource(operations: [ new Get(uriTemplate: '/me'), new GetCollection() ])]
class User {
    #[Column] private string $firstName;
    #[Column] private string $lastName;
    #[Column] private string $email;                 // unique
    #[Column(nullable: true)] private ?string $phone;
    #[Column(enumType: StaffRole::class)]
    private StaffRole $role;                         // admin_cz|coordinator_cz|staff_tr|doctor_tr
    #[Column(nullable: true)] private ?string $avatarUrl;
}
```

Role v TS: viz `types/patient.ts` → `StaffRole`. Mapování role → Symfony `ROLE_*`
bude řešeno voters.

---

## Patient

```php
#[ApiResource(
    normalizationContext: ['groups' => ['patient:read']],
    denormalizationContext: ['groups' => ['patient:write']],
    operations: [
        new GetCollection(),
        new Get(),
        new Post(),
        new Patch(),
        new Delete(),
        new Post(uriTemplate: '/patients/{id}/archive', name: 'archive_patient'),
    ],
)]
class Patient {
    #[Column] private string $id;
    #[Column] private string $firstName;
    #[Column] private string $lastName;
    #[Column] private string $email;                 // unique
    #[Column] private string $phone;                 // unique (WhatsApp match)
    #[Column(nullable: true)] private ?string $birthDate;
    #[Column(nullable: true)] private ?string $nationality;
    #[Column] private string $language;              // cs|en|de|sk

    #[Column] private \DateTimeImmutable $departureDate;
    #[Column] private \DateTimeImmutable $surgeryDate;
    #[Column] private \DateTimeImmutable $returnDate;

    #[Column] private string $surgeryType;           // DHI|FUE|Combo
    #[Column] private int $graftCount;

    #[ManyToOne(targetEntity: User::class)] private User $doctor;
    #[ManyToOne(targetEntity: User::class)] private User $coordinator;
    #[ManyToOne(targetEntity: PlanTemplate::class)] private ?PlanTemplate $planTemplate = null;

    #[Column] private int $points = 0;
    #[Column] private string $status = 'active';     // active|archived
    #[Column(nullable: true)] private ?string $internalNote;

    #[Column] private bool $welcomeEmailSent = false;
    #[Column] private bool $pushEnabled = true;
    #[Column] private bool $whatsappBroadcast = true;

    #[Column] private \DateTimeImmutable $createdAt;
    #[Column] private \DateTimeImmutable $updatedAt;
}
```

Validátory: `#[Assert\Email]`, telefon regex `/^\+?[0-9\s]{9,}$/`,
date constraint `departureDate <= surgeryDate <= returnDate`, `graftCount` 100–6000.

---

## PlanTemplate + Phase + DayCard + Component + LibraryComponent

Přirozená hierarchie — jedna agregátní kolekce. Persistenčně ideálně vlastní tabulky
s cascade na PlanTemplate (cascade=persist, remove). API Platform normalizer by měl
vracet celý strom v jednom response.

```php
class PlanTemplate {
    private string $id;
    private string $name;
    private string $surgeryType;                     // DHI|FUE|Combo|any
    private ?string $description;
    private bool $isDefault = false;

    /** @var Collection<PlanPhase> */
    private Collection $phases;

    /** @var Collection<LibraryComponent> */
    private Collection $library;
}

class PlanPhase {
    private string $id;
    private string $name;
    private string $slug;
    private int $order;
    private string $relativeTo;                      // odlet|zakrok|navrat
    private string $heroColor;                       // dark|teal|green|purple
    private string $icon;
    private ?string $quote;
    private ?string $description;

    #[ManyToOne] private PlanTemplate $template;
    /** @var Collection<DayCard> */
    private Collection $dayCards;
}

class DayCard {
    private string $id;
    private int $dayFrom;
    private int $dayTo;
    private ?string $name;
    private int $order;

    #[ManyToOne] private PlanPhase $phase;
    /** @var Collection<ComponentItem> */
    private Collection $components;
}

class ComponentItem {
    private string $id;
    #[ManyToOne] private DayCard $dayCard;
    /** null = local, jinak FK na LibraryComponent */
    #[ManyToOne(nullable: true)] private ?LibraryComponent $library = null;

    private string $type;                            // info|instrukce|varovani|nebezpeci|uspech
    private string $name;
    private ?string $shortDescription;
    private bool $hasDetail;
    private ?string $detailRichtext;
    private string $icon;
    private bool $requiresCompletion;
    private bool $requiresPhoto;
    private ?string $timeOfDay;
    private int $pointsForCompletion;
    private int $order;

    /** embedded JSON: { enabled, time, text, actionType } */
    private ?array $notification = null;
    /** embedded JSON: [{ id, text, order }] */
    private ?array $dangerItems = null;
    private ?string $videoId = null;
    private ?string $externalLink = null;
}

class LibraryComponent {
    // Stejná pole jako ComponentItem KROMĚ dayCard, order.
    // Propagace: když backend změní LibraryComponent, měl by (ideálně v listeneru
    // nebo explicitní službě) propsat změnu do všech odkazujících ComponentItem.
    // Frontend totéž dělá při offline/mock režimu.
}
```

Alternativa: držet LibraryComponent jako **samostatnou** entitu a v ComponentItem jen
sdílená pole ne-dělat (instance odkazuje a čte z masteru). Frontend implementuje první
cestu (instance drží denormalizovanou kopii + `libraryId` pro propojení).

---

## Video

```php
class Video {
    private string $id;
    private string $name;
    private ?string $description;
    private string $url;                             // YT/Vimeo/CDN
    private ?string $thumbnailUrl;
    private int $durationSeconds;
    private string $category;                        // pred-odletem|pobyt|po-navratu|obecne
    #[Column(type: Types::JSON)] private array $phaseSlugs = [];
    #[Column(type: Types::JSON)] private array $tags = [];
    private int $order = 0;
    private bool $recommended = false;
    private bool $active = true;
}
```

---

## Photo

```php
class Photo {
    private string $id;
    #[ManyToOne] private Patient $patient;
    #[ManyToOne(nullable: true)] private ?ComponentItem $component;
    private string $challengeLabel;
    private string $url;                             // signed CDN URL
    private string $thumbnailUrl;
    private ?string $description;
    private string $marketingConsent = 'pending';    // yes|no|pending
    private bool $uploadedByPatient = true;
    private \DateTimeImmutable $createdAt;
}
```

Upload: klient iniciuje `POST /api/photos/signed-upload-url` → S3 PUT → `POST /api/photos`
metadata. Nebo jednokrokově přes API Platform Vich upload.

---

## DocumentFile

```php
class DocumentFile {
    private string $id;
    #[ManyToOne] private Patient $patient;
    private string $type;                            // smlouva|gdpr|lekarska|instrukce|kontakty|jine
    private string $name;
    private string $url;
    private int $sizeBytes;
    private bool $visibleToPatient = false;
    #[ManyToOne] private User $uploadedBy;
    private \DateTimeImmutable $createdAt;
}
```

---

## Message / Thread

Thread jako computed resource, nebo separátní entita:

```php
class Message {
    private string $id;
    #[ManyToOne] private Patient $patient;
    private string $sender;                          // patient|admin
    private string $channel = 'whatsapp';            // whatsapp|in-app
    private string $text;
    private \DateTimeImmutable $timestamp;
    private bool $read = false;
}

// Thread: virtual resource zpracovaný Providerem — skupina messages pro patient_id
// + agregát { lastMessage, unreadCount, archived }.
```

---

## AppSettings (singleton)

```php
class AppSettings {
    private int $id = 1;                             // constraint: jediný řádek
    private string $clinicName;
    private string $supportEmail;
    private string $defaultLanguage;
    #[Column(type: Types::JSON)] private array $whatsapp = [];     // { phoneNumberId, accessToken, webhookUrl, verifyToken, connected }
    #[Column(type: Types::JSON)] private array $pointsExchange = []; // { enabled, rules[] }
}
```

ApiResource jen jako `Get` a `Patch` na fixním `/api/settings` — custom state provider.

---

## Role & voters

4 role. Doporučená matice oprávnění v `src/views/SettingsView.vue` — záložka „Role & oprávnění".
Symfony voter per entita, např. `PatientVoter`:

- `VIEW` → všichni aktivní staff
- `EDIT` → `admin_cz`, `coordinator_cz`
- `DELETE` → `admin_cz`
- `MEDICAL_RECORD_EDIT` → `staff_tr`, `doctor_tr`

---

## Mercure topics

Backend publikuje na tyto topics při úspěšné mutaci:

| Událost | Topic | Payload |
|---|---|---|
| Nová WA zpráva | `messages/{patientId}` | Message |
| Nová fotka | `photos/{patientId}` | Photo |
| Nový pacient | `notifications/admin` | `{ type: 'patient.created', patient }` |
| Nová zpráva (admin badge) | `notifications/admin` | `{ type: 'message.created', patientId }` |

---

## Co už v backendu JE

- Symfony 8 + API Platform 4.1
- User + RefreshToken entity
- JWT auth + refresh bundle
- Mercure bundle (nakonfigurován)
- CORS bundle
- Doctrine + migrace

## Co vývojář backendu musí DODAT

- [ ] `/api/me` endpoint
- [ ] Patient entity + API resource + validace (3 datumy)
- [ ] PlanTemplate s phases/dayCards/components/library + cascade
- [ ] Video, Photo, DocumentFile, Message, AppSettings entity
- [ ] Upload endpoint pro dokumenty (multipart)
- [ ] WhatsApp webhook endpoint + Meta Cloud API klient
- [ ] Voters per role
- [ ] Seed fixtures (volitelně — dev klidně mockuje z UI)

Frontend admin je agnostic k pořadí — start s Patient entity, pak Plan, pak zbytek.
