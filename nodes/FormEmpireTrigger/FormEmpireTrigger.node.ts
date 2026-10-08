import type { IHookFunctions, ILoadOptionsFunctions, INodePropertyOptions, INodeType, INodeTypeDescription, IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

const BASE = 'https://formempire.hu/api/v1';

// Kiváltó: a FormEmpire feliratkozik az n8n webhook-címére (REST hook), és minden új beküldést azonnal elküld.
export class FormEmpireTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FormEmpire Trigger',
		name: 'formEmpireTrigger',
		icon: 'file:formempire.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=New submission',
		description: 'Starts the workflow when a FormEmpire form receives a submission',
		defaults: { name: 'FormEmpire Trigger' },
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'formEmpireApi', required: true }],
		webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
		properties: [
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getForms' },
				default: '',
				required: true,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Include Abandoned Fills',
				name: 'partial',
				type: 'boolean',
				default: false,
				description: 'Whether to also trigger when a visitor stops filling in the form (after 20 minutes of inactivity)',
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

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (!data.webhookId) return false;
				const formId = this.getNodeParameter('formId') as string;
				const r = (await this.helpers.httpRequestWithAuthentication.call(this, 'formEmpireApi', { method: 'GET', url: `${BASE}/forms/${formId}/webhooks`, json: true })) as { data: { id: string; url: string }[] };
				const url = this.getNodeWebhookUrl('default');
				const found = r.data.find((w) => w.id === data.webhookId && w.url === url);
				if (!found) delete data.webhookId;
				return !!found;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				const formId = this.getNodeParameter('formId') as string;
				const r = (await this.helpers.httpRequestWithAuthentication.call(this, 'formEmpireApi', {
					method: 'POST', url: `${BASE}/forms/${formId}/webhooks`, json: true,
					body: { url: this.getNodeWebhookUrl('default'), name: 'n8n', partial: this.getNodeParameter('partial') as boolean },
				})) as { id: string };
				data.webhookId = r.id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId) {
					try { await this.helpers.httpRequestWithAuthentication.call(this, 'formEmpireApi', { method: 'DELETE', url: `${BASE}/webhooks/${data.webhookId}`, json: true }); } catch { /* már nincs meg: rendben */ }
					delete data.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
