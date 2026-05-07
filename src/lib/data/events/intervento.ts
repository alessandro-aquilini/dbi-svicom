export interface Intervento {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	supplierId: string; // References User.id
	customerId: string; // References User.id (Admin or Resident)
	propertyId: string;
	ticketId: string; // Reference to a ticket
}

export const interventi: Intervento[] = [
	{
		id: 'int-001',
		title: 'Sopralluogo tecnico collettore',
		date: '2026-05-01',
		startTime: '10:45',
		endTime: '11:30',
		location: 'Via Marconi 14 - Locale Tecnico',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'tkt-001'
	},
	{
		id: 'int-002',
		title: 'Riparazione collettore e sostituzione valvola',
		date: '2026-05-01',
		startTime: '14:30',
		endTime: '17:30',
		location: 'Via Marconi 14 - Locale Tecnico',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'tkt-001'
	}
];

export function getInterventoById(id: string): Intervento | undefined {
	return interventi.find((m) => m.id === id);
}

export function getInterventiByPropertyId(propertyId: string): Intervento[] {
	return interventi.filter((m) => m.propertyId === propertyId);
}

export function getInterventiByTicketId(ticketId: string): Intervento[] {
	return interventi.filter((m) => m.ticketId === ticketId);
}
