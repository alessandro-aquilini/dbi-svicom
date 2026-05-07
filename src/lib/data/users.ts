export type UserRole = 'admin' | 'resident' | 'supplier' | 'svicom';

export interface User {
	id: string;
	role: UserRole;
	name: string;
	email: string;
	phone?: string;
	avatar?: string;
}

export const users: User[] = [
	{
		id: 'plt-svicom-hq',
		role: 'svicom',
		name: 'Svicom Platform',
		email: 'platform@svicom.it',
		phone: '+39 02 0000 0001'
	},
	{
		id: 'adm-giorgio-01', 
		role: 'admin',
		name: 'Giorgio Limonta',
		email: 'giorgio.limonta@gmail.it',
		phone: '+39 02 4567 8900'
	},
	{
		id: 'adm-matteo-01',
		role: 'admin',
		name: 'Matteo Boleso',
		email: 'matteo.boleso@gmail.it',
		phone: '+39 06 1234 5678'
	},
	{
		id: 'adm-ludovica-01',
		role: 'admin',
		name: 'Ludovica Andreasi',
		email: 'ludovica.andreasi@gmail.it',
		phone: '+39 011 3344 556'
	},
	{
		id: 'res-bianchi-01',
		role: 'resident',
		name: 'Marco Bianchi',
		email: 'marco.bianchi@example.it',
		phone: '+39 333 1122 334'
	},
	{
		id: 'res-conti-02',
		role: 'resident',
		name: 'Elena Conti',
		email: 'elena.conti@example.it',
		phone: '+39 348 5566 778'
	},
	{
		id: 'res-rossi-03',
		role: 'resident',
		name: 'Luca Rossi',
		email: 'luca.rossi@example.it',
		phone: '+39 339 9988 776'
	},
	{
		id: 'res-greco-04',
		role: 'resident',
		name: 'Sara Greco',
		email: 'sara.greco@example.it',
		phone: '+39 347 4433 221'
	},
	{
		id: 'res-bellini-05',
		role: 'resident',
		name: 'Giulia Bellini',
		email: 'giulia.bellini@example.it',
		phone: '+39 333 2211 334'
	},
	{
		id: 'res-ext-06',
		role: 'resident',
		name: 'Marco Esposito',
		email: 'marco.esposito@example.it',
		phone: '+39 333 4455 667'
	},
	{
		id: 'res-ext-07',
		role: 'resident',
		name: 'Anna Moretti',
		email: 'anna.moretti@example.it',
		phone: '+39 333 7788 990'
	},
	{
		id: 'res-ext-08',
		role: 'resident',
		name: 'Davide Ricci',
		email: 'davide.ricci@example.it',
		phone: '+39 333 5566 221'
	},
	{
		id: 'res-ext-09',
		role: 'resident',
		name: 'Elisa Bruno',
		email: 'elisa.bruno@example.it',
		phone: '+39 333 6677 889'
	},
	{
		id: 'frn-idroclima-nord',
		role: 'supplier',
		name: 'Idroclima Nord',
		email: 'operativo@idroclimanord.it',
		phone: '+39 02 3344 5566'
	},
	{
		id: 'frn-termoservice-milano',
		role: 'supplier',
		name: 'Termoservice Milano',
		email: 'info@termoservicemilano.it',
		phone: '+39 02 1234 5678'
	},
	{
		id: 'frn-idraulica-smart',
		role: 'supplier',
		name: 'Idraulica Smart',
		email: 'tech@idraulicasmart.it',
		phone: '+39 02 9876 5432'
	},
	{
		id: 'frn-secure-entry',
		role: 'supplier',
		name: 'Secure Entry',
		email: 'tecnici@secureentry.it',
		phone: '+39 02 7788 9900'
	},
	{
		id: 'frn-access-pro',
		role: 'supplier',
		name: 'Access Pro',
		email: 'service@accesspro.it',
		phone: '+39 02 1122 3355'
	},
	{
		id: 'frn-green-habit',
		role: 'supplier',
		name: 'Green Habit',
		email: 'cantiere@greenhabit.it',
		phone: '+39 02 1122 3344'
	},
	{
		id: 'frn-natura-viva',
		role: 'supplier',
		name: 'Natura Viva',
		email: 'progetti@naturaviva.it',
		phone: '+39 02 6677 8811'
	},
	{
		id: 'frn-thermo-audit',
		role: 'supplier',
		name: 'Thermo Audit',
		email: 'compliance@thermoaudit.it',
		phone: '+39 02 5566 7788'
	},
	{
		id: 'frn-global-cleaning-hub',
		role: 'supplier',
		name: 'Global Cleaning Hub',
		email: 'info@globalcleaning.it',
		phone: '+39 02 9988 1122'
	},
	{
		id: 'frn-service-clean-24',
		role: 'supplier',
		name: 'Service Clean 24',
		email: 'servizi@clean24.it',
		phone: '+39 02 5544 3322'
	}
];

export function getUserById(id: string): User | undefined {
	return users.find((u) => u.id === id);
}
