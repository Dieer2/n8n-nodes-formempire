# n8n-nodes-formempire

n8n community nodes for [FormEmpire](https://formempire.hu), the form builder for quotes and orders.

- **FormEmpire Trigger** — starts a workflow the moment a form receives a submission (instant, via FormEmpire's webhook subscription). Optionally also fires on abandoned fills.
- **FormEmpire** — list your forms, read a form's fields, list or get submissions (pagination, `since` filter), and update a submission's status, tags and note. Can be used as a tool by AI Agent nodes.

## Install

In n8n: **Settings → Community Nodes → Install**, enter `n8n-nodes-formempire` and confirm. Both nodes then appear in the node picker under "FormEmpire".

## Authentication

The nodes use a FormEmpire API key (available on the Pro plan and up).

1. In FormEmpire open **Account → API** (https://formempire.hu/app/api) and click **New key**. Give it a name such as `n8n` and copy the key.
2. In n8n open either FormEmpire node, choose **Credential to connect with → Create new credential**, paste the key into **API Key** and click **Save**. n8n tests the key against `GET /api/v1/me` and shows "Connection tested successfully".
3. The same credential works for the trigger and for the FormEmpire node.

Keys are account-wide: revoke a key in FormEmpire → API if it leaks, and every workflow using it stops with a 401.

## Usage examples

### Example 1: Post every new order to Slack

1. Add **FormEmpire Trigger**. Select the credential, pick the form under **Form Name or ID** (the list is loaded from your account), leave **Include Abandoned Fills** off.
2. Click **Listen for test event**, then submit the form once in your browser. The trigger outputs one item like this:

```json
{
  "event": "submission.created",
  "form": { "id": "cm…", "name": "Order form" },
  "submission": { "id": "cm…", "createdAt": "2026-10-09T10:15:00.000Z", "partial": false, "url": "https://formempire.hu/app/bekuldesek/cm…" },
  "answers": { "name": "Anna Kiss", "email": "anna@example.com", "quantity": 3 },
  "fields": [{ "id": "f…", "key": "name", "label": "Name", "type": "short", "value": "Anna Kiss", "text": "Anna Kiss" }]
}
```

3. Add a **Slack** node (or any other node) and use expressions such as `{{ $json.answers.name }}` and `{{ $json.submission.url }}` in the message.
4. Activate the workflow. FormEmpire registers the production webhook URL automatically; deactivating the workflow removes the subscription again.

### Example 2: List the latest submissions of a form

1. Add the **FormEmpire** node with **Resource: Submission** and **Operation: Get Many**.
2. Pick the form, set **Limit** to 20, and under **Options** set **Since** to a date or an expression such as `{{ $now.minus({ days: 1 }) }}`.
3. Execute the step. Each submission is returned as one item with `id`, `createdAt`, `status`, `tags`, `note` and `answers` keyed by field key. Turn on **Return All** to page through every submission automatically.

### Example 3: Mark a submission as done and tag it

1. After a trigger or a Get Many step, add the **FormEmpire** node with **Resource: Submission** and **Operation: Update**.
2. Set **Submission ID** to `{{ $json.submission.id }}` (from the trigger) or `{{ $json.id }}` (from Get Many).
3. Under **Update Fields** add **Status: Done**, **Tags: `n8n, processed`** (comma-separated) and optionally a **Note**.
4. Execute the step; the node returns the updated submission.

### Example 4: Use FormEmpire as an AI Agent tool

Add an **AI Agent** node, open its **Tools** input and add **FormEmpire** (for instance Form → Get Many or Submission → Get Many). The agent can then answer questions like "How many orders came in today?" by calling the node itself.

## Operations

| Resource | Operation | What it does |
|---|---|---|
| Form | Get | Returns a form with its fields (id, key, label, type) |
| Form | Get Many | Lists the forms of the account |
| Submission | Get | Returns one submission by ID |
| Submission | Get Many | Lists submissions of a form, with `Limit`/`Return All`, `Since`, `Include Abandoned Fills` and `Order` |
| Submission | Update | Changes `status` (New, In Progress, Quote Sent, Accepted, Rejected, Done), `tags` and `note` |

API reference: https://formempire.hu/api-dokumentacio

## Develop

`npm install`, `npm run build`, `npm run lint`. Releases are published from GitHub Actions with provenance when a `v*` tag is pushed (`npm run release`).

## License

MIT
