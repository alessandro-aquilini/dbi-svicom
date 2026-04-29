export interface Message {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string;
	action?: {
		label: string;
		type: 'ticket' | 'quote' | 'payment' | 'event';
		referenceId: string;
	};
}

export interface Chat {
	id: string;
	participantIds: string[]; // References User.id
	lastMessageAt: string;
	messages: Message[];
}

export const chats: Chat[] = [
	{
		id: 'chat-001',
		participantIds: ['adm-svicom-01', 'res-bianchi-01'],
		lastMessageAt: '2024-04-29T11:00:00Z',
		messages: [
			{
				id: 'msg-001',
				senderId: 'res-bianchi-01',
				text: 'Buongiorno, ci sono novità sulla perdita d\'acqua?',
				timestamp: '2024-04-29T10:45:00Z'
			},
			{
				id: 'msg-002',
				senderId: 'adm-svicom-01',
				text: 'Sì, abbiamo incaricato Idroclima Nord. L\'intervento è previsto per oggi pomeriggio.',
				timestamp: '2024-04-29T10:50:00Z',
				action: {
					label: 'Vedi ticket',
					type: 'ticket',
					referenceId: 'TCK-482'
				}
			}
		]
	},
	{
		id: 'chat-002',
		participantIds: ['adm-svicom-01', 'frn-idroclima-nord'],
		lastMessageAt: '2024-04-29T09:30:00Z',
		messages: [
			{
				id: 'msg-101',
				senderId: 'adm-svicom-01',
				text: 'Potete intervenire oggi per la perdita a Via Marconi 14?',
				timestamp: '2024-04-29T09:15:00Z'
			},
			{
				id: 'msg-102',
				senderId: 'frn-idroclima-nord',
				text: 'Ricevuto. Invio preventivo per la riparazione urgente.',
				timestamp: '2024-04-29T09:20:00Z',
				action: {
					label: 'Dettaglio intervento',
					type: 'ticket',
					referenceId: 'TCK-482'
				}
			}
		]
	}
];

export function getChatById(id: string): Chat | undefined {
	return chats.find((c) => c.id === id);
}

export function getChatsByUserId(userId: string): Chat[] {
	return chats.filter((c) => c.participantIds.includes(userId));
}
