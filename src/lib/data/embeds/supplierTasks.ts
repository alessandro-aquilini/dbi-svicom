export interface supplierTask {
	id: string;
	title: string;
    type: 'sopralluogo' | 'intervento';
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	supplierId: string; // References User.id
	customerId: string; // References User.id (Admin or Resident)
	propertyId: string;
	ticketId: string; // Reference to a ticket
}

export const supplierTasks: supplierTask[] = [
	{
		id: 'int-001',
		title: 'Sopralluogo tecnico collettore',
		type: 'sopralluogo',
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
		type: 'intervento',
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

export function getSupplierTaskById(id: string): supplierTask | undefined {
	return supplierTasks.find((m) => m.id === id);
}

export function getSupplierTasksByPropertyId(propertyId: string): supplierTask[] {
	return supplierTasks.filter((m) => m.propertyId === propertyId);
}

export function getSupplierTasksByTicketId(ticketId: string): supplierTask[] {
	return supplierTasks.filter((m) => m.ticketId === ticketId);
}
