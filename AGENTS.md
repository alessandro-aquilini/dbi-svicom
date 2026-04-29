# Product Requirements Document for Svicom Living Hub

## 1. Executive Summary

Svicom Living Hub is a proprietary management and relationship platform for the residential and condominium sector. It is a **market infrastructure** that positions Svicom as the central node between demand (residents), management (administrators), supply (suppliers), and orchestration (Svicom itself).

## 2. Technological Stack & Architectural Principles
- **Core Framework**: SvelteKit with **Svelte 5**. Use **Runes** (`$state`, `$derived`, `$props`, etc.) exclusively for reactivity. Avoid legacy Svelte 4 syntax.
- **Styling & UI**: 
  - **TailwindCSS**: Use utility classes for layout and custom styling.
  - **shadcn-svelte (Bits UI)**: Use only these components for UI primitives. If a component is missing, check [shadcn-svelte.com](https://www.shadcn-svelte.com/docs/components) and ask me to run the specific `npx shadcn-svelte@latest add <component>` command. Never manual-install UI components.
- **Code Quality & Pattern**:
  - **Maintainability**: Write DRY (Don't Repeat Yourself) code. Abstract repetitive UI logic into reusable components in `src/lib/components`.
  - **Type Safety**: Use TypeScript strictly. Define interfaces/types for all data models in `src/lib/types` or relevant data files.
  - **State Management**: Prefer Svelte 5 classes with runes for complex state or shared logic instead of deep nesting or legacy stores where appropriate.
- **Mockup Fidelity**: Prioritize a "production-ready" feel. This means handling empty states, loading skeletons, responsive design, and accessible ARIA attributes. Frontend quality is the primary metric.

## 3. Data Layer (Read-Only Fake Backend)
The backend is a deterministic, read-only domain simulation. It is structured around domain entities, not UI pages or user roles. Each module represents a single source of truth for a business concept, and all relationships are expressed through stable identifiers.

```
src/lib/data/
├── index.ts
├── users.ts
├── properties.ts
├── residents.ts
├── suppliers.ts
├── tickets.ts
├── events.ts
├── payments.ts
├── quotes.ts
├── chats.ts
├── announcements.ts
├── documents.ts
└── services.ts
```

All entities are static, read-only datasets connected via IDs. No module owns state outside its domain. Cross-entity relationships must always be expressed via stable IDs (never nested duplication of full objects. 
The data layer is domain-first. It must never be structured around UI views, pages, or user roles. Any role-based behavior is derived through filtering and composition, not duplication.

| File              | Purpose                              | Contains                                                                 | Notes                                                                 |
|-------------------|--------------------------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------|
| `users.ts`        | All platform actors                  | Base user type (`id`, `role`, `name`) + minimal shared fields            | Single source for identity across roles                              |
| `properties.ts`   | Core domain entity                   | Property data + relationships (`adminId`, `residentIds`, `supplierIds`)  | Central hub of the system                                            |
| `residents.ts`    | Resident-specific details            | Apartment info, `propertyId`, optional preferences                        | Keeps `users.ts` lightweight                                         |
| `suppliers.ts`    | Supplier profiles                    | Services offered, tags, availability, mock rating/status                 | Used across tickets, quotes, events                                  |
| `tickets.ts`      | Unified request/intervention system  | Reports, admin tickets, supplier jobs (`status`, `type`, `assignedTo`)   | Replaces “pratiche”, connects all roles                              |
| `events.ts`       | Calendar layer                       | Meetings, interventions, appointments + `participants[]`                 | Can reference tickets or other entities                              |
| `payments.ts`     | Money flow                           | Payment requests, transactions (`from`, `to`, `amount`, `status`)        | Can link to tickets/properties                                       |
| `quotes.ts`       | Supplier estimates                   | Quotes linked to tickets, status (pending/approved/rejected)             | Important for supplier → admin flow                                  |
| `chats.ts`        | Conversation layer (UI driver)       | Messages (`text` / `action`) + `referenceId` to real entities            | NOT a source of truth — only references other data                   |
| `announcements.ts`| Admin → many communication           | Bulletin posts (`title`, `content`, `propertyId`, `createdBy`)           | Replaces need for group chats                                        |
| `documents.ts`    | Shared files                         | Documents linked to properties                                           | Used by both admin and residents                                     |
| `assemblies.ts`   | Governance domain entity | Condominium assemblies with agenda, attendance, voting, and official minutes (verbale + delibere) | Represents formal decision-making events;               |
| `services.ts`     | Resident-facing services (optional)  | Service catalog linked to suppliers                                      | Nice-to-have to enrich the product                                   |

UI-specific logic (filtering, sorting, pagination, view composition) must never live in the data layer. It belongs exclusively to route-level or page-level code.

Chat is a presentation layer of interactions, not a source of truth. All actions triggered from chat must reference entities stored in dedicated domain modules.

## 4. Routing

The codebase has a well-structured routing layout. If the current structure differs from the one below, align it and guide the user toward its correct implementation.

```
src/routes/
├── (app)/
│   ├── admin/
│   │   ├── +layout.svelte        # DESKTOP layout (wide sidebar)
│   │   ├── +page.svelte          # Dashboard (overview)
│   │   ├── properties/           # ex "condomini"
│   │   │   ├── +page.svelte      # Properties list
│   │   │   └── [id]/
│   │   │       ├── +page.svelte  # Property overview
│   │   │       ├── documents/
│   │   │       ├── residents/
│   │   │       └── bulletin/     # ex "bacheca"
│   │   ├── tickets/              # ex "pratiche"
│   │   ├── calendar/             # ex "calendario"
│   │   ├── suppliers/            # ex "fornitori"
│   │   ├── chat/                 # operational hub
│   │   ├── payments/             # ex "pagamenti"
│   │   └── settings/             # ex "impostazioni"
│
│   ├── resident/                 # ex "residente"
│   │   ├── +layout.svelte        # MOBILE layout (bottom navigation)
│   │   ├── +page.svelte          # Home (feed/chat-first)
│   │   ├── chat/                 # CORE UX
│   │   ├── bulletin/             # admin announcements
│   │   ├── reports/              # ex "segnalazioni"
│   │   ├── assemblies/           # 
│   │   ├── payments/
│   │   ├── documents/
│   │   └── profile/              # ex "profilo"
│
│   ├── supplier/                 # ex "fornitore"
│   │   ├── +layout.svelte        # simple layout
│   │   ├── +page.svelte          # (optional dashboard)
│   │   ├── jobs/                 # ex "interventi"
│   │   ├── chat/
│   │   ├── payments/
│   │   └── profile/              # Supplier profile
│
│   ├── (shared)/
│   │   └── settings/
│
├── (public)/                     # ex "(pubblico)"
│   └── login/
 ```
Routing defines navigation structure only. It must not encode business logic or data ownership. All routes must map to domain entities or user-facing screens, not internal states.

## 5. Style and color palette
Professional, clean, and minimal look. Font: **Geist Variable**. Primary color: **#5D7D94** (blue-gray). Neutral grayscale palette (oklch). Components with soft border-radius (`0.625rem` base). Light theme only. Use exclusively the CSS tokens defined in `layout.css` (e.g. `--primary`, `--muted`, `--border`), never hardcoded colors.

Minimize the use of inline Tailwind classes in pages. Style customizations must go through `layout.css` (for global styles) or through individual shadcn components. If a component needs to be adapted for specific requirements, propose creating a new component variant to the user rather than applying inline classes.
