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
