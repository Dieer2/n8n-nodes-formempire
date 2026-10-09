# n8n Creator Portal — beküldési anyag (verified community node)

Beküldés: https://creators.n8n.io → Sign in → **Community nodes** → Submit / Verify node.

| Mező | Érték |
|---|---|
| npm package name | `n8n-nodes-formempire` |
| Version | 0.1.0 |
| Repository | https://github.com/Dieer2/n8n-nodes-formempire |
| Homepage / docs | https://formempire.hu (API: https://formempire.hu/app/api) |
| License | MIT |
| Category | Forms / Marketing / Sales (űrlapok, ajánlatkérés, rendelés) |
| Author | FormEmpire — hello@formempire.hu |

**Short description (EN):**
FormEmpire is a Hungarian form builder for quotes and orders. This package adds a trigger that starts a workflow instantly when a form receives a submission, and a node to list forms, read submissions and update their status, tags and note.

**Nodes:**
- `FormEmpire Trigger` — instant trigger via FormEmpire's webhook subscription (REST hook); optional "abandoned fills" events.
- `FormEmpire` — Form: Get, Get Many · Submission: Get, Get Many (pagination, `since`), Update (status, tags, note).

**Credentials:** `FormEmpire API` — API key (Bearer), created in FormEmpire → API (Pro plan and up). Tested with `GET /me`.

**Verification checklist (n8n):**
- no runtime dependencies (only `n8n-workflow` peer) ✔
- MIT licence ✔ · `n8n-community-node-package` keyword ✔
- lint (`@n8n/node-cli`) 0 hiba ✔ · build ✔
- published to npm with 2FA; later releases via GitHub Actions + provenance (Trusted Publisher) ✔
- `usableAsTool: true` ✔
- icon: SVG (light/dark same) ✔

**Test account for reviewers:** a FormEmpire Pro-fiók API-kulcsa kell — külön tesztfiókot érdemes adni (ne a sajátot). Készíthető: formempire.hu regisztráció + Pro próba, majd API-kulcs.

## Állapot (2026-10-09)

- 0.1.0: kézi kiadás (2FA) → a portál elutasította: nincs provenance.
- 0.1.1: GitHub Actions + provenance → beküldve; automata ellenőrzés: 3 hiba (nyers hiba újradobása, trigger `usableAsTool`, üres catch) + ikon-figyelmeztetés.
- 0.1.2: javítva (NodeApiError/NodeOperationError, trigger tool nélkül, naplózott catch, világos/sötét ikon), `@n8n/node-cli` 0.51; `npx @n8n/scan-community-package@beta n8n-nodes-formempire` → minden ellenőrzés OK; **automata review: Complete**.
- **2026-10-09 15:12 – demóvideó beküldve → Manual Review: Under Review** (n8n: akár 4 hét). Videó: 3:35, 1080p, Drive: https://drive.google.com/file/d/17lDi98OCpYVbDqep5yfcEEXKf5AoZfeR/view (bárki a linkkel); forrás `~/n8n-demo/formempire-n8n-demo.mov`. A felvételt a `screencapture -v` készítette, a lépéseket a Chrome-bővítmény vezérelte; a workflow (`FeDemoWorkflow0001`) CLI-importtal készült.
- Korábban: **Manual Review: Awaiting Video** — ≤5 perces, vágatlan képernyővideó kell (feltöltés vagy link): 1) n8n példányban a 0.1.2 telepítése npm-ről (Settings → Community nodes), 2) új workflow + node beszúrása, 3) credential létrehozása és a teszt sikere, 4) a leggyakoribb műveletek (Trigger: beküldés érkezik; FormEmpire: Get Many submissions, Update), 5) AI-tool használat egy példával (a FormEmpire node `usableAsTool`).
  Helyi n8n a videóhoz: `npx n8n` (http://localhost:5678), a trigger élő teszteléséhez nyilvános URL kell (pl. a teszt.hydroref.io laborba nem jó; `npx n8n` + tunnel: `N8N_TUNNEL` / `--tunnel`).

## Demóvideó – forgatókönyv (≤5 perc, vágás nélkül, 1080p)

Előkészítés (nem kell a videón): `~/n8n-demo`-ban telepített n8n; indítás: `cd ~/n8n-demo && npx n8n --tunnel` → http://localhost:5678
(első indításkor tulajdonosi fiók létrehozása — ez is lehet a videó előtt). A tunnel-URL-t az n8n a terminálra írja; ez kell, hogy a FormEmpire el tudja érni a webhookot.
Kéznél: egy FormEmpire API-kulcs (API oldal → Megmutatás) és a nyilvános TESZT-űrlap linkje másik fülön.

1. **Telepítés npm-ről**: Settings → Community nodes → Install → `n8n-nodes-formempire` → verzió: **0.1.2** (ugyanaz, mint a beküldött) → elfogadás → Install. Mutasd a „Installed” listát.
2. **Új workflow** → `+` → keresés „FormEmpire” → **FormEmpire Trigger** beszúrása.
3. **Credential**: Create new → FormEmpire API → kulcs beillesztése → Save → a zöld „Connection tested successfully” látszódjon.
4. **Trigger**: Form = TESZT – Rendelés árkalkulátorral → „Listen for test event” → a másik fülön kitöltöd és beküldöd az űrlapot → az n8n-ben megjelenik a beérkezett adat (submission, answers, fields).
5. **FormEmpire node**: Submission → Get Many (Form kiválasztva, limit 3) → Execute step → eredmény; majd Submission → Update (Submission ID a trigger kimenetéből, Status: Done, Tags: `n8n-demo`) → Execute step → eredmény.
6. **AI-tool**: új AI Agent node (bármely modellel, vagy csak a tool-csatlakozás mutatása) → Tools → FormEmpire (Get Many Forms) hozzáadása → egy példa kérés („List my forms”) futtatása, vagy legalább a tool-csatlakozás látszódjon.
7. Mentés, kész.
