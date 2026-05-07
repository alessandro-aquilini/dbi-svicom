import { browser } from '$app/environment';
import { getUserById, type User, type UserRole } from '$lib/data/users';

export interface DemoCredential {
	id: string;
	role: UserRole;
	label: string;
	description: string;
	email: string;
	password: string;
}

export const demoCredentials: DemoCredential[] = [
	{
		id: 'adm-giorgio-01',
		role: 'admin',
		label: 'Amministratore',
		description: 'Giorgo Svicom',
		email: 'giorgio.svicom@svicom.it',
		password: 'svicom-demo'
	},
	{
		id: 'plt-svicom-hq',
		role: 'svicom',
		label: 'Svicom',
		description: 'Platform orchestrator',
		email: 'platform@svicom.it',
		password: 'svicom-demo'
	},
	{
		id: 'res-bianchi-01',
		role: 'resident',
		label: 'Residente',
		description: 'Marco Bianchi',
		email: 'marco.bianchi@example.it',
		password: 'residente-demo'
	},
	{
		id: 'frn-idroclima-nord',
		role: 'supplier',
		label: 'Fornitore',
		description: 'Idroclima Nord',
		email: 'operativo@idroclimanord.it',
		password: 'fornitore-demo'
	}
];

const STORAGE_KEY = 'svicom_demo_current_user';
let currentUserId: string | null = null;

if (browser) {
	currentUserId = localStorage.getItem(STORAGE_KEY);
}

export function getCurrentUserId(): string | null {
	return currentUserId;
}

export function getCurrentUser(): User | undefined {
	return currentUserId ? getUserById(currentUserId) : undefined;
}

export function loginUser(id: string) {
	currentUserId = id;
	if (browser) {
		localStorage.setItem(STORAGE_KEY, id);
	}
}

export function logoutUser() {
	currentUserId = null;
	if (browser) {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export function getCredentialById(id: string): DemoCredential | undefined {
	return demoCredentials.find((credential) => credential.id === id);
}

export function getCredentialByEmail(email: string): DemoCredential | undefined {
	return demoCredentials.find((credential) => credential.email === email);
}

export function getUserFromCredential(credential: DemoCredential): User | undefined {
	return getUserById(credential.id);
}
