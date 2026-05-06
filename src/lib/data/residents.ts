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
		id: 'res-ext-05',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 1',
		type: 'proprietario'
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
	},
	{
		id: 'res-ext-10',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 10',
		type: 'proprietario'
	},
	{
		id: 'res-ext-11',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 11',
		type: 'inquilino'
	},
	{
		id: 'res-ext-12',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 12',
		type: 'proprietario'
	},
	{
		id: 'res-ext-13',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 13',
		type: 'proprietario'
	},
	{
		id: 'res-ext-14',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 14',
		type: 'inquilino'
	},
	{
		id: 'res-ext-15',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 15',
		type: 'proprietario'
	},
	{
		id: 'res-ext-16',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 16',
		type: 'proprietario'
	},
	{
		id: 'res-ext-17',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 17',
		type: 'inquilino'
	},
	{
		id: 'res-ext-18',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 18',
		type: 'proprietario'
	},
	{
		id: 'res-ext-19',
		propertyId: 'cnd-pacini-44',
		apartment: 'Interno 19',
		type: 'proprietario'
	},
	{
		id: 'res-ext-20',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 20',
		type: 'proprietario'
	},
	{
		id: 'res-ext-21',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 21',
		type: 'inquilino'
	},
	{
		id: 'res-ext-22',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 22',
		type: 'proprietario'
	},
	{
		id: 'res-ext-23',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 23',
		type: 'proprietario'
	},
	{
		id: 'res-ext-24',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 24',
		type: 'inquilino'
	},
	{
		id: 'res-ext-25',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 25',
		type: 'proprietario'
	},
	{
		id: 'res-ext-26',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 26',
		type: 'proprietario'
	},
	{
		id: 'res-ext-27',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 27',
		type: 'inquilino'
	},
	{
		id: 'res-ext-28',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 28',
		type: 'proprietario'
	},
	{
		id: 'res-ext-29',
		propertyId: 'cnd-solari-30',
		apartment: 'Interno 29',
		type: 'proprietario'
	},
	{
		id: 'res-ext-30',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 30',
		type: 'proprietario'
	},
	{
		id: 'res-ext-31',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 31',
		type: 'inquilino'
	},
	{
		id: 'res-ext-32',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 32',
		type: 'proprietario'
	},
	{
		id: 'res-ext-33',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 33',
		type: 'proprietario'
	},
	{
		id: 'res-ext-34',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 34',
		type: 'inquilino'
	},
	{
		id: 'res-ext-35',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 35',
		type: 'proprietario'
	},
	{
		id: 'res-ext-36',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 36',
		type: 'proprietario'
	},
	{
		id: 'res-ext-37',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 37',
		type: 'inquilino'
	},
	{
		id: 'res-ext-38',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 38',
		type: 'proprietario'
	},
	{
		id: 'res-ext-39',
		propertyId: 'cnd-tortona-12',
		apartment: 'Interno 39',
		type: 'proprietario'
	}
];

export function getResidentById(id: string): Resident | undefined {
	return residents.find((r) => r.id === id);
}

export function getResidentsByPropertyId(propertyId: string): Resident[] {
	return residents.filter((r) => r.propertyId === propertyId);
}
