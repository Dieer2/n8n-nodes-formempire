import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription, IHttpRequestMethods, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const BASE = 'https://formempire.hu/api/v1';

// Beküldések lekérése és módosítása a FormEmpire API-val.
export class FormEmpire implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FormEmpire',
		name: 'formEmpire',
		icon: { light: 'file:formempire.svg', dark: 'file:formempire.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read and update FormEmpire form submissions',
		defaults: { name: 'FormEmpire' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'formEmpireApi', required: true }],
		requestDefaults: { baseURL: BASE, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Form', value: 'form' },
					{ name: 'Submission', value: 'submission' },
				],
				default: 'submission',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['form'] } },
				options: [
					{ name: 'Get', value: 'get', description: 'Get a form and its fields', action: 'Get a form' },
					{ name: 'Get Many', value: 'getAll', description: 'List your forms', action: 'Get many forms' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['submission'] } },
				options: [
					{ name: 'Get', value: 'get', description: 'Get a submission', action: 'Get a submission' },
					{ name: 'Get Many', value: 'getAll', description: 'List submissions of a form', action: 'Get many submissions' },
					{ name: 'Update', value: 'update', description: 'Change status, tags or note', action: 'Update a submission' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getForms' },
				default: '',
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: { show: { resource: ['form'], operation: ['get'] } },
			},
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getForms' },
				default: '',
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: { show: { resource: ['submission'], operation: ['getAll'] } },
			},
			{
				displayName: 'Submission ID',
				name: 'submissionId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['submission'], operation: ['get', 'update'] } },
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: { show: { resource: ['submission'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['submission'], operation: ['getAll'], returnAll: [false] } },
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['submission'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Since', name: 'since', type: 'dateTime', default: '', description: 'Only submissions after this time' },
					{ displayName: 'Include Abandoned Fills', name: 'partial', type: 'boolean', default: false, description: 'Whether to include partial (abandoned) fills' },
					{ displayName: 'Order', name: 'order', type: 'options', options: [{ name: 'Newest First', value: 'desc' }, { name: 'Oldest First', value: 'asc' }], default: 'desc' },
				],
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add field',
				default: {},
				displayOptions: { show: { resource: ['submission'], operation: ['update'] } },
				options: [
					{ displayName: 'Status', name: 'status', type: 'options', default: 'DONE', options: [
						{ name: 'Accepted', value: 'ACCEPTED' }, { name: 'Done', value: 'DONE' }, { name: 'In Progress', value: 'IN_PROGRESS' },
						{ name: 'New', value: 'NEW' }, { name: 'Quote Sent', value: 'SENT' }, { name: 'Rejected', value: 'REJECTED' },
					] },
					{ displayName: 'Tags', name: 'tags', type: 'string', default: '', description: 'Comma-separated list' },
					{ displayName: 'Note', name: 'note', type: 'string', typeOptions: { rows: 3 }, default: '' },
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const r = (await this.helpers.httpRequestWithAuthentication.call(this, 'formEmpireApi', { method: 'GET', url: `${BASE}/forms`, json: true })) as { data: { id: string; name: string }[] };
				return r.data.map((f) => ({ name: f.name, value: f.id }));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const call = async (method: IHttpRequestMethods, url: string, body?: object, qs?: Record<string, string | number | boolean>) =>
			this.helpers.httpRequestWithAuthentication.call(this, 'formEmpireApi', { method, url: `${BASE}${url}`, body, qs, json: true });

		for (let i = 0; i < items.length; i++) {
			try {
				let result: unknown;
				if (resource === 'form' && operation === 'getAll') {
					result = ((await call('GET', '/forms')) as { data: unknown[] }).data;
				} else if (resource === 'form' && operation === 'get') {
					result = await call('GET', `/forms/${this.getNodeParameter('formId', i)}`);
				} else if (resource === 'submission' && operation === 'get') {
					result = await call('GET', `/submissions/${this.getNodeParameter('submissionId', i)}`);
				} else if (resource === 'submission' && operation === 'update') {
					const f = this.getNodeParameter('updateFields', i) as { status?: string; tags?: string; note?: string };
					const body: Record<string, unknown> = {};
					if (f.status) body.status = f.status;
					if (f.tags !== undefined) body.tags = f.tags.split(',').map((t) => t.trim()).filter(Boolean);
					if (f.note !== undefined) body.note = f.note;
					result = await call('PATCH', `/submissions/${this.getNodeParameter('submissionId', i)}`, body);
				} else if (resource === 'submission' && operation === 'getAll') {
					const formId = this.getNodeParameter('formId', i) as string;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const limit = returnAll ? 100 : (this.getNodeParameter('limit', i) as number);
					const o = this.getNodeParameter('options', i) as { since?: string; partial?: boolean; order?: string };
					const all: unknown[] = [];
					let cursor: string | null = null;
					do {
						const qs: Record<string, string | number | boolean> = { limit: Math.min(100, limit - all.length || 100), order: o.order ?? 'desc' };
						if (o.since) qs.since = new Date(o.since).toISOString();
						if (o.partial) qs.partial = true;
						if (cursor) qs.cursor = cursor;
						const page = (await call('GET', `/forms/${formId}/submissions`, undefined, qs)) as { data: unknown[]; nextCursor: string | null };
						all.push(...page.data);
						cursor = page.nextCursor;
					} while (cursor && (returnAll || all.length < limit));
					result = returnAll ? all : all.slice(0, limit);
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported: ${resource}.${operation}`, { itemIndex: i });
				}
				const rows = Array.isArray(result) ? result : [result];
				for (const r of rows) out.push({ json: r as IDataObject, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) { out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } }); continue; }
				if (error instanceof NodeOperationError) throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}
		return [out];
	}
}
