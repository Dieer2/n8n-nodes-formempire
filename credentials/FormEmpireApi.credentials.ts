import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

// FormEmpire API-kulcs (Pro csomagtól): az ügyfél a FormEmpire → API oldalon készíti.
export class FormEmpireApi implements ICredentialType {
	name = 'formEmpireApi';
	displayName = 'FormEmpire API';
	documentationUrl = 'https://formempire.hu/app/api';
	icon: Icon = { light: 'file:../nodes/FormEmpire/formempire.svg', dark: 'file:../nodes/FormEmpire/formempire.dark.svg' };
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Create one in FormEmpire under API (Pro plan and up). It starts with fe_live_.',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } },
	};
	test: ICredentialTestRequest = {
		request: { baseURL: 'https://formempire.hu/api/v1', url: '/me' },
	};
}
