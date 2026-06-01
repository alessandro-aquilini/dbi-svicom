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
	ticketId?: string; // Reference to a ticket
	bookingId?: string; // Reference to a ticket
	/** Timestamp when the task was created */
	createdAt?: string;
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
		,createdAt: '2026-05-01T10:45:00'
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
		,createdAt: '2026-05-01T14:30:00'
	},
	{
		id: 'int-003',
		title: 'Verifica perdite piano terra',
		type: 'sopralluogo',
		date: '2026-06-02',
		startTime: '09:00',
		endTime: '10:00',
		location: 'Corso Europa 7',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-europa-7',
		createdAt: '2026-06-01T08:00:00'
	},
	{
		id: 'int-004',
		title: 'Sostituzione radiatori scala B',
		type: 'intervento',
		date: '2026-06-03',
		startTime: '08:30',
		endTime: '12:30',
		location: 'Viale Monza 43',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giulia-02',
		propertyId: 'cnd-monza-43',
		createdAt: '2026-06-01T09:30:00'
	},
	{
		id: 'int-005',
		title: 'Manutenzione caldaia annuale',
		type: 'intervento',
		date: '2026-06-05',
		startTime: '14:00',
		endTime: '16:00',
		location: 'Via Plinio 12',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-plinio-12',
		createdAt: '2026-06-01T10:00:00'
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

export function createSupplierTask(task: Omit<supplierTask, 'id' | 'createdAt'>): supplierTask {
	const newTask: supplierTask = {
		...task,
		id: `int-${Math.random().toString(36).substr(2, 9)}`,
		createdAt: new Date().toISOString()
	};
	supplierTasks.push(newTask);
	return newTask;
}
