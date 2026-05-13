// SUPPLIER -> A company that serves an entire condominium. 

export type SupplierType = 'Condominium' | 'Residential' | 'Both';

export interface Comment { 
	authorId: string; // Use only admins as authors.
	date: string; // ISO timestamp
	text: string;
}

export interface Supplier {
	id: string; // References User.id
	type: SupplierType;
	description: string;
	category: string;
	rating: number;
	availability: 'disponibile' | 'occupato' | 'fuori-servizio';
	propertyIds: string[];
	serviceIds?: string[]; // References Service.id
	/** Human-friendly residential services offered by this supplier (optional) */
	residentialServices?: string[];
	comments?: Comment[];
	tags?: string[];
}

export const suppliers: Supplier[] = [
	{
		id: 'frn-idroclima-nord',
		type: 'Both',
		description:
			'Specialisti in impianti idraulici e termici: manutenzione caldaie condominiali, riparazione perdite e installazione di condizionatori. Interventi rapidi e certificati.',
		category: 'Impianti idraulici',
		rating: 4.8,
		tags: ['veloce', 'certificato'],
		availability: 'disponibile',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-verdi-3', 'cnd-carducci-21', 'cnd-pacini-44', 'cnd-solari-30', 'cnd-tortona-12'],
		serviceIds: ['srv-pulizie-extra'],
		comments: [
			{
				authorId: 'adm-giorgio-01',
				date: '2026-04-20T10:15:00Z',
				text: 'Intervento rapido e pulito durante l’urgenza in reparto caldaie.'
			},
			{
				authorId: 'adm-ludovica-03',
				date: '2026-04-22T09:40:00Z',
				text: 'Personale professionale, ci hanno spiegato tutto chiaramente.'
			}
		],
	},
	{
		id: 'frn-secure-entry',
		type: 'Condominium',
		category: 'Accessi e videocitofonia',
		description:
			'Servizi per accessi condominiali e videocitofonia: riparazione citofoni e installazione telecamere con soluzioni smart per controllo accessi.',
		rating: 4.5,
		availability: 'disponibile',
		tags: ['tecnologico'], 
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7', 'cnd-solari-30'],
		comments: [
			{
				authorId: 'adm-matteo-02',
				date: '2026-03-10T14:05:00Z',
				text: 'Installazione svolta in giornata, ottimo supporto post-installazione.'
			},
			{
				authorId: 'adm-ludovica-03',
				date: '2026-03-12T11:20:00Z',
				text: 'Sistema integrato con app: pratico e sicuro.'
			}
		],
	},
	{
		id: 'frn-pet-care-h24',
		type: 'Residential',
		category: 'Cura animali',
		description: 'Specialisti nella cura dei vostri animali domestici, disponibili 24/7 per ogni necessità.',
		rating: 4.9,
		availability: 'disponibile',
		propertyIds: ['cnd-marconi-14', 'cnd-europa-7'],
		serviceIds: ['srv-pet-sitting-premium'],
		residentialServices: ['Pet-sitting 24/7'],
		comments: [
			{
				authorId: 'adm-matteo-02',
				date: '2026-05-02T15:00:00Z',
				text: 'Molto professionali e amanti degli animali.'
			}
		]
	},
	{
		id: 'frn-wellness-studio',
		type: 'Residential',
		category: 'Benessere',
		description: 'Corsi di yoga e pilates direttamente nel tuo condominio o a casa tua.',
		rating: 4.6,
		availability: 'occupato',
		propertyIds: ['cnd-verdi-3', 'cnd-carducci-21'],
		serviceIds: ['srv-benessere-yoga'],
		residentialServices: ['Yoga a domicilio', 'Pilates in condominio'],
		comments: []
	},
	{
		id: 'frn-spurghi-veloci',
		type: 'Condominium',
		category: 'Manutenzione scarichi',
		description: 'Manutenzione preventiva e pronto intervento per scarichi e fognature condominiali.',
		rating: 4.7,
		availability: 'disponibile',
		propertyIds: ['cnd-pacini-44', 'cnd-solari-30'],
		comments: [
			{
				authorId: 'adm-giorgio-01',
				date: '2026-02-14T08:30:00Z',
				text: 'Intervento risolutivo in brevissimo tempo.'
			}
		]
	},
	{
		id: 'frn-tecnico-caldaie',
		type: 'Both',
		category: 'Termoidraulica',
		description: 'Specialista in caldaie e sistemi di riscaldamento privati.',
		rating: 4.9,
		availability: 'disponibile',
		propertyIds: ['cnd-marconi-14'],
		serviceIds: ['srv-riparazione-caldaia'],
		comments: []
	},
];

export function getSupplierById(id: string): Supplier | undefined {
	return suppliers.find((s) => s.id === id);
}