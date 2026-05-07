// NOTE: For service we mean Residential Services. The one that a supplier offer to the all condominium, aren't services. 

export type ServiceCategory = 'cura-animali' | 'benessere' | 'pulizie' | 'mobilita';
export type ServiceStatus = 'attivo' | 'beta' | 'in-richiesta';

export interface Service {
	id: string;
	name: string;
	description: string;
	category: ServiceCategory;
	status: ServiceStatus;
	pricing: string;
	rating: number;
	supplierId: string; // references Supplier.id / User.id
	// NOTE: The contact email / phone for the get service, is different from the general one. 
	contactEmail?: string; 
	contactPhone?: string;
	comments: { authorId: string; date: string; text: string }[]; // feedback from residents
}

export const services: Service[] = [
	{
		id: 'srv-pet-sitting-premium',
		name: 'Pet Sitting Premium',
		description: 'Dog walking e compagnia per gatti a domicilio, servizio professionale e assicurato.',
		category: 'cura-animali',
		status: 'attivo',
		pricing: '€15/ora',
		rating: 4.9,
		supplierId: 'frn-pet-care-h24',
		contactEmail: 'reservations@petcareh24.it',
		contactPhone: '+39 02 999 889',
		comments: [
			{
				authorId: 'res-conti-02',
				date: '2026-05-01T10:00:00Z',
				text: 'Servizio eccellente, il mio cane è felicissimo!'
			}
		]
	},
	{
		id: 'srv-pulizie-extra',
		name: 'Pulizie Appartamento Extra',
		description: 'Pulizia profonda post-cantiere o stagionale effettuata con prodotti eco-friendly.',
		category: 'pulizie',
		status: 'attivo',
		pricing: '€20/ora',
		rating: 4.7,
		supplierId: 'frn-clean-green',
		contactEmail: 'booking@cleangreen.it',
		contactPhone: '+39 02 777 667',
		comments: [
			{
				authorId: 'res-bianchi-01',
				date: '2026-04-15T09:30:00Z',
				text: 'Tutto perfetto e profumato.'
			}
		]
	},
	{
		id: 'srv-benessere-yoga',
		name: 'Yoga in Condominio',
		description: 'Lezioni di yoga collettive nelle aree comuni o individuali a domicilio.',
		category: 'benessere',
		status: 'beta',
		pricing: '€10/persona',
		rating: 4.5,
		supplierId: 'frn-wellness-studio',
		contactEmail: 'info@wellnessstudio.it',
		contactPhone: '+39 02 555 445',
		comments: []
	}
];

export function getServiceById(id: string): Service | undefined {
	return services.find((s) => s.id === id);
}

export function getAllServices(): Service[] {
	return services;
}
