export type PropertyStatus = 'attivo' | 'onboarding' | 'in-uscita';
export type PropertyHealth = 'verde' | 'giallo' | 'rosso';

export interface PropertyAddress {
	street: string;
	city: string;
	cap: string;
	province: string;
}

export interface Property {
	id: string;
	name: string;
	address: PropertyAddress;
	units: number;
	adminId: string;
	residentIds: string[];
	supplierIds: string[];
	status: PropertyStatus;
	health: PropertyHealth;
	activeTickets: number;
	tags: string[];
}

export const properties: Property[] = [
	{
		id: 'cnd-marconi-14',
		name: 'Via Marconi 14',
		address: { street: 'Via Guglielmo Marconi 14', city: 'Milano', cap: '20121', province: 'MI' },
		units: 24,
		adminId: 'adm-svicom-01',
		residentIds: ['res-bianchi-01'],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-secure-entry',
			'frn-thermo-audit',
			'frn-pet-care-milano',
			'frn-babycare-studio',
			'frn-wellness-lab',
			'frn-casa-pulita',
			'frn-easy-shopping'
		],
		status: 'attivo',
		health: 'giallo',
		activeTickets: 6,
		tags: ['storico', 'centro']
	},
	{
		id: 'cnd-europa-7',
		name: 'Corso Europa 7',
		address: { street: 'Corso Europa 7', city: 'Milano', cap: '20122', province: 'MI' },
		units: 32,
		adminId: 'adm-svicom-01',
		residentIds: ['res-conti-02'],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-secure-entry',
			'frn-green-habit',
			'frn-pet-care-milano',
			'frn-babycare-studio',
			'frn-wellness-lab',
			'frn-easy-shopping'
		],
		status: 'attivo',
		health: 'verde',
		activeTickets: 3,
		tags: ['direzionale-misto']
	},
	{
		id: 'cnd-verdi-3',
		name: 'Piazza Verdi 3',
		address: { street: 'Piazza Giuseppe Verdi 3', city: 'Milano', cap: '20131', province: 'MI' },
		units: 18,
		adminId: 'adm-svicom-01',
		residentIds: ['res-rossi-03'],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-green-habit',
			'frn-babycare-studio',
			'frn-casa-pulita'
		],
		status: 'attivo',
		health: 'verde',
		activeTickets: 2,
		tags: []
	},
	{
		id: 'cnd-carducci-21',
		name: 'Via Carducci 21',
		address: { street: 'Via Giosuè Carducci 21', city: 'Milano', cap: '20123', province: 'MI' },
		units: 12,
		adminId: 'adm-svicom-01',
		residentIds: ['res-greco-04'],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-green-habit',
			'frn-wellness-lab',
			'frn-casa-pulita'
		],
		status: 'attivo',
		health: 'rosso',
		activeTickets: 9,
		tags: ['ristrutturazione-in-corso']
	},
	{
		id: 'cnd-pacini-44',
		name: 'Via Pacini 44',
		address: { street: 'Via Filippo Pacini 44', city: 'Milano', cap: '20131', province: 'MI' },
		units: 28,
		adminId: 'adm-svicom-01',
		residentIds: [],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-green-habit',
			'frn-babycare-studio',
			'frn-casa-pulita'
		],
		status: 'onboarding',
		health: 'giallo',
		activeTickets: 1,
		tags: ['nuovo']
	},
	{
		id: 'cnd-solari-30',
		name: 'Via Solari 30',
		address: { street: 'Via Andrea Solari 30', city: 'Milano', cap: '20144', province: 'MI' },
		units: 40,
		adminId: 'adm-svicom-01',
		residentIds: [],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-secure-entry',
			'frn-green-habit',
			'frn-pet-care-milano',
			'frn-wellness-lab'
		],
		status: 'attivo',
		health: 'verde',
		activeTickets: 4,
		tags: []
	},
	{
		id: 'cnd-tortona-12',
		name: 'Via Tortona 12',
		address: { street: 'Via Tortona 12', city: 'Milano', cap: '20144', province: 'MI' },
		units: 22,
		adminId: 'adm-svicom-01',
		residentIds: [],
		supplierIds: [
			'frn-idroclima-nord',
			'frn-thermo-audit'
		],
		status: 'in-uscita',
		health: 'rosso',
		activeTickets: 5,
		tags: ['in-uscita-q3']
	}
];

export function getPropertyById(id: string): Property | undefined {
	return properties.find((p) => p.id === id);
}

export function getPropertiesByAdminId(adminId: string): Property[] {
	return properties.filter((p) => p.adminId === adminId);
}
