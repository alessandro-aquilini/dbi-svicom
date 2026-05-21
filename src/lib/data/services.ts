// NOTE: For service we mean Residential Services. The one that a supplier offer to the all condominium, aren't services. 

export type ServiceCategory = 'cura-animali' | 'benessere' | 'pulizie' | 'mobilita';

export interface Service {
	id: string;
	name: string;
	description: string;
	category: ServiceCategory;
	pricing: string;
	rating: number;
	supplierId: string; // references Supplier.id / User.id
	availabilityText?: string; // human friendly availability description
	availableAtPropertyIds: string[];
	enabledAtPropertyIds: string[]; // The admin can enable disable stuff. 
	// note: marketplace visibility removed; availabilityText should be used instead
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
		pricing: '€15/ora',
		rating: 4.9,
		supplierId: 'frn-pet-care-h24',
		availabilityText: 'Disponibile tutti i giorni 08:00–20:00',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],

		contactEmail: 'reservations@petcareh24.it',
		contactPhone: '+39 02 999 889',
		comments: [
			{
				authorId: 'res-conti-02',
				date: '2026-05-01T10:00:00',
				text: 'Servizio eccellente, il mio cane è felicissimo!'
			}
		]
	},
	{
		id: 'srv-pulizie-extra',
		name: 'Pulizie Appartamento Extra',
		description: 'Pulizia profonda post-cantiere o stagionale effettuata con prodotti eco-friendly.',
		category: 'pulizie',
		pricing: '€20/ora',
		rating: 2.7,
		supplierId: 'frn-clean-green',
		availabilityText: 'Su appuntamento, orario da concordare',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3'],

		contactEmail: 'booking@cleangreen.it',
		contactPhone: '+39 02 777 667',
		comments: [
			{
				authorId: 'res-bianchi-01',
				date: '2026-04-15T09:30:00',
				text: 'Tutto perfetto e profumato.'
			}
		]
	},
	{
		id: 'srv-benessere-yoga',
		name: 'Yoga in Condominio',
		description: 'Lezioni di yoga collettive nelle aree comuni o individuali a domicilio.',
		category: 'benessere',
		pricing: '€10/persona',
		rating: 4.5,
		supplierId: 'frn-wellness-studio',
		availabilityText: 'Weekend e serale, orari variabili (contattare il fornitore)',
		availableAtPropertyIds: ['cnd-verdi-3', 'cnd-carducci-21'],
		enabledAtPropertyIds: ['cnd-verdi-3'],

		contactEmail: 'info@wellnessstudio.it',
		contactPhone: '+39 02 555 445',
		comments: []
	},
	{
		id: 'srv-riparazione-caldaia',
		name: 'Riparazione Caldaia Privata',
		description: 'Intervento tecnico per guasti a caldaie private, include diagnosi e preventivo.',
		category: 'benessere', // Or a new category if needed
		pricing: 'Su preventivo',
		rating: 3.5,
		supplierId: 'frn-tecnico-caldaie',
		availabilityText: 'Sopralluogo e preventivo, servizio su appuntamento',
		availableAtPropertyIds: ['cnd-marconi-14'],
		enabledAtPropertyIds: ['cnd-marconi-14'],

		contactEmail: 'assistenza@tecnicocaldaie.it',
		contactPhone: '+39 02 111 222',
		comments: []
	},
	{
		id: 'srv-installazione-climatizzatore',
		name: 'Installazione Condizionatore',
		description: 'Installazione e messa in servizio di condizionatori domestici (monosplit/multisplit). Include sopralluogo e preventivo tecnico.',
		category: 'benessere',
		pricing: 'Su preventivo',
		rating: 4.7,
		supplierId: 'frn-idroclima-nord',
		availabilityText: 'Installazioni su appuntamento, sopralluogo gratuito',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7'],

		contactEmail: 'installazioni@idroclima.it',
		contactPhone: '+39 02 333 444',
		comments: []
	},
	{
		id: 'srv-manutenzione-scarichi',
		name: 'Manutenzione Scarichi e Spurghi',
		description: 'Interventi di spurgo, pulizia e manutenzione degli scarichi domestici e condominiali. Intervento rapido per emergenze.',
		category: 'pulizie',
		pricing: '€80/intervento',
		rating: 4.7,
		supplierId: 'frn-spurghi-veloci',
		availabilityText: 'Servizio emergenza 24/7 per i condomini abilitati',
		availableAtPropertyIds: ['cnd-pacini-44', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-pacini-44', 'cnd-solari-30'],

		contactEmail: 'info@spurghiveloci.it',
		contactPhone: '+39 02 444 555',
		comments: []
	},
	{
		id: 'srv-riparazione-citofono',
		name: 'Riparazione Citofono / Videocitofono',
		description: 'Assistenza e riparazione per citofoni e videocitofoni, sostituzione componenti e aggiornamenti software/hardware.',
		category: 'benessere',
		pricing: '€60/intervento',
		rating: 4.5,
		supplierId: 'frn-secure-entry',
		availabilityText: 'Intervento su chiamata, tempi medi 24–48h',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],

		contactEmail: 'support@secureentry.it',
		contactPhone: '+39 02 222 333',
		comments: []
	},
	{
		id: 'srv-check-termico',
		name: 'Check Termico',
		description: 'Controllo preventivo del corretto funzionamento dell’impianto termico e verifica sicurezza caldaia (check stagionale).',
		category: 'benessere',
		pricing: '€50/check',
		rating: 4.6,
		supplierId: 'frn-idroclima-nord',
		availabilityText: 'Check stagionale (autunno/primavera), prenotazione consigliata',
		availableAtPropertyIds: ['cnd-marconi-14', 'cnd-verdi-3', 'cnd-carducci-21'],
		enabledAtPropertyIds: ['cnd-marconi-14', 'cnd-verdi-3', 'cnd-carducci-21'],

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
