# n8n-nodes-formempire

n8n community nodes for [FormEmpire](https://formempire.hu), the Hungarian form builder for quotes and orders.

- **FormEmpire Trigger** — starts a workflow when a form receives a submission (instant, via FormEmpire's webhook subscription). Optionally also on abandoned fills.
- **FormEmpire** — list forms, read a form's fields, list/get submissions (with pagination, `since` filter), update a submission's status, tags and note.

**Credentials:** a FormEmpire API key (Pro plan and up), created at formempire.hu → API.

## Install
In n8n: Settings → Community Nodes → Install → `n8n-nodes-formempire`.

## Develop
`npm install`, `npm run build`, `npm run lint`. Publishing goes through GitHub Actions with provenance (`npm run release`).
