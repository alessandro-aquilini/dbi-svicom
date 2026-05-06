// SUPPLIER -> A company that serves an entire condominium. 

export interface Comment {
	author: string;
	date: string; // ISO timestamp
	text: string;
}

export interface Supplier {
	id: string; // References User.id
	category: string;
	rating: number;
	availability: 'disponibile' | 'occupato' | 'fuori-servizio';
	description: string;
	propertyIds: string[];
	comments?: Comment[];
	tags?: string[];
}

export const suppliers: Supplier[] = [
	{
		id: 'frn-idroclima-nord',
		category: 'Impianti idraulici',
		rating: 4.8,
		availability: 'disponibile',
		description:
			'Specialisti in impianti idraulici e termici: manutenzione caldaie condominiali, riparazione perdite e installazione di condizionatori. Interventi rapidi e certificati.',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3', 'cnd-carducci-21', 'cnd-pacini-44', 'cnd-solari-30', 'cnd-tortona-12'],
		comments: [
			{
				author: 'Admin Luca',
				date: '2026-04-20T10:15:00Z',
				text: 'Intervento rapido e pulito durante l’urgenza in reparto caldaie.'
			},
			{
				author: 'Admin Marta',
				date: '2026-04-22T09:40:00Z',
				text: 'Personale professionale, ci hanno spiegato tutto chiaramente.'
			}
		],
		tags: ['veloce', 'certificato']
	},
	{
		id: 'frn-termoservice-milano',
		category: 'Impianti idraulici',
		rating: 4.6,
		availability: 'disponibile',
		description:
			'Manutenzione impianti di riscaldamento centralizzato e condizionamento. Specializzati in grandi complessi residenziali e pronto intervento idraulico.',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30', 'cnd-verdi-3'],
		comments: [
			{
				author: 'Admin Elisa',
				date: '2026-05-02T11:20:00Z',
				text: 'Ottima gestione del cambio valvole su intera colonna.'
			}
		],
		tags: ['specializzato', 'affidabile']
	},
	{
		id: 'frn-idraulica-smart',
		category: 'Impianti idraulici',
		rating: 4.3,
		availability: 'occupato',
		description:
			'Soluzioni innovative per il risparmio idrico condominiale e riparazioni urgenti. Monitoraggio perdite tramite sensori IoT.',
		propertyIds: ['cnd-pacini-44', 'cnd-solari-30', 'cnd-tortona-12'],
		comments: [
			{
				author: 'Admin Marco',
				date: '2026-03-15T09:45:00Z',
				text: 'Tecnologia interessante per il rilevamento perdite, ma costi sopra la media.'
			}
		],
		tags: ['tecnologico']
	},
	{
		id: 'frn-secure-entry',
		category: 'Accessi e videocitofonia',
		rating: 4.5,
		availability: 'disponibile',
		description:
			'Servizi per accessi condominiali e videocitofonia: riparazione citofoni e installazione telecamere con soluzioni smart per controllo accessi.',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		comments: [
			{
				author: 'Admin Marco',
				date: '2026-03-10T14:05:00Z',
				text: 'Installazione svolta in giornata, ottimo supporto post-installazione.'
			},
			{
				author: 'Admin Elisa',
				date: '2026-03-12T11:20:00Z',
				text: 'Sistema integrato con app: pratico e sicuro.'
			}
		],
		tags: ['tecnologico']
	},
	{
		id: 'frn-access-pro',
		category: 'Accessi e videocitofonia',
		rating: 4.2,
		availability: 'disponibile',
		description:
			'Specializzati in cancelli automatici e portoncini blindati condominiali. Manutenzione programmata e riparazione serrature elettroniche.',
		propertyIds: ['cnd-verdi-3', 'cnd-carducci-21', 'cnd-pacini-44'],
		comments: [
			{
				author: 'Admin Laura',
				date: '2026-02-28T16:30:00Z',
				text: 'Hanno risolto il problema al cancello carraio dopo vari tentativi di altri.'
			}
		],
		tags: ['veloce']
	},
	{
		id: 'frn-green-habit',
		category: 'Giardinaggio',
		rating: 4.7,
		availability: 'disponibile',
		description:
			'Giardinieri professionisti per potatura alberi e manutenzione prato; soluzioni eco-friendly per aree verdi condominiali.',
		propertyIds: ['cnd-europa-7', 'cnd-verdi-3', 'cnd-carducci-21', 'cnd-solari-30'],
		comments: [
			{
				author: 'Admin Paolo',
				date: '2026-01-18T08:12:00Z',
				text: 'Ottimo lavoro sul verde comune, rispettosi delle piante.'
			},
			{
				author: 'Admin Silvia',
				date: '2026-01-20T16:45:00Z',
				text: 'Programma di manutenzione chiaro e puntuale.'
			}
		],
		tags: ['eco-friendly']
	},
	{
		id: 'frn-natura-viva',
		category: 'Giardinaggio',
		rating: 4.4,
		availability: 'disponibile',
		description:
			'Progettazione e cura di giardini condominiali e tetti verdi. Specializzati in impianti di irrigazione a basso consumo idrico.',
		propertyIds: ['cnd-marconi-14', 'cnd-tortona-12', 'cnd-solari-30'],
		comments: [
			{
				author: 'Admin Giovanni',
				date: '2026-04-05T14:20:00Z',
				text: 'Propongono soluzioni moderne per il risparmio d’acqua.'
			}
		],
		tags: ['eco-friendly', 'certificato']
	},
	{
		id: 'frn-thermo-audit',
		category: 'Compliance termica',
		rating: 4.1,
		availability: 'occupato',
		description:
			'Audit termico e certificazioni energetiche: analisi termica degli edifici e reportistica per adeguamenti normativi.',
		propertyIds: ['cnd-marconi-14', 'cnd-tortona-12'],
		comments: [
			{
				author: 'Admin Giovanni',
				date: '2026-02-02T09:00:00Z',
				text: 'Report dettagliato ma tempi di consegna un po’ lunghi.'
			},
			{
				author: 'Admin Anna',
				date: '2026-02-05T12:30:00Z',
				text: 'Competenti nella diagnostica termica, consigli utili per miglioramenti.'
			}
		],
		tags: ['specializzato']
	},
	{
		id: 'frn-global-cleaning-hub',
		category: 'Pulizie e Sanificazione',
		rating: 4.5,
		availability: 'disponibile',
		description:
			'Impresa di pulizie specializzata in grandi condomini. Servizi di pulizia scale, vetrate, aree comuni e sanificazione periodica.',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30', 'cnd-pacini-44', 'cnd-verdi-3'],
		comments: [
			{
				author: 'Admin Marta',
				date: '2026-03-30T10:00:00Z',
				text: 'Personale fidato e molto attento alla pulizia del locale spazzatura.'
			}
		],
		tags: ['affidabile', 'certificato']
	},
	{
		id: 'frn-service-clean-24',
		category: 'Pulizie e Sanificazione',
		rating: 4.1,
		availability: 'disponibile',
		description:
			'Servizi di pulizia professionale per uffici e condomini. Flessibilità oraria e utilizzo di prodotti ecologici certificati.',
		propertyIds: ['cnd-carducci-21', 'cnd-tortona-12'],
		comments: [
			{
				author: 'Admin Luca',
				date: '2026-04-12T08:15:00Z',
				text: 'Prezzi competitivi, qualità standard.'
			}
		],
		tags: ['veloce']
	}
];

export function getSupplierById(id: string): Supplier | undefined {
	return suppliers.find((s) => s.id === id);
}