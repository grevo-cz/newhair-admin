# API kontrakt — endpointy

> Zdroj pravdy pro backend tým. Všechny endpointy jsou volány ze `src/services/*`.
> Formát: API Platform 4.1 (JSON-LD), autentizace: JWT Bearer.
> Kolekce vracejí Hydra obálku `{ "hydra:member": [...], "hydra:totalItems": N }`.

## Authentication

| Metoda | Cesta | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/api/login` | `{ username, password }` | `{ token, refresh_token }` | — |
| POST | `/api/token/refresh` | `{ refresh_token }` | `{ token, refresh_token }` | — |
| GET | `/api/me` | — | `Staff` | ✅ |

Už existuje: `lexik/jwt-authentication-bundle` + `gesdinet/jwt-refresh-token-bundle`.
**Nový požadavek:** endpoint `/api/me`.

## Patients

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| GET | `/api/patients` | — | `HydraCollection<Patient>` |
| GET | `/api/patients/{id}` | — | `Patient` |
| POST | `/api/patients` | `CreatePatientInput` | `Patient` |
| PATCH | `/api/patients/{id}` | `Partial<Patient>` (merge-patch+json) | `Patient` |
| POST | `/api/patients/{id}/archive` | — | `Patient` |
| DELETE | `/api/patients/{id}` | — | `204` |
| GET | `/api/patients/{id}/photos` | — | `HydraCollection<Photo>` |
| GET | `/api/patients/{id}/documents` | — | `HydraCollection<DocumentFile>` |
| POST | `/api/patients/{id}/documents` | multipart `{ file, type, visibleToPatient }` | `DocumentFile` |

Filtry v seznamu: `status`, `doctorId`, `phaseSlug` (computed), search přes `firstName`/`lastName`/`email`.
Řazení: `surgeryDate`, `createdAt`.

## Plan Templates

Doporučeno: tree endpoint (`PUT` s celým stromem) — viz `plansService.ts` pro detail.

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| GET | `/api/plan-templates` | — | `HydraCollection<PlanTemplate>` |
| GET | `/api/plan-templates/{id}` | — | `PlanTemplate` (s phases + dayCards + components + library) |
| POST | `/api/plan-templates` | `PlanTemplate` | `PlanTemplate` |
| PUT | `/api/plan-templates/{id}` | `PlanTemplate` | `PlanTemplate` |
| DELETE | `/api/plan-templates/{id}` | — | `204` |

## Videos

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| GET | `/api/videos` | — | `HydraCollection<Video>` |
| POST | `/api/videos` | `Omit<Video,'id'|'order'>` | `Video` |
| PATCH | `/api/videos/{id}` | `Partial<Video>` | `Video` |
| DELETE | `/api/videos/{id}` | — | `204` |
| POST | `/api/videos/reorder` | `{ order: string[] }` | `204` |

## Photos

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| PATCH | `/api/photos/{id}` | `{ marketingConsent: 'yes'\|'no'\|'pending' }` | `Photo` |
| DELETE | `/api/photos/{id}` | — | `204` |
| POST | `/api/photos/export` | `{ patientIds[], consentOnly: bool }` | `{ url }` (ZIP) |

Upload iniciovaný pacientem přes PWA — admin fotky pouze čte a edituje consent.

## Documents

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| PATCH | `/api/documents/{id}` | `Partial<DocumentFile>` | `DocumentFile` |
| DELETE | `/api/documents/{id}` | — | `204` |
| GET | `/api/documents/{id}/download` | — | `302` redirect na signed URL |

## Messages (WhatsApp)

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| GET | `/api/messages/threads` | — | `HydraCollection<Thread>` |
| GET | `/api/messages/threads/{patientId}` | — | `Thread` |
| POST | `/api/messages/threads/{patientId}` | `{ text }` | `Message` |
| POST | `/api/messages/threads/{patientId}/mark-read` | — | `204` |
| POST | `/api/messages/threads/{patientId}/archive` | — | `204` |
| POST | `/api/messages/webhook` | (Meta WA payload) | `200` |

Realtime: Mercure topic `messages/{patientId}`.

## Settings

| Metoda | Cesta | Body | Response |
|---|---|---|---|
| GET | `/api/settings` | — | `AppSettings` (singleton resource) |
| PATCH | `/api/settings` | `Partial<AppSettings>` | `AppSettings` |
| POST | `/api/settings/whatsapp/test` | — | `{ ok, messageId? }` |

## Error response (API Platform default)

```
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc2616#section-10",
  "title": "An error occurred",
  "detail": "email: This value is already used.",
  "status": 400,
  "violations": [
    { "propertyPath": "email", "message": "This value is already used." }
  ]
}
```

Axios interceptor v `src/services/api.ts` předává chybu do Pinia akce nezměněnou;
kopírování `violations` do UI formulářových errors je TODO až po napojení.
