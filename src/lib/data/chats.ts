export interface MessageAction {
	type: 'ticket' | 'payment' | 'quote' | 'invoice';
	referenceId: string;
	label: string;
}

export interface Message {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string;
	action?: MessageAction;
}

export interface Chat {
	id: string;
	participantIds: string[]; // References User.id
	lastMessageAt: string;
	messages: Message[];
}

export const chats: Chat[] = [
	{
		id: 'chat-adm-idroclima',
		participantIds: ['adm-giorgio-01', 'frn-idroclima-nord'],
		lastMessageAt: '2026-05-01T12:05:00Z',
		messages: [
			{
				id: 'msg-101',
				senderId: 'adm-giorgio-01',
				text: 'Ciao, abbiamo un\'emergenza a Via Marconi 14. Perdita nel locale caldaia e manca acqua calda nella scala B. Ti ho aperto un ticket.',
				timestamp: '2026-05-01T10:05:00Z',
				action: { type: 'ticket', referenceId: 'tkt-001', label: 'Vedi Ticket' }
			},
			{
				id: 'msg-102',
				senderId: 'frn-idroclima-nord',
				text: 'Ricevuto Giorgio. Mando subito un tecnico per un sopralluogo. Ti aggiorno tra poco.',
				timestamp: '2026-05-01T10:10:00Z'
			},
			{
				id: 'msg-103',
				senderId: 'frn-idroclima-nord',
				text: 'Trovata la perdita. È il collettore principale, va sostituita anche una valvola. Ti ho caricato il preventivo.',
				timestamp: '2026-05-01T11:45:00Z',
				action: { type: 'quote', referenceId: 'quo-001', label: 'Dettagli Preventivo' }
			},
			{
				id: 'msg-104',
				senderId: 'adm-giorgio-01',
				text: 'Procedi pure, è urgente. Fammi sapere appena l\'acqua calda è ripristinata.',
				timestamp: '2026-05-01T12:05:00Z'
			}
		]
	},
	{
		id: 'chat-adm-secure',
		participantIds: ['adm-giorgio-01', 'frn-secure-entry'],
		lastMessageAt: '2026-05-04T09:05:00Z',
		messages: [
			{
				id: 'msg-201',
				senderId: 'adm-giorgio-01',
				text: 'Buongiorno, ci segnalano problemi al videocitofono in Corso Europa 7. Non arriva l\'immagine.',
				timestamp: '2026-05-03T16:40:00Z',
				action: { type: 'ticket', referenceId: 'tkt-002', label: 'Vedi Ticket' }
			},
			{
				id: 'msg-202',
				senderId: 'frn-secure-entry',
				text: 'Buongiorno Giorgio, passiamo domani mattina a controllare.',
				timestamp: '2026-05-03T17:30:00Z'
			},
			{
				id: 'msg-203',
				senderId: 'frn-secure-entry',
				text: 'Telecamera guasta, va sostituito il modulo. Ti ho inviato il preventivo nel ticket.',
				timestamp: '2026-05-04T09:05:00Z',
				action: { type: 'quote', referenceId: 'quo-002', label: 'Vedi Preventivo' }
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
