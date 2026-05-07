export type ResidentType = 'proprietario' | 'inquilino' | 'familiare';

export interface Resident {
	id: string; // References User.id
	propertyId: string;
	apartment: string;
	type: ResidentType;
	preferences?: {
		notifications: boolean;
		newsletter: boolean;
	};
}

export const residents: Resident[] = [
	{
		id: 'res-bianchi-01',
		propertyId: 'cnd-marconi-14',
		apartment: 'Scala B - Interno 5',
		type: 'proprietario',
		preferences: { notifications: true, newsletter: true }
	},
	{
		id: 'res-conti-02',
		propertyId: 'cnd-europa-7',
		apartment: 'Interno 12',
		type: 'inquilino',
		preferences: { notifications: true, newsletter: false }
	},
	{
		id: 'res-rossi-03',
		propertyId: 'cnd-verdi-3',
		apartment: 'Scala A - Interno 3',
		type: 'proprietario',
		preferences: { notifications: false, newsletter: true }
	},
	{
		id: 'res-greco-04',
		propertyId: 'cnd-carducci-21',
		apartment: 'Interno 7',
		type: 'familiare',
		preferences: { notifications: true, newsletter: true }
	},
	{
		id: 'res-bellini-05',
		propertyId: 'cnd-marconi-14',
		apartment: 'Interno 1',
		type: 'proprietario',
		preferences: { notifications: true, newsletter: true }
	},
	{
		id: 'res-ext-06',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 2',
		type: 'inquilino'
	},
	{
		id: 'res-ext-07',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 15',
		type: 'proprietario'
	},
	{
		id: 'res-ext-08',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 16',
		type: 'inquilino'
	},
	{
		id: 'res-ext-09',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 3',
		type: 'proprietario'
	}
];

export function getResidentById(id: string): Resident | undefined {
	return residents.find((r) => r.id === id);
}

export function getResidentsByPropertyId(propertyId: string): Resident[] {
	return residents.filter((r) => r.propertyId === propertyId);
}
