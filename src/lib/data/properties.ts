// Condomini 

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
	status: PropertyStatus;
	health: PropertyHealth;
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
		status: 'attivo',
		health: 'giallo',
		tags: ['storico', 'centro']
	},
	{
		id: 'cnd-europa-7',
		name: 'Corso Europa 7',
		address: { street: 'Corso Europa 7', city: 'Milano', cap: '20122', province: 'MI' },
		units: 32,
		adminId: 'adm-svicom-01',
		residentIds: ['res-conti-02'],
		status: 'attivo',
		health: 'verde',
		tags: ['direzionale-misto']
	},
	{
		id: 'cnd-verdi-3',
		name: 'Piazza Verdi 3',
		address: { street: 'Piazza Giuseppe Verdi 3', city: 'Milano', cap: '20131', province: 'MI' },
		units: 18,
		adminId: 'adm-svicom-01',
		residentIds: ['res-rossi-03'],
		status: 'attivo',
		health: 'verde',
		tags: []
	},
	{
		id: 'cnd-carducci-21',
		name: 'Via Carducci 21',
		address: { street: 'Via Giosuè Carducci 21', city: 'Milano', cap: '20123', province: 'MI' },
		units: 12,
		adminId: 'adm-svicom-01',
		residentIds: ['res-greco-04'],
		status: 'attivo',
		health: 'rosso',
		tags: ['ristrutturazione-in-corso']
	},
	{
		id: 'cnd-pacini-44',
		name: 'Via Pacini 44',
		address: { street: 'Via Filippo Pacini 44', city: 'Milano', cap: '20131', province: 'MI' },
		units: 28,
		adminId: 'adm-svicom-01',
		residentIds: ['res-ext-05', 'res-ext-06', 'res-ext-10', 'res-ext-11', 'res-ext-12', 'res-ext-13', 'res-ext-14', 'res-ext-15', 'res-ext-16', 'res-ext-17', 'res-ext-18', 'res-ext-19'],
		status: 'onboarding',
		health: 'giallo',
		tags: ['nuovo']
	},
	{
		id: 'cnd-solari-30',
		name: 'Via Solari 30',
		address: { street: 'Via Andrea Solari 30', city: 'Milano', cap: '20144', province: 'MI' },
		units: 40,
		adminId: 'adm-svicom-01',
		residentIds: ['res-ext-07', 'res-ext-08', 'res-ext-20', 'res-ext-21', 'res-ext-22', 'res-ext-23', 'res-ext-24', 'res-ext-25', 'res-ext-26', 'res-ext-27', 'res-ext-28', 'res-ext-29'],
		status: 'attivo',
		health: 'verde',
		tags: []
	},
	{
		id: 'cnd-tortona-12',
		name: 'Via Tortona 12',
		address: { street: 'Via Tortona 12', city: 'Milano', cap: '20144', province: 'MI' },
		units: 22,
		adminId: 'adm-svicom-01',
		residentIds: ['res-ext-09', 'res-ext-30', 'res-ext-31', 'res-ext-32', 'res-ext-33', 'res-ext-34', 'res-ext-35', 'res-ext-36', 'res-ext-37', 'res-ext-38', 'res-ext-39'],
		status: 'in-uscita',
		health: 'rosso',
		tags: ['in-uscita-q3']
	}
];

export function getPropertyById(id: string): Property | undefined {
	return properties.find((p) => p.id === id);
}

export function getPropertiesByAdminId(adminId: string): Property[] {
	return properties.filter((p) => p.adminId === adminId);
}
