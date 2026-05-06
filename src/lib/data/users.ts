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
		id: 'adm-svicom-01', // TODO: Change the ID. 
		role: 'admin',
		name: 'Giorgio Amministratore',
		email: 'giorgio@gmail.it',
		phone: '+39 02 4567 8900'
	},
	{
		id: 'adm-svicom-02',
		role: 'admin',
		name: 'Matteo Amministratore',
		email: 'matteo@gmail.it',
		phone: '+39 06 1234 5678'
	},
	{
		id: 'adm-svicom-03',
		role: 'admin',
		name: 'Ludovica Amministratore',
		email: 'ludovica@gmail.it',
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
		id: 'frn-idroclima-nord',
		role: 'supplier',
		name: 'Idroclima Nord',
		email: 'operativo@idroclimanord.it',
		phone: '+39 02 3344 5566'
	},
	{
		id: 'frn-secure-entry',
		role: 'supplier',
		name: 'Secure Entry',
		email: 'tecnici@secureentry.it',
		phone: '+39 02 7788 9900'
	},
	{
		id: 'frn-green-habit',
		role: 'supplier',
		name: 'Green Habit',
		email: 'cantiere@greenhabit.it',
		phone: '+39 02 1122 3344'
	},
	{
		id: 'frn-thermo-audit',
		role: 'supplier',
		name: 'Thermo Audit',
		email: 'compliance@thermoaudit.it',
		phone: '+39 02 5566 7788'
	},
	{
		id: 'frn-pet-care-milano',
		role: 'supplier',
		name: 'Pet Care Milano',
		email: 'prenotazioni@petcaremilano.it',
		phone: '+39 02 9988 7766'
	},
	{
		id: 'frn-babycare-studio',
		role: 'supplier',
		name: 'BabyCare Studio Milano',
		email: 'studio@babycaremilano.it',
		phone: '+39 02 4455 6677'
	},
	{
		id: 'frn-wellness-lab',
		role: 'supplier',
		name: 'Wellness Lab Milano',
		email: 'agenda@wellnesslabmilano.it',
		phone: '+39 02 3322 1100'
	},
	{
		id: 'frn-casa-pulita',
		role: 'supplier',
		name: 'Casa Pulita Milano',
		email: 'info@casapulitamilano.it',
		phone: '+39 02 6677 8899'
	},
	{
		id: 'frn-easy-shopping',
		role: 'supplier',
		name: 'Easy Shopping Milano',
		email: 'ordini@easyshoppingmilano.it',
		phone: '+39 02 1199 8877'
	}
];

export function getUserById(id: string): User | undefined {
	return users.find((u) => u.id === id);
}
