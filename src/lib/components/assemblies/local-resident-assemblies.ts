import { browser } from '$app/environment';
import type { Assembly } from '$lib/data/assemblies';
import { normalizeAssemblyText } from './presentation';

const RESIDENT_ASSEMBLY_VOTES_STORAGE_KEY = 'svicom_resident_assembly_votes';
const RESIDENT_ASSEMBLY_PROXY_STORAGE_KEY = 'svicom_resident_assembly_proxy';

export type ResidentAssemblyVoteChoice = 'favorevole' | 'contrario' | 'astenuto' | 'non_espresso';

export interface ResidentAssemblyVoteItem {
	id: string;
	label: string;
	copy: string;
}

export interface ResidentAssemblyVoteRecord {
	assemblyId: string;
	residentId: string;
	submittedAt: string;
	votes: Array<ResidentAssemblyVoteItem & { choice: ResidentAssemblyVoteChoice }>;
}

export interface ResidentAssemblyProxyRecord {
	assemblyId: string;
	residentId: string;
	delegateName: string;
	delegateEmail: string;
	delegatePhone: string;
	notes: string;
	submittedAt: string;
}

export const residentAssemblyVoteOptions: Array<{
	value: ResidentAssemblyVoteChoice;
	label: string;
	copy: string;
}> = [
	{ value: 'favorevole', label: 'Favorevole', copy: 'Supporti il punto in discussione.' },
	{ value: 'contrario', label: 'Contrario', copy: 'Non approvi la proposta in votazione.' },
	{ value: 'astenuto', label: 'Astenuto', copy: 'Partecipi ma non esprimi preferenza.' },
	{ value: 'non_espresso', label: 'Da definire', copy: 'Puoi completare la scelta in un secondo momento.' }
];

function readJsonArray<T>(storageKey: string): T[] {
	if (!browser) return [];

	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeJsonArray<T>(storageKey: string, value: T[]) {
	if (!browser) return;
	localStorage.setItem(storageKey, JSON.stringify(value));
}

export function getResidentAssemblyVoteItems(assembly: Assembly): ResidentAssemblyVoteItem[] {
	if (assembly.minutes?.resolutions.length) {
		return assembly.minutes.resolutions.map((resolution) => ({
			id: resolution.id,
			label: normalizeAssemblyText(resolution.title),
			copy: resolution.notes ? normalizeAssemblyText(resolution.notes) : 'Delibera in votazione.'
		}));
	}

	return assembly.agenda.map((agendaItem, index) => ({
		id: `${assembly.id}-agenda-${index + 1}`,
		label: normalizeAssemblyText(agendaItem),
		copy: 'Punto programmato nell ordine del giorno della sessione.'
	}));
}

export function saveResidentAssemblyVote(record: ResidentAssemblyVoteRecord) {
	const records = getResidentAssemblyVotes().filter(
		(item) => !(item.assemblyId === record.assemblyId && item.residentId === record.residentId)
	);

	writeJsonArray(RESIDENT_ASSEMBLY_VOTES_STORAGE_KEY, [record, ...records]);
}

export function getResidentAssemblyVotes(): ResidentAssemblyVoteRecord[] {
	return readJsonArray<ResidentAssemblyVoteRecord>(RESIDENT_ASSEMBLY_VOTES_STORAGE_KEY);
}

export function getResidentAssemblyVoteRecord(
	assemblyId: string,
	residentId: string | undefined
): ResidentAssemblyVoteRecord | undefined {
	if (!residentId) return undefined;

	return getResidentAssemblyVotes().find(
		(record) => record.assemblyId === assemblyId && record.residentId === residentId
	);
}

export function saveResidentAssemblyProxy(record: ResidentAssemblyProxyRecord) {
	const records = getResidentAssemblyProxyRecords().filter(
		(item) => !(item.assemblyId === record.assemblyId && item.residentId === record.residentId)
	);

	writeJsonArray(RESIDENT_ASSEMBLY_PROXY_STORAGE_KEY, [record, ...records]);
}

export function getResidentAssemblyProxyRecords(): ResidentAssemblyProxyRecord[] {
	return readJsonArray<ResidentAssemblyProxyRecord>(RESIDENT_ASSEMBLY_PROXY_STORAGE_KEY);
}

export function getResidentAssemblyProxyRecord(
	assemblyId: string,
	residentId: string | undefined
): ResidentAssemblyProxyRecord | undefined {
	if (!residentId) return undefined;

	return getResidentAssemblyProxyRecords().find(
		(record) => record.assemblyId === assemblyId && record.residentId === residentId
	);
}
