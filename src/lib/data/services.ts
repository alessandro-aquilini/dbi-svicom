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
	requiresQuote: boolean;
	workflowType: 'instant' | 'quote_based';
	availableAtPropertyIds: string[];
	enabledAtPropertyIds: string[]; // The admin can enable disable stuff. 
	isPublicMarketplace: boolean;
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
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],
		isPublicMarketplace: true,
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
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3'],
		isPublicMarketplace: false,
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
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-verdi-3', 'cnd-carducci-21'],
		enabledAtPropertyIds: ['cnd-verdi-3'],
		isPublicMarketplace: true,
		contactEmail: 'info@wellnessstudio.it',
		contactPhone: '+39 02 555 445',
		comments: []
	},
	{
		id: 'srv-riparazione-caldaia',
		name: 'Riparazione Caldaia Privata',
		description: 'Intervento tecnico per guasti a caldaie private, include diagnosi e preventivo.',
		category: 'benessere', // Or a new category if needed
		status: 'attivo',
		pricing: 'Su preventivo',
		rating: 4.8,
		supplierId: 'frn-tecnico-caldaie',
		requiresQuote: true,
		workflowType: 'quote_based',
		availableAtPropertyIds: ['cnd-marconi-14'],
		enabledAtPropertyIds: ['cnd-marconi-14'],
		isPublicMarketplace: false,
		contactEmail: 'assistenza@tecnicocaldaie.it',
		contactPhone: '+39 02 111 222',
		comments: []
	},
	{
		id: 'srv-installazione-climatizzatore',
		name: 'Installazione Condizionatore',
		description: 'Installazione e messa in servizio di condizionatori domestici (monosplit/multisplit). Include sopralluogo e preventivo tecnico.',
		category: 'benessere',
		status: 'attivo',
		pricing: 'Su preventivo',
		rating: 4.7,
		supplierId: 'frn-idroclima-nord',
		requiresQuote: true,
		workflowType: 'quote_based',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],
		isPublicMarketplace: false,
		contactEmail: 'installazioni@idroclima.it',
		contactPhone: '+39 02 333 444',
		comments: []
	},
	{
		id: 'srv-manutenzione-scarichi',
		name: 'Manutenzione Scarichi e Spurghi',
		description: 'Interventi di spurgo, pulizia e manutenzione degli scarichi domestici e condominiali. Intervento rapido per emergenze.',
		category: 'pulizie',
		status: 'attivo',
		pricing: '€80/intervento',
		rating: 4.7,
		supplierId: 'frn-spurghi-veloci',
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-pacini-44', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-pacini-44', 'cnd-solari-30'],
		isPublicMarketplace: false,
		contactEmail: 'info@spurghiveloci.it',
		contactPhone: '+39 02 444 555',
		comments: []
	},
	{
		id: 'srv-riparazione-citofono',
		name: 'Riparazione Citofono / Videocitofono',
		description: 'Assistenza e riparazione per citofoni e videocitofoni, sostituzione componenti e aggiornamenti software/hardware.',
		category: 'benessere',
		status: 'attivo',
		pricing: '€60/intervento',
		rating: 4.5,
		supplierId: 'frn-secure-entry',
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		isPublicMarketplace: false,
		contactEmail: 'support@secureentry.it',
		contactPhone: '+39 02 222 333',
		comments: []
	},
	{
		id: 'srv-check-termico',
		name: 'Check Termico / Controllo Caldaia',
		description: 'Controllo preventivo del corretto funzionamento dell’impianto termico e verifica sicurezza caldaia (check stagionale).',
		category: 'benessere',
		status: 'attivo',
		pricing: '€50/check',
		rating: 4.6,
		supplierId: 'frn-idroclima-nord',
		requiresQuote: false,
		workflowType: 'instant',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-verdi-3', 'cnd-carducci-21'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-verdi-3', 'cnd-carducci-21'],
		isPublicMarketplace: true,
		contactEmail: 'assistenza@idroclima.it',
		contactPhone: '+39 02 333 444',
		comments: []
	}
];
export function getServiceById(id: string): Service | undefined {
	return services.find((s) => s.id === id);
}

export function getAllServices(): Service[] {
	return services;
}
