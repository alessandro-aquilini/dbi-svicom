// NOTE: A service is just for Residents. 
// NOTE: Since Admin don't see it I've removed the PropertyId. 
// NOTE: In thoery services, can be offered by Suppliers, for simplicity in this demo we'll do that they are done by serviceProviders. 

export type ServiceCategory = 'cura-animali' | 'famiglia' | 'benessere' | 'casa' | 'mobilita';
export type ServiceStatus = 'attivo' | 'beta' | 'in-richiesta';

export interface ResidentialService {
	id: string;
	name: string;
	category: ServiceCategory;
	description: string;
	contact: {
		phone: string;
		email: string;
	};
	pricing: string;
	status: ServiceStatus;
	rating: number;
	comments: { author: string; date: string; text: string }[]; // feedback from residents
}

export const residentialServices: ResidentialService[] = [
	{
		id: 'svz-dog-sitting',
		name: 'Dog sitting',
		category: 'cura-animali',
		description:
			'Passeggiate e custodia del cane a domicilio o in zona. Aggiornamenti con foto e breve report dopo ogni uscita.',
		contact: {
			phone: '+39 345 678 9012',
			email: 'bau@petcare-milano.it'
		},
		pricing: '€18/h',
		status: 'attivo',
		rating: 4.9,
		comments: [
			{
				author: 'Giulia',
				date: '2026-04-10T09:00:00Z',
				text: 'Molto affidabili, ci mandano foto dopo ogni passeggiata.'
			},
			{
				author: 'Marco',
				date: '2026-04-12T11:30:00Z',
				text: 'Il mio cane è sempre felice al ritorno, consigliatissimi.'
			}
		]
	},
	{
		id: 'svz-baby-sitting',
		name: 'Baby sitting',
		category: 'famiglia',
		description:
			'Assistenza ai bambini a domicilio, fasce orarie flessibili. Personale formato per prime cure e aiuto compiti.',
		contact: {
			phone: '+39 333 444 5555',
			email: 'info@babycare-studio.com'
		},
		pricing: '€15/h',
		status: 'attivo',
		rating: 4.7,
		comments: [
			{
				author: 'Federica',
				date: '2026-03-15T17:00:00Z',
				text: 'I babysitter sono sempre puntuali e molto pazienti.'
			},
			{
				author: 'Nicola',
				date: '2026-03-18T20:10:00Z',
				text: 'Mio figlio ha migliorato i voti grazie all’aiuto compiti.'
			}
		]
	},
	{
		id: 'svz-osteopata',
		name: 'Osteopata a domicilio',
		category: 'benessere',
		description:
			'Sedute di osteopatia in casa, su appuntamento. Trattamenti mirati per dolori muscolari e ripristino funzionale.',
		contact: {
			phone: '+39 320 111 2233',
			email: 'benessere@wellnesslab.it'
		},
		pricing: 'A partire da €60/sessione',
		status: 'attivo',
		rating: 4.8,
		comments: [
			{
				author: 'Alessandro',
				date: '2026-02-24T10:00:00Z',
				text: 'Terapia efficace, ho notato miglioramenti dopo poche sedute.'
			},
			{
				author: 'Sara',
				date: '2026-02-26T14:20:00Z',
				text: 'Professionale e preciso nella diagnosi e trattamento.'
			}
		]
	},
	{
		id: 'svz-pulizie',
		name: 'Pulizie domestiche',
		category: 'casa',
		description:
			'Servizio di pulizia professionale per appartamenti. Include sanificazione superfici e pulizia vetri su richiesta.',
		contact: {
			phone: '+39 392 555 6677',
			email: 'servizi@lucidocasa.it'
		},
		pricing: '€20/h',
		status: 'attivo',
		rating: 4.6,
		comments: [
			{
				author: 'Elena',
				date: '2026-01-10T08:30:00Z',
				text: 'Personale discreto e molto meticoloso.'
			}
		]
	},
	{
		id: 'svz-lavanderia',
		name: 'Lavanderia a domicilio',
		category: 'casa',
		description:
			'Ritiro e consegna vestiti lavati e stirati entro 48 ore. Specializzati in capi delicati e tendaggi.',
		contact: {
			phone: '+39 02 445566',
			email: 'ordini@lavanderiaexpress.it'
		},
		pricing: 'A consumo',
		status: 'attivo',
		rating: 4.5,
		comments: [
			{
				author: 'Roberto',
				date: '2026-03-05T12:00:00Z',
				text: 'Comodissimo per le camicie, arrivano perfette.'
			}
		]
	},
	{
		id: 'svz-carsharing',
		name: 'Car sharing condominiale',
		category: 'mobilita',
		description:
			'Veicolo elettrico a disposizione dei residenti nel parcheggio condominiale. Prenotazione rapida tramite app.',
		contact: {
			phone: '+39 800 123 456',
			email: 'supporto@mobility-svicom.it'
		},
		pricing: '€0,25/minuto',
		status: 'beta',
		rating: 4.9,
		comments: [
			{
				author: 'Lorenzo',
				date: '2026-04-20T18:45:00Z',
				text: 'Auto sempre carica e pulita. Un servizio utilissimo.'
			}
		]
	}
];

export function getServiceById(id: string): ResidentialService | undefined {
	return residentialServices.find((s) => s.id === id);
}

export function getAllServices(): ResidentialService[] {
	return residentialServices;
}
