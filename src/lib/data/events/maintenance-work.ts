export interface MaintenanceWork {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	participantIds: string[]; // References User.id
	propertyId: string;
	ticketId: string; // Reference to a ticket
}

export const maintenanceWorks: MaintenanceWork[] = [
	{
		id: 'evt-manutenzione-ascensore-carducci',
		title: 'Manutenzione ascensore',
		date: '2026-04-15',
		startTime: '15:30',
		endTime: '16:00',
		location: 'Via Carducci 21',
		participantIds: ['frn-secure-entry', 'adm-giorgio-01'],
		propertyId: 'cnd-carducci-21',
		ticketId: 'TCK-476'
	}
];

export function getMaintenanceWorkById(id: string): MaintenanceWork | undefined {
	return maintenanceWorks.find((m) => m.id === id);
}

export function getMaintenanceWorksByPropertyId(propertyId: string): MaintenanceWork[] {
	return maintenanceWorks.filter((m) => m.propertyId === propertyId);
}

export function getMaintenanceWorksByTicketId(ticketId: string): MaintenanceWork[] {
	return maintenanceWorks.filter((m) => m.ticketId === ticketId);
}
