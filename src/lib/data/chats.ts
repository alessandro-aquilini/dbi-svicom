export interface Message {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string;
}

export interface Chat {
	id: string;
	participantIds: string[]; // References User.id
	lastMessageAt: string;
	messages: Message[];
	/** Ticket IDs referenced/opened from this conversation */
	ticketIds?: string[];
	/** Report IDs referenced/opened from this conversation */
	reportIds?: string[];
}

export const chats: Chat[] = [
	{
		id: 'chat-adm-res-bianchi-01',
		participantIds: ['adm-giorgio-01', 'res-bianchi-01'],
		lastMessageAt: '2026-05-01T09:15:00Z',
		messages: [
			{
				id: 'msg-res-001',
				senderId: 'adm-giorgio-01',
				text: 'Grazie Marco, ho preso in carico la segnalazione. Chiamo subito Idroclima.',
				timestamp: '2026-05-01T09:15:00Z'
			}
		],
		reportIds: ['rep-001', 'rep-005']
	},
	{
		id: 'chat-adm-res-bellini-05',
		participantIds: ['adm-giorgio-01', 'res-bellini-05'],
		lastMessageAt: '2026-05-01T09:15:00Z',
		messages: [
			{
				id: 'msg-res-101',
				senderId: 'res-bellini-05',
				text: 'Manca l\'acqua calda nella scala B da stamattina!',
				timestamp: '2026-05-01T07:45:00Z'
			},
			{
				id: 'msg-res-102',
				senderId: 'adm-giorgio-01',
				text: 'Sì, è collegato alla perdita in caldaia. Risolveremo in mattinata.',
				timestamp: '2026-05-01T09:15:00Z'
			}
		],
		reportIds: ['rep-002']
	},
	{
		id: 'chat-adm-res-conti-02',
		participantIds: ['adm-giorgio-01', 'res-conti-02'],
		lastMessageAt: '2026-05-03T16:00:00Z',
		messages: [
			{
				id: 'msg-res-201',
				senderId: 'res-conti-02',
				text: 'Ciao Giorgio, il videocitofono non funziona più bene. Non si vede nulla.',
				timestamp: '2026-05-03T14:20:00Z'
			},
			{
				id: 'msg-res-202',
				senderId: 'adm-giorgio-01',
				text: 'Ricevuto. Contatto Secure Entry per un controllo domani.',
				timestamp: '2026-05-03T16:00:00Z'
			}
		],
		reportIds: ['rep-003']
	},
	{
		id: 'chat-adm-res-rossi-03',
		participantIds: ['adm-giorgio-01', 'res-rossi-03'],
		lastMessageAt: '2026-05-05T11:00:00Z',
		messages: [
			// {
			// 	id: 'msg-res-301',
			// 	senderId: 'res-rossi-03',
			// 	text: 'Buongiorno, il portone d\'ingresso rimane aperto. Credo sia il braccio idraulico.',
			// 	timestamp: '2026-05-05T11:00:00Z'
			// }
			// FIX: Removing the chat (even though there is a report open), gives empty chat in "Segnalazioni". 
		],
		reportIds: ['rep-004']
	},
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
			},
			{
				id: 'msg-101-meta',
				senderId: 'adm-giorgio-01',
				text: 'Ticket aperto: tkt-001',
				timestamp: '2026-05-01T10:05:00Z'
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
				timestamp: '2026-05-01T11:45:00Z'
			},
			{
				id: 'msg-104',
				senderId: 'adm-giorgio-01',
				text: 'Procedi pure, è urgente. Fammi sapere appena l\'acqua calda è ripristinata.',
				timestamp: '2026-05-01T12:05:00Z'
			}
		],
		ticketIds: ['tkt-001']
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
				timestamp: '2026-05-03T16:40:00Z'
			},
			{
				id: 'msg-201-meta',
				senderId: 'adm-giorgio-01',
				text: 'Ticket aperto: tkt-002',
				timestamp: '2026-05-03T16:40:00Z'
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
				timestamp: '2026-05-04T09:05:00Z'
			}
		],
		ticketIds: ['tkt-002']
	}
];

export function getChatById(id: string): Chat | undefined {
	return chats.find((c) => c.id === id);
}

export function getChatsByUserId(userId: string): Chat[] {
	return chats.filter((c) => c.participantIds.includes(userId));
}
