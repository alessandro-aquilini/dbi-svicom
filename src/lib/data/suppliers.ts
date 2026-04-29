export type SupplierType = 'condominiale' | 'residenziale';
export type SupplierStatus = 'affidabile' | 'attivo' | 'in-corso' | 'da-monitorare';

export interface Supplier {
	id: string; // References User.id
	type: SupplierType;
	category: string;
	status: SupplierStatus;
	rating: number;
	servicesOffered: string[];
	tags: string[];
	availability: 'disponibile' | 'occupato' | 'fuori-servizio';
}

export const suppliers: Supplier[] = [
	{
		id: 'frn-idroclima-nord',
		type: 'condominiale',
		category: 'Impianti idraulici',
		status: 'affidabile',
		rating: 4.8,
		servicesOffered: ['manutenzione caldaie', 'reparazione perdite', 'installazione condizionatori'],
		tags: ['veloce', 'certificato'],
		availability: 'disponibile'
	},
	{
		id: 'frn-secure-entry',
		type: 'condominiale',
		category: 'Accessi e videocitofonia',
		status: 'in-corso',
		rating: 4.5,
		servicesOffered: ['riparazione citofoni', 'installazione telecamere'],
		tags: ['tecnologico'],
		availability: 'disponibile'
	},
	{
		id: 'frn-green-habit',
		type: 'condominiale',
		category: 'Giardinaggio',
		status: 'attivo',
		rating: 4.7,
		servicesOffered: ['potatura alberi', 'manutenzione prato'],
		tags: ['eco-friendly'],
		availability: 'disponibile'
	},
	{
		id: 'frn-thermo-audit',
		type: 'condominiale',
		category: 'Compliance termica',
		status: 'da-monitorare',
		rating: 4.1,
		servicesOffered: ['certificazioni energetiche', 'audit termico'],
		tags: ['specializzato'],
		availability: 'occupato'
	},
	{
		id: 'frn-pet-care-milano',
		type: 'residenziale',
		category: 'Cura animali',
		status: 'attivo',
		rating: 4.9,
		servicesOffered: ['dog walking', 'pet sitting'],
		tags: ['amici-degli-animali'],
		availability: 'disponibile'
	},
	{
		id: 'frn-babycare-studio',
		type: 'residenziale',
		category: 'Famiglia',
		status: 'attivo',
		rating: 4.7,
		servicesOffered: ['baby sitting', 'aiuto compiti'],
		tags: ['paziente'],
		availability: 'disponibile'
	},
	{
		id: 'frn-wellness-lab',
		type: 'residenziale',
		category: 'Benessere',
		status: 'affidabile',
		rating: 4.8,
		servicesOffered: ['personal training', 'yoga a domicilio'],
		tags: ['salute'],
		availability: 'disponibile'
	},
	{
		id: 'frn-casa-pulita',
		type: 'residenziale',
		category: 'Casa',
		status: 'attivo',
		rating: 4.4,
		servicesOffered: ['pulizie domestiche', 'stiro'],
		tags: ['affidabile'],
		availability: 'disponibile'
	},
	{
		id: 'frn-easy-shopping',
		type: 'residenziale',
		category: 'Mobilità',
		status: 'in-corso',
		rating: 4.2,
		servicesOffered: ['consegna spesa', 'commissioni'],
		tags: ['veloce'],
		availability: 'disponibile'
	}
];

export function getSupplierById(id: string): Supplier | undefined {
	return suppliers.find((s) => s.id === id);
}

export function getSuppliersByType(type: SupplierType): Supplier[] {
	return suppliers.filter((s) => s.type === type);
}
