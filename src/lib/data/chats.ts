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
			// messages for this conversation have been migrated into the related report.messageTimeline
		],
		reportIds: ['rep-001', 'rep-005']
	},
	{
		id: 'chat-adm-res-bellini-05',
		participantIds: ['adm-giorgio-01', 'res-bellini-05'],
		lastMessageAt: '2026-05-01T09:15:00Z',
		messages: [],
		reportIds: ['rep-002']
	},
	{
		id: 'chat-adm-res-conti-02',
		participantIds: ['adm-giorgio-01', 'res-conti-02'],
		lastMessageAt: '2026-05-03T16:00:00Z',
		messages: [],
		reportIds: ['rep-003']
	},
	{
		id: 'chat-adm-res-rossi-03',
		participantIds: ['adm-giorgio-01', 'res-rossi-03'],
		lastMessageAt: '2026-05-05T11:00:00Z',
		messages: [],
		// Note: report rep-004 exists but chat messages were left empty; message timeline lives on the report
		reportIds: ['rep-004']
	},
	{
		id: 'chat-adm-idroclima',
		participantIds: ['adm-giorgio-01', 'frn-idroclima-nord'],
		lastMessageAt: '2026-05-01T12:05:00Z',
		messages: [
			// messages migrated into the ticket.messageTimeline (tkt-001)
		],
		ticketIds: ['tkt-001']
	},
	{
		id: 'chat-adm-secure',
		participantIds: ['adm-giorgio-01', 'frn-secure-entry'],
		lastMessageAt: '2026-05-04T09:05:00Z',
		messages: [
			// messages migrated into the ticket.messageTimeline (tkt-002)
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
