export type ServiceCategory = 'cura-animali' | 'famiglia' | 'benessere' | 'casa' | 'mobilita';
export type ServiceStatus = 'attivo' | 'beta' | 'in-richiesta';

export interface Service {
	id: string;
	name: string;
	category: ServiceCategory;
	description: string;
	providerId: string; // References User.id
	pricing: string;
	status: ServiceStatus;
	propertyIds: string[];
}

export const services: Service[] = [
	{
		id: 'svz-dog-sitting',
		name: 'Dog sitting',
		category: 'cura-animali',
		description: 'Passeggiate e custodia del cane a domicilio o in zona.',
		providerId: 'frn-pet-care-milano',
		pricing: '€18/h',
		status: 'attivo',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30']
	},
	{
		id: 'svz-baby-sitting',
		name: 'Baby sitting',
		category: 'famiglia',
		description: 'Assistenza ai bambini a domicilio, fasce orarie flessibili.',
		providerId: 'frn-babycare-studio',
		pricing: '€15/h',
		status: 'attivo',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3', 'cnd-pacini-44']
	},
	{
		id: 'svz-osteopata',
		name: 'Osteopata a domicilio',
		category: 'benessere',
		description: 'Sedute di osteopatia in casa, su appuntamento.',
		providerId: 'frn-wellness-lab',
		pricing: 'A partire da €60/sessione',
		status: 'attivo',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30']
	}
];

export function getServiceById(id: string): Service | undefined {
	return services.find((s) => s.id === id);
}

export function getServicesByPropertyId(propertyId: string): Service[] {
	return services.filter((s) => s.propertyIds.includes(propertyId));
}
